import { response } from "express";
import dotenv from "dotenv";
import User from "../models/user.js";
import Task from "../models/task.js";
import { generateToken, cookieOptions } from "../utils/index.js";
import Notice from "../models/notification.js";
import jwt from "jsonwebtoken";
import { 
  createUserRegistrationNotification,
  createRoleChangeNotification,
  createSystemWideNotification
} from "../utils/notificationUtils.js";

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, title, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      title,
      role,
      isActive: true,
    });

    // Create notification for new user registration (admin notification)
    try {
      // Get admin users to notify them
      const adminUsers = await User.find({ isAdmin: true, isActive: true });
      if (adminUsers.length > 0) {
        await createUserRegistrationNotification(user._id, user._id, user.name);
      }
    } catch (noticeError) {
      console.error("Failed to create user registration notification:", noticeError);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      title: user.title,
      role: user.role,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password, role, superKey } = req.body;
    const user = await User.findOne({ email });

    if (role === "Admin") {
      if (!superKey || superKey != process.env.ADMIN_SUPER_KEY) {
        return res.status(401).json({ message: "Invalid super key for admin login" });
      }
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "User is not an admin" });
      }
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        title: user.title,
        role: user.role,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
export const logoutUser = (req, res) => {
  res.cookie("token", "", {
    ...cookieOptions,
    expires: new Date(0),
  });
  res.status(200).json({ status: true, message: "Logged out successfully" });
};

export const getTeamList = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    
    let users;
    
    if (isAdmin) {
      // Admins can see all users
      users = await User.find().select("name title role email isActive");
    } else {
      // Non-admins can only see team members they work with
      const teamMemberIds = await getTeamMemberIds(userId);
      users = await User.find({ 
        _id: { $in: teamMemberIds },
        isActive: true 
      }).select("name title role email isActive");
    }

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// Helper function to get team member IDs for a user
const getTeamMemberIds = async (userId) => {
  try {
    const tasks = await Task.find({ team: { $in: [userId] } });
    const teamMemberIds = new Set();
    
    tasks.forEach(task => {
      task.team.forEach(memberId => {
        teamMemberIds.add(memberId.toString());
      });
    });
    
    return Array.from(teamMemberIds);
  } catch (error) {
    console.error('Error getting team member IDs:', error);
    return [];
  }
};

export const getNotificationsList = async (req, res) => {
  try {
    const { userId } = req.user;

    const notice = await Notice.find({
      team: userId,
      isRead: { $nin: [userId] },
    }).populate("task", "title");

    res.status(201).json(notice);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        isActive: updatedUser.isActive,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const updateData = req.body;

    // Get the original user to compare changes
    const originalUser = await User.findById(id);
    if (!originalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if role was changed
    if (updateData.role && updateData.role !== originalUser.role) {
      try {
        await createRoleChangeNotification(
          user._id,
          userId,
          user.name,
          originalUser.role,
          updateData.role
        );
      } catch (noticeError) {
        console.error("Failed to create role change notification:", noticeError);
      }
    }

    // Check if user was activated/deactivated
    if (updateData.isActive !== undefined && updateData.isActive !== originalUser.isActive) {
      try {
        const notificationType = updateData.isActive ? "user_activated" : "user_deactivated";
        const text = updateData.isActive 
          ? `User "${user.name}" account has been activated.`
          : `User "${user.name}" account has been deactivated.`;

        await createSystemWideNotification(
          notificationType,
          userId,
          text,
          "normal",
          { userId: user._id, userName: user.name }
        );
      } catch (noticeError) {
        console.error("Failed to create user activation notification:", noticeError);
      }
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { userId } = req.user;

    const { isReadType, id } = req.query;

    if (isReadType === "all") {
      await Notice.updateMany(
        { team: userId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    } else {
      await Notice.findOneAndUpdate(
        { _id: id, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    }

    res.status(201).json({ status: true, message: "Done" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);

    if (user) {
      user.password = req.body.password;

      await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: `Password chnaged successfully.`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const activateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (user) {
      user.isActive = req.body.isActive; //!user.isActive

      await user.save();

      res.status(201).json({
        status: true,
        message: `User account has been ${
          user?.isActive ? "activated" : "disabled"
        }`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
