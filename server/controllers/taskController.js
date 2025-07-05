import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";
import { 
  createTaskAssignmentNotification,
  createTeamAdditionNotification,
  createTaskCompletionNotification,
  createTaskTrashNotification,
  createTaskRestoreNotification,
  createTaskDuplicationNotification,
  createPriorityChangeNotification,
  createDeadlineChangeNotification,
  createSubtaskNotification
} from "../utils/notificationUtils.js";

// Validation helper
const validateTaskInput = (data) => {
  const errors = [];
  if (!data.title?.trim()) errors.push("Title is required");
  if (!data.team?.length) errors.push("At least one team member is required");
  if (!data.stage?.trim()) errors.push("Stage is required");
  if (!data.date) errors.push("Date is required");
  if (!data.priority?.trim()) errors.push("Priority is required");
  return errors;
};

export const createTask = async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, team, stage, date, priority, assets } = req.body;

    // Validate input
    const validationErrors = validateTaskInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Validate team members exist
    const teamMembers = await User.find({ _id: { $in: team } });
    if (teamMembers.length !== team.length) {
      return res.status(400).json({
        status: false,
        message: "One or more team members do not exist"
      });
    }

    const activity = {
      type: "assigned",
      activity: `Task "${title}" assigned to team`,
      by: userId,
    };

    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: activity,
    });

    // Create notification for task assignment
    try {
      await createTaskAssignmentNotification(task, team, userId);
    } catch (noticeError) {
      console.error("Failed to create notification:", noticeError);
      // Continue execution as notification failure shouldn't break task creation
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      status: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const task = await Task.findById(id);

    const newTask = await Task.create({
      ...task,
      title: task.title + " - Duplicate",
    });

    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.priority = task.priority;
    newTask.stage = task.stage;

    await newTask.save();

    // Create notification for duplicated task
    try {
      await createTaskDuplicationNotification(task._id, newTask._id, task.team, userId, task.title);
    } catch (noticeError) {
      console.error("Failed to create notification for duplicated task:", noticeError);
    }

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const postTaskActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;

    const task = await Task.findById(id);

    const data = {
      type,
      activity,
      by: userId,
    };

    task.activities.push(data);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    const allTasks = isAdmin
      ? await Task.find({
          isTrashed: false,
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 })
      : await Task.find({
          isTrashed: false,
          team: { $in: [userId] },
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 });

    const users = await User.find({ isActive: true })
      .select("name title role isAdmin createdAt")
      .limit(10)
      .sort({ _id: -1 });

    //   group task by stage and calculate counts
    const groupTaskks = allTasks.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }

      return result;
    }, {});

    // Group tasks by priority
    const groupData = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;

        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    // calculate total tasks
    const totalTasks = allTasks?.length;
    const last10Task = allTasks?.slice(0, 10);

    const summary = {
      totalTasks,
      last10Task,
      users: isAdmin ? users : [],
      tasks: groupTaskks,
      graphData: groupData,
    };

    res.status(200).json({
      status: true,
      message: "Successfully",
      ...summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    const { stage, priority, search, isTrashed } = req.query;
    const query = {};

    // Filter by stage if provided
    if (stage) query.stage = stage;
    if (priority) query.priority = priority;
    
    // Handle isTrashed filter - if explicitly requested, use it; otherwise exclude trashed tasks
    if (isTrashed !== undefined) {
      query.isTrashed = isTrashed === "true";
    } else {
      // By default, exclude trashed tasks from regular views
      query.isTrashed = false;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // If user is not admin, only show tasks where they are a team member
    if (!isAdmin) {
      query.team = { $in: [userId] };
    }

    const tasks = await Task.find(query)
      .populate("team", "name email title role avatar")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email",
      })
      .populate({
        path: "activities.by",
        select: "name",
      });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body;

    const { id } = req.params;

    const newSubTask = {
      title,
      date,
      tag,
    };

    const task = await Task.findById(id);

    task.subTasks.push(newSubTask);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const updateData = req.body;

    // Get the original task to compare changes
    const originalTask = await Task.findById(id);
    if (!originalTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("team", "name email title role avatar");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if team members were added
    if (updateData.team && updateData.team.length > originalTask.team.length) {
      const newTeamMembers = updateData.team.filter(
        memberId => !originalTask.team.includes(memberId)
      );
      
      if (newTeamMembers.length > 0) {
        try {
          await createTeamAdditionNotification(task._id, newTeamMembers, userId, task.title);
        } catch (noticeError) {
          console.error("Failed to create team addition notification:", noticeError);
        }
      }
    }

    // Check if task was marked as completed
    if (updateData.stage === "completed" && originalTask.stage !== "completed") {
      try {
        await createTaskCompletionNotification(task._id, task.team, userId, task.title);
      } catch (noticeError) {
        console.error("Failed to create completion notification:", noticeError);
      }
    }

    // Check if priority was changed
    if (updateData.priority && updateData.priority !== originalTask.priority) {
      try {
        await createPriorityChangeNotification(
          task._id, 
          task.team, 
          userId, 
          task.title, 
          originalTask.priority, 
          updateData.priority
        );
      } catch (noticeError) {
        console.error("Failed to create priority change notification:", noticeError);
      }
    }

    // Check if deadline was changed
    if (updateData.date && new Date(updateData.date).getTime() !== new Date(originalTask.date).getTime()) {
      try {
        await createDeadlineChangeNotification(
          task._id, 
          task.team, 
          userId, 
          task.title, 
          originalTask.date, 
          updateData.date
        );
      } catch (noticeError) {
        console.error("Failed to create deadline change notification:", noticeError);
      }
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { isTrashed: true },
      { new: true }
    );

    // Create notification for task being trashed
    try {
      await createTaskTrashNotification(task._id, task.team, userId, task.title);
    } catch (noticeError) {
      console.error("Failed to create trash notification:", noticeError);
    }

    res.json({ message: "Task moved to trash" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const restoreTask = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.isTrashed) {
      return res.status(400).json({ message: "Task is not in trash" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { isTrashed: false },
      { new: true }
    ).populate("team", "name email title role avatar");

    // Create notification for task being restored
    try {
      await createTaskRestoreNotification(task._id, task.team, userId, task.title);
    } catch (noticeError) {
      console.error("Failed to create restore notification:", noticeError);
    }

    res.json({ message: "Task restored successfully", task: updatedTask });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTaskSummary = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    
    // Base query - if not admin, only include tasks where user is team member
    // Also exclude trashed tasks by default
    const baseQuery = isAdmin ? { isTrashed: false } : { team: { $in: [userId] }, isTrashed: false };

    const totalTasks = await Task.countDocuments(baseQuery);
    const last10Tasks = await Task.find(baseQuery)
      .populate("team", "name email title role avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    // For active users, show all if admin, otherwise show only team members
    const userQuery = isAdmin ? { isActive: true } : { isActive: true, _id: { $in: await getTeamMemberIds(userId) } };
    const activeUsers = await User.find(userQuery)
      .select("name email title role avatar")
      .limit(5);

    const todoTasks = await Task.countDocuments({ ...baseQuery, stage: "todo" });
    const inProgressTasks = await Task.countDocuments({ ...baseQuery, stage: "in progress" });
    const completedTasks = await Task.countDocuments({ ...baseQuery, stage: "completed" });

    res.json({
      totalTasks,
      last10Tasks,
      activeUsers,
      todoTasks,
      inProgressTasks,
      completedTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get team member IDs for a user
const getTeamMemberIds = async (userId) => {
  try {
    const tasks = await Task.find({ team: { $in: [userId] }, isTrashed: false });
    const teamMemberIds = new Set();
    
    tasks.forEach(task => {
      task.team.forEach(memberId => {
        teamMemberIds.add(memberId.toString());
      });
    });
    
    return Array.from(teamMemberIds);
  } catch (error) {
    console.error('Error getting team member IDs:', error);
    return [];
  }
};

export const getChartData = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    
    // Base query - if not admin, only include tasks where user is team member
    // Also exclude trashed tasks by default
    const baseQuery = isAdmin ? { isTrashed: false } : { team: { $in: [userId] }, isTrashed: false };

    const highPriority = await Task.countDocuments({ ...baseQuery, priority: "high" });
    const mediumPriority = await Task.countDocuments({ ...baseQuery, priority: "medium" });
    const normalPriority = await Task.countDocuments({ ...baseQuery, priority: "normal" });
    const lowPriority = await Task.countDocuments({ ...baseQuery, priority: "low" });

    res.json([
      { name: "High", value: highPriority },
      { name: "Medium", value: mediumPriority },
      { name: "Normal", value: normalPriority },
      { name: "Low", value: lowPriority },
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addActivity = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { activities: req.body } },
      { new: true }
    ).populate("team", "name email title role avatar");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addSubtask = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const subtaskData = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      { $push: { subTasks: subtaskData } },
      { new: true }
    ).populate("team", "name email title role avatar");
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Create notification for new subtask
    try {
      await createSubtaskNotification(
        task._id, 
        task.team, 
        userId, 
        task.title, 
        subtaskData.title, 
        false
      );
    } catch (noticeError) {
      console.error("Failed to create subtask notification:", noticeError);
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
