import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
import Task from "./models/task.js";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Clear all data
export const clearDatabase = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log("Database cleared successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
};

// Get database stats
export const getStats = async () => {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    const taskCount = await Task.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const completedTasks = await Task.countDocuments({ stage: "completed" });
    const inProgressTasks = await Task.countDocuments({ stage: "in progress" });
    const todoTasks = await Task.countDocuments({ stage: "todo" });

    console.log("Database Statistics:");
    console.log("-------------------");
    console.log(`Total Users: ${userCount}`);
    console.log(`Active Users: ${activeUsers}`);
    console.log(`Total Tasks: ${taskCount}`);
    console.log(`Completed Tasks: ${completedTasks}`);
    console.log(`In Progress Tasks: ${inProgressTasks}`);
    console.log(`Todo Tasks: ${todoTasks}`);
    process.exit(0);
  } catch (error) {
    console.error("Error getting stats:", error);
    process.exit(1);
  }
};

// Export functions for use in other scripts
export { connectDB }; 