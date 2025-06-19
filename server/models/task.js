import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "normal", "low"],
      default: "normal",
    },
    stage: {
      type: String,
      enum: ["todo", "in progress", "completed"],
      default: "todo",
    },
    assets: [{
      type: String,
    }],
    team: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    isTrashed: {
      type: Boolean,
      default: false,
    },
    activities: [{
      type: {
        type: String,
        enum: ["started", "commented", "assigned", "in progress", "bug", "completed"],
      },
      activity: String,
      date: {
        type: Date,
        default: Date.now,
      },
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    }],
    subTasks: [{
      title: String,
      date: Date,
      tag: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
taskSchema.index({ title: "text" });
taskSchema.index({ stage: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ isTrashed: 1 });
taskSchema.index({ "team": 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
