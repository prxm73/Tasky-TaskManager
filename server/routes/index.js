import express from "express";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";
import notificationRoutes from "./notificationRoutes.js";

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);
router.use("/notifications", notificationRoutes);

export default router;
