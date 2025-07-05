import express from "express";
import {
  getTasks,
  getTaskSummary,
  getChartData,
  createTask,
  updateTask,
  deleteTask,
  restoreTask,
  addActivity,
  addSubtask
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all tasks
router.get("/", getTasks);

// Get task summary for dashboard
router.get("/summary", getTaskSummary);

// Get chart data
router.get("/chart", getChartData);

// Create task
router.post("/", createTask);

// Update task
router.put("/:id", updateTask);

// Delete task
router.delete("/:id", deleteTask);

// Restore task from trash
router.put("/:id/restore", restoreTask);

// Add activity to task
router.post("/:id/activities", addActivity);

// Add subtask
router.post("/:id/subtasks", addSubtask);

export default router;
