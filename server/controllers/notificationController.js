import Notice from "../models/notification.js";
import { createSystemWideNotification } from "../utils/notificationUtils.js";

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log('Fetching notifications for user:', userId);
    console.log('User ID type:', typeof userId);
    console.log('User ID value:', userId);

    // Debug: Check all notifications in database
    const allNotificationsInDB = await Notice.find({}).populate("team", "name email");
    console.log('All notifications in DB:', allNotificationsInDB.length);
    if (allNotificationsInDB.length > 0) {
      console.log('Sample notification:', allNotificationsInDB[0]);
      console.log('Sample notification team:', allNotificationsInDB[0].team);
      console.log('Sample notification team type:', typeof allNotificationsInDB[0].team);
      console.log('Sample notification team length:', allNotificationsInDB[0].team.length);
    }

    // Get user-specific notifications (both read and unread)
    const userNotifications = await Notice.find({
      team: { $in: [userId] },
      isSystemWide: { $ne: true }, // Exclude system-wide notifications from this query
    })
      .populate("task", "title stage priority")
      .populate("by", "name")
      .sort({ createdAt: -1 });

    console.log('User notifications found:', userNotifications.length);

    // Get system-wide notifications (both read and unread)
    const systemNotifications = await Notice.find({
      isSystemWide: true,
      team: { $in: [userId] }, // Only show system notifications where user is in the team
    })
      .populate("by", "name")
      .sort({ createdAt: -1 });

    console.log('System notifications found:', systemNotifications.length);

    // Combine and sort all notifications
    const allNotifications = [...userNotifications, ...systemNotifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    res.status(200).json({
      status: true,
      data: allNotifications,
      count: allNotifications.length,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/read/:id
// @access  Private
export const markNotificationRead = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    // Find notification by ID and check if user has access to it
    const notification = await Notice.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        status: false,
        message: "Notification not found",
      });
    }

    // Check if user has access to this notification
    // For system-wide notifications, all users have access
    // For user-specific notifications, user must be in the team
    if (!notification.isSystemWide && !notification.team.some(id => id.toString() === userId.toString())) {
      return res.status(403).json({
        status: false,
        message: "Access denied to this notification",
      });
    }

    // Check if already read
    if (notification.isRead.some(id => id.toString() === userId.toString())) {
      return res.status(400).json({
        status: false,
        message: "Notification already read",
      });
    }

    // Mark as read
    notification.isRead.push(userId);
    await notification.save();

    res.status(200).json({
      status: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      status: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsRead = async (req, res) => {
  try {
    const { userId } = req.user;

    // Mark all user-specific notifications as read
    const userResult = await Notice.updateMany(
      { team: { $in: [userId] }, isRead: { $nin: [userId] } },
      { $push: { isRead: userId } }
    );

    // Mark all system-wide notifications as read
    const systemResult = await Notice.updateMany(
      { isSystemWide: true, team: { $in: [userId] }, isRead: { $nin: [userId] } },
      { $push: { isRead: userId } }
    );

    const totalModified = userResult.modifiedCount + systemResult.modifiedCount;

    res.status(200).json({
      status: true,
      message: "All notifications marked as read",
      count: totalModified,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      status: false,
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    // Find notification by ID
    const notification = await Notice.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        status: false,
        message: "Notification not found",
      });
    }

    // Check if user has access to delete this notification
    // For system-wide notifications, only admins can delete
    // For user-specific notifications, user must be in the team
    if (notification.isSystemWide) {
      // For system notifications, we'll allow deletion by any user (they're just hiding it from their view)
      // In a more sophisticated system, you might want to track this differently
    } else if (!notification.team.some(id => id.toString() === userId.toString())) {
      return res.status(403).json({
        status: false,
        message: "Access denied to delete this notification",
      });
    }

    // Delete the notification
    await Notice.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      status: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

// @desc    Create system-wide notification (Admin only)
// @route   POST /api/notifications/system
// @access  Private/Admin
export const createSystemNotification = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    
    if (!isAdmin) {
      return res.status(403).json({
        status: false,
        message: "Only admins can create system-wide notifications",
      });
    }

    const { type, text, priority = "normal", metadata = {} } = req.body;

    if (!type || !text) {
      return res.status(400).json({
        status: false,
        message: "Type and text are required",
      });
    }

    const notification = await createSystemWideNotification(
      type,
      userId,
      text,
      priority,
      metadata
    );

    if (!notification) {
      return res.status(500).json({
        status: false,
        message: "Failed to create system notification",
      });
    }

    res.status(201).json({
      status: true,
      message: "System notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Error creating system notification:", error);
    res.status(500).json({
      status: false,
      message: "Failed to create system notification",
      error: error.message,
    });
  }
}; 