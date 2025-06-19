import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies or Authorization header
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({
          status: false,
          message: "User not found",
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          status: false,
          message: "User account is disabled",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const isAdminRoute = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({
      status: false,
      message: "Not authorized as admin",
    });
  }
};
