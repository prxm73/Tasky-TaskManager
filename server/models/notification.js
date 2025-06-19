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
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
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

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
