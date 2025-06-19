import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";

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

    let text = "New task has been assigned to you";
    if (team?.length > 1) {
      text = text + ` and ${team?.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${priority} priority, so check and act accordingly. The task date is ${new Date(
        date
      ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
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

    // Create notification with error handling
    try {
      await Notice.create({
        team,
        text,
        task: task._id,
      });
    } catch (noticeError) {
      console.error("Failed to create notification:", noticeError);
      // Continue execution as notification failure shouldn't break task creation
    }

    res
      .status(200)
      .json({ status: true, task, message: "Task created successfully." });
  } catch (error) {
    console.error("Task creation error:", error);
    return res.status(500).json({ 
      status: false, 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;

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

    //alert users of the task
    let text = "New task has been assigned to you";
    if (task.team.length > 1) {
      text = text + ` and ${task.team.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${
        task.priority
      } priority, so check and act accordingly. The task date is ${task.date.toDateString()}. Thank you!!!`;

    await Notice.create({
      team: task.team,
      text,
      task: newTask._id,
    });

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
          team: { $all: [userId] },
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
    const { stage, priority, search, isTrashed } = req.query;
    const query = {};

    if (stage) query.stage = stage;
    if (priority) query.priority = priority;
    if (isTrashed) query.isTrashed = isTrashed === "true";
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
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
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("team", "name email title role avatar");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isTrashed: true },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task moved to trash" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTaskSummary = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const last10Tasks = await Task.find()
      .populate("team", "name email title role avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    const activeUsers = await User.find({ isActive: true })
      .select("name email title role avatar")
      .limit(5);

    const todoTasks = await Task.countDocuments({ stage: "todo" });
    const inProgressTasks = await Task.countDocuments({ stage: "in progress" });
    const completedTasks = await Task.countDocuments({ stage: "completed" });

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

export const getChartData = async (req, res) => {
  try {
    const highPriority = await Task.countDocuments({ priority: "high" });
    const mediumPriority = await Task.countDocuments({ priority: "medium" });
    const normalPriority = await Task.countDocuments({ priority: "normal" });
    const lowPriority = await Task.countDocuments({ priority: "low" });

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
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { subTasks: req.body } },
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
