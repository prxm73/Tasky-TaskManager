import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createSystemNotification
} from "../controllers/notificationController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's notifications
router.get("/", getNotifications);

// Mark single notification as read
router.put("/read/:id", markNotificationRead);

// Mark all notifications as read
router.put("/read-all", markAllNotificationsRead);

// Delete a notification
router.delete("/:id", deleteNotification);

// Create system-wide notification (Admin only)
router.post("/system", admin, createSystemNotification);

export default router; 