import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    team: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    text: {
      type: String,
      required: [true, "Notification text is required"],
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      // Not required for system-wide notifications
    },
    type: {
      type: String,
      enum: [
        // Task-related notifications
        "task_assigned", 
        "task_completed", 
        "task_trashed", 
        "task_restored", 
        "team_added", 
        "task_updated", 
        "task_started",
        "task_duplicated",
        "task_priority_changed",
        "task_deadline_changed",
        
        // User-related notifications
        "user_registered",
        "user_role_changed",
        "user_deactivated",
        "user_activated",
        
        // System notifications
        "system_maintenance",
        "system_update",
        "new_feature",
        "announcement",
        
        // Activity notifications
        "comment_added",
        "subtask_added",
        "subtask_completed",
        "file_uploaded"
      ],
      default: "task_assigned",
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRead: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    // For system-wide notifications
    isSystemWide: {
      type: Boolean,
      default: false,
    },
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
notificationSchema.index({ team: 1 });
notificationSchema.index({ task: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isSystemWide: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
