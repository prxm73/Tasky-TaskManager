import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
import Task from "./models/task.js";
import Notification from "./models/notification.js";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// --- SAMPLE DATA ---
const sampleUsers = [
  {
    name: "Codewave Asante",
    email: "admin@gmail.com",
    password: "admin123",
    title: "Administrator",
    role: "Admin",
    isAdmin: true,
    isActive: true,
  },
  {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
    title: "Developer",
    role: "Developer",
    isActive: true,
  },
  {
    name: "John Smith",
    email: "john@example.com",
    password: "password123",
    title: "Designer",
    role: "Designer",
    isActive: true,
  },
];

const sampleTasks = [
  {
    title: "Design Landing Page",
    date: new Date(),
    priority: "high",
    stage: "todo",
    assets: ["figma", "sketch"],
    isTrashed: false,
    activities: [
      {
        type: "started",
        activity: "Task created",
        date: new Date(),
      },
    ],
    subTasks: [
      { title: "Header", date: new Date(), tag: "UI" },
      { title: "Footer", date: new Date(), tag: "UI" },
    ],
  },
  {
    title: "Implement Auth",
    date: new Date(),
    priority: "medium",
    stage: "in progress",
    assets: ["firebase"],
    isTrashed: false,
    activities: [
      {
        type: "assigned",
        activity: "Assigned to Jane",
        date: new Date(),
      },
    ],
    subTasks: [
      { title: "Login", date: new Date(), tag: "backend" },
      { title: "Register", date: new Date(), tag: "backend" },
    ],
  },
];

// --- END SAMPLE DATA ---

const seedUsers = async () => {
  try {
    await User.deleteMany({});
    const createdUsers = await User.insertMany(sampleUsers);
    console.log("Users seeded successfully");
    return createdUsers;
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
};

const seedTasks = async (users) => {
  try {
    await Task.deleteMany({});
    // Assign users to tasks
    const userIds = users.map((u) => u._id);
    const tasksToInsert = sampleTasks.map((task, i) => ({
      ...task,
      team: [userIds[i % userIds.length]],
      activities: task.activities.map((a) => ({ ...a, by: userIds[i % userIds.length] })),
    }));
    const createdTasks = await Task.insertMany(tasksToInsert);
    console.log("Tasks seeded successfully");
    return createdTasks;
  } catch (error) {
    console.error("Error seeding tasks:", error);
    throw error;
  }
};

const seedNotifications = async (users, tasks) => {
  try {
    await Notification.deleteMany({});
    const notifications = [
      {
        team: [users[0]._id, users[1]._id],
        text: "New task 'Landing page design' has been assigned to you and 1 others. The task priority is set as normal priority, so check and act accordingly. The task date is Thu Feb 29 2024. Thank you!",
        task: tasks[0]._id,
        type: "task_assigned",
        by: users[0]._id,
        isRead: [],
        priority: "normal",
      },
      {
        team: [users[1]._id, users[2]._id],
        text: "New task 'Auth implementation' has been assigned to you and 1 others. The task priority is set as high priority, so check and act accordingly. The task date is Fri Feb 09 2024. Thank you!",
        task: tasks[1]._id,
        type: "task_assigned",
        by: users[0]._id,
        isRead: [],
        priority: "high",
      },
      // System-wide notification example
      {
        team: users.map(user => user._id), // All users
        text: "Welcome to the Task Management System! We're excited to have you on board. This system will help you manage tasks efficiently and stay updated with all project activities.",
        type: "announcement",
        by: users[0]._id,
        isRead: [],
        priority: "normal",
        isSystemWide: true,
        metadata: {
          title: "Welcome Message"
        }
      },
      {
        team: users.map(user => user._id), // All users
        text: "New notification system has been implemented! You'll now receive real-time updates for task assignments, completions, and other important activities.",
        type: "new_feature",
        by: users[0]._id,
        isRead: [],
        priority: "normal",
        isSystemWide: true,
        metadata: {
          title: "Notification System Update"
        }
      }
    ];
    await Notification.insertMany(notifications);
    console.log("Notifications seeded successfully");
  } catch (error) {
    console.error("Error seeding notifications:", error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    const users = await seedUsers();
    const tasks = await seedTasks(users);
    await seedNotifications(users, tasks);
    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
