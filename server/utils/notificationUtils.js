import Notice from "../models/notification.js";
import User from "../models/user.js";

// Helper function to create notifications
export const createNotification = async (type, taskId, teamMembers, byUserId, customText = null, metadata = {}) => {
  try {
    let text = customText;
    
    if (!customText) {
      switch (type) {
        case "task_assigned":
          text = `New task has been assigned to you${teamMembers.length > 1 ? ` and ${teamMembers.length - 1} others` : ""}.`;
          break;
        case "task_completed":
          text = `Task has been marked as completed.`;
          break;
        case "task_trashed":
          text = `Task has been moved to trash.`;
          break;
        case "task_restored":
          text = `Task has been restored from trash.`;
          break;
        case "team_added":
          text = `You have been added to a new task team.`;
          break;
        case "task_updated":
          text = `Task details have been updated.`;
          break;
        case "task_started":
          text = `Task has been started.`;
          break;
        case "task_duplicated":
          text = `A task has been duplicated.`;
          break;
        case "task_priority_changed":
          text = `Task priority has been changed.`;
          break;
        case "task_deadline_changed":
          text = `Task deadline has been updated.`;
          break;
        case "user_registered":
          text = `A new user has joined the system.`;
          break;
        case "user_role_changed":
          text = `User role has been updated.`;
          break;
        case "user_deactivated":
          text = `A user account has been deactivated.`;
          break;
        case "user_activated":
          text = `A user account has been activated.`;
          break;
        case "system_maintenance":
          text = `System maintenance scheduled.`;
          break;
        case "system_update":
          text = `System has been updated.`;
          break;
        case "new_feature":
          text = `New feature has been added.`;
          break;
        case "announcement":
          text = `New announcement from the team.`;
          break;
        case "comment_added":
          text = `New comment added to task.`;
          break;
        case "subtask_added":
          text = `New subtask has been added.`;
          break;
        case "subtask_completed":
          text = `Subtask has been completed.`;
          break;
        case "file_uploaded":
          text = `New file has been uploaded.`;
          break;
        default:
          text = `System notification.`;
      }
    }

    const notification = await Notice.create({
      team: teamMembers,
      text,
      task: taskId,
      type,
      by: byUserId,
      priority: "normal",
      metadata,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Helper function to create system-wide notifications
export const createSystemWideNotification = async (type, byUserId, text, priority = "normal", metadata = {}) => {
  try {
    // Get all active users for system-wide notifications
    const allUsers = await User.find({ isActive: true }).select('_id');
    const userIds = allUsers.map(user => user._id);

    const notification = await Notice.create({
      team: userIds,
      text,
      type,
      by: byUserId,
      priority,
      isSystemWide: true,
      metadata,
    });

    return notification;
  } catch (error) {
    console.error("Error creating system-wide notification:", error);
    return null;
  }
};

// Helper function to create task assignment notification with priority info
export const createTaskAssignmentNotification = async (task, teamMembers, byUserId) => {
  try {
    const priorityText = task.priority === "high" ? "high priority" : 
                        task.priority === "urgent" ? "urgent priority" : 
                        task.priority === "low" ? "low priority" : "normal priority";
    
    const text = `New task "${task.title}" has been assigned to you${teamMembers.length > 1 ? ` and ${teamMembers.length - 1} others` : ""}. The task priority is set as ${priorityText}, so check and act accordingly. The task date is ${new Date(task.date).toDateString()}. Thank you!`;

    const notification = await Notice.create({
      team: teamMembers,
      text,
      task: task._id,
      type: "task_assigned",
      by: byUserId,
      priority: task.priority === "urgent" ? "urgent" : task.priority,
    });

    return notification;
  } catch (error) {
    console.error("Error creating task assignment notification:", error);
    return null;
  }
};

// Helper function to create team addition notification
export const createTeamAdditionNotification = async (taskId, newTeamMembers, byUserId, taskTitle) => {
  try {
    const text = `You have been added to the task "${taskTitle}". Please review the task details and start working on it.`;

    const notification = await Notice.create({
      team: newTeamMembers,
      text,
      task: taskId,
      type: "team_added",
      by: byUserId,
      priority: "normal",
    });

    return notification;
  } catch (error) {
    console.error("Error creating team addition notification:", error);
    return null;
  }
};

// Helper function to create task completion notification
export const createTaskCompletionNotification = async (taskId, teamMembers, byUserId, taskTitle) => {
  try {
    const text = `Task "${taskTitle}" has been marked as completed. Great work!`;

    const notification = await Notice.create({
      team: teamMembers,
      text,
      task: taskId,
      type: "task_completed",
      by: byUserId,
      priority: "normal",
    });

    return notification;
  } catch (error) {
    console.error("Error creating task completion notification:", error);
    return null;
  }
};

// Helper function to create task trash notification
export const createTaskTrashNotification = async (taskId, teamMembers, byUserId, taskTitle) => {
  try {
    const text = `Task "${taskTitle}" has been moved to trash by an admin.`;

    const notification = await Notice.create({
      team: teamMembers,
      text,
      task: taskId,
      type: "task_trashed",
      by: byUserId,
      priority: "high",
    });

    return notification;
  } catch (error) {
    console.error("Error creating task trash notification:", error);
    return null;
  }
};

// Helper function to create task restore notification
export const createTaskRestoreNotification = async (taskId, teamMembers, byUserId, taskTitle) => {
  try {
    const text = `Task "${taskTitle}" has been restored from trash and is now active again.`;

    const notification = await Notice.create({
      team: teamMembers,
      text,
      task: taskId,
      type: "task_restored",
      by: byUserId,
      priority: "normal",
    });

    return notification;
  } catch (error) {
    console.error("Error creating task restore notification:", error);
    return null;
  }
};

// Helper function to create task duplication notification
export const createTaskDuplicationNotification = async (originalTaskId, newTaskId, teamMembers, byUserId, taskTitle) => {
  try {
    const text = `Task "${taskTitle}" has been duplicated. A new task has been created with the same details.`;

    const notification = await Notice.create({
      team: teamMembers,
      text,
      task: newTaskId,
      type: "task_duplicated",
      by: byUserId,
      priority: "normal",
      metadata: { originalTaskId },
    });

    return notification;
  } catch (error) {
    console.error("Error creating task duplication notification:", error);
    return null;
  }
};

// Helper function to create priority change notification
export const createPriorityChangeNotification = async (taskId, teamMembers, byUserId, taskTitle, oldPriority, newPriority) => {
  try {
    const text = `Task "${taskTitle}" priority has been changed from ${oldPriority} to ${newPriority}.`;

    const notification = await Notice.create({
      team: teamMembers,
      text,
      task: taskId,
      type: "task_priority_changed",
      by: byUserId,
      priority: "normal",
      metadata: { oldPriority, newPriority },
    });

    return notification;
  } catch (error) {
    console.error("Error creating priority change notification:", error);
    return null;
  }
};

// Helper function to create deadline change notification
export const createDeadlineChangeNotification = async (taskId, teamMembers, byUserId, taskTitle, oldDeadline, newDeadline) => {
  try {
    const text = `Task "${taskTitle}" deadline has been updated from ${new Date(oldDeadline).toDateString()} to ${new Date(newDeadline).toDateString()}.`;

    const notification = await Notice.create({
      team: teamMembers,
      text,
      task: taskId,
      type: "task_deadline_changed",
      by: byUserId,
      priority: "high",
      metadata: { oldDeadline, newDeadline },
    });

    return notification;
  } catch (error) {
    console.error("Error creating deadline change notification:", error);
    return null;
  }
};

// Helper function to create user registration notification (admin only)
export const createUserRegistrationNotification = async (newUserId, byUserId, userName) => {
  try {
    const text = `New user "${userName}" has registered and joined the system.`;

    const notification = await Notice.create({
      team: [byUserId], // Only notify admins
      text,
      type: "user_registered",
      by: byUserId,
      priority: "normal",
      metadata: { newUserId, userName },
    });

    return notification;
  } catch (error) {
    console.error("Error creating user registration notification:", error);
    return null;
  }
};

// Helper function to create role change notification
export const createRoleChangeNotification = async (userId, byUserId, userName, oldRole, newRole) => {
  try {
    const text = `User "${userName}" role has been changed from ${oldRole} to ${newRole}.`;

    const notification = await Notice.create({
      team: [userId, byUserId], // Notify both the user and the admin who made the change
      text,
      type: "user_role_changed",
      by: byUserId,
      priority: "normal",
      metadata: { userId, userName, oldRole, newRole },
    });

    return notification;
  } catch (error) {
    console.error("Error creating role change notification:", error);
    return null;
  }
};

// Helper function to create comment notification
export const createCommentNotification = async (taskId, teamMembers, byUserId, taskTitle, commentText) => {
  try {
    const text = `New comment added to task "${taskTitle}": "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`;

    const notification = await Notice.create({
      team: teamMembers.filter(member => member !== byUserId), // Don't notify the commenter
      text,
      task: taskId,
      type: "comment_added",
      by: byUserId,
      priority: "normal",
      metadata: { commentText },
    });

    return notification;
  } catch (error) {
    console.error("Error creating comment notification:", error);
    return null;
  }
};

// Helper function to create subtask notification
export const createSubtaskNotification = async (taskId, teamMembers, byUserId, taskTitle, subtaskTitle, isCompleted = false) => {
  try {
    const type = isCompleted ? "subtask_completed" : "subtask_added";
    const text = isCompleted 
      ? `Subtask "${subtaskTitle}" has been completed in task "${taskTitle}".`
      : `New subtask "${subtaskTitle}" has been added to task "${taskTitle}".`;

    const notification = await Notice.create({
      team: teamMembers,
      text,
      task: taskId,
      type,
      by: byUserId,
      priority: "normal",
      metadata: { subtaskTitle, isCompleted },
    });

    return notification;
  } catch (error) {
    console.error("Error creating subtask notification:", error);
    return null;
  }
}; 