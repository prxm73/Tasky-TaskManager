import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, updateTask, deleteTask } from "../redux/slices/taskSlice";
import { PRIOTITYSTYELS, TASK_TYPE, BGS } from "../utils";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { MdDelete, MdCheckCircle } from "react-icons/md";
import moment from "moment";
import clsx from "clsx";
import UserInfo from "../components/UserInfo";
import { useParams, useLocation } from "react-router-dom";
import AddTask from "../components/task/AddTask";
import { toast } from "sonner";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const TableHeader = () => (
  <thead className="border-b border-gray-300 hidden sm:table-header-group">
    <tr className="text-black text-left">
      <th className="py-2">Task Title</th>
      <th className="py-2">Priority</th>
      <th className="py-2">Stage</th>
      <th className="py-2">Team</th>
      <th className="py-2">Deadline</th>
      <th className="py-2">Actions</th>
    </tr>
  </thead>
);

const TableRow = ({ task, onEditTask, onCompleteTask, onTrashTask, isAdmin }) => (
  <tr className="border-b border-gray-300 text-gray-600 hover:bg-gray-300/10 hidden sm:table-row">
    <td className="py-2">
      <div className="flex items-center gap-2">
        <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
        <p className="text-base text-black">{task.title}</p>
      </div>
    </td>

    <td className="py-2">
      <div className="flex gap-1 items-center">
        <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
          {ICONS[task.priority]}
        </span>
        <span className="capitalize">{task.priority}</span>
      </div>
    </td>

    <td className="py-2">
      <span className="capitalize">{task.stage}</span>
    </td>

    <td className="py-2">
      <div className="flex">
        {task.team.map((m, index) => (
          <div
            key={index}
            className={clsx(
              "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
              BGS[index % BGS.length]
            )}
          >
            <UserInfo user={m} />
          </div>
        ))}
      </div>
    </td>

    <td className="py-2">
      <span className="text-base text-gray-600">
        {moment(task?.date).fromNow()}
      </span>
    </td>

    <td className="py-2">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => onEditTask(task)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Edit
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => onCompleteTask(task)}
              disabled={task.stage === "completed"}
              className={clsx(
                "flex items-center gap-1 text-sm font-medium",
                task.stage === "completed" 
                  ? "text-green-600 cursor-not-allowed" 
                  : "text-green-600 hover:text-green-800"
              )}
            >
              <MdCheckCircle className="text-lg" />
              Complete
            </button>
            <button
              onClick={() => onTrashTask(task)}
              className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              <MdDelete className="text-lg" />
              Trash
            </button>
          </>
        )}
      </div>
    </td>
  </tr>
);

const TaskCard = ({ task, onEditTask, onCompleteTask, onTrashTask, isAdmin }) => (
  <div className="sm:hidden w-full bg-white rounded shadow mb-3 p-3 border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
      <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
      <span className="font-semibold text-black text-base">{task.title}</span>
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => onEditTask(task)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Edit
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => onCompleteTask(task)}
              disabled={task.stage === "completed"}
              className={clsx(
                "flex items-center gap-1 text-sm font-medium",
                task.stage === "completed" 
                  ? "text-green-600 cursor-not-allowed" 
                  : "text-green-600 hover:text-green-800"
              )}
            >
              <MdCheckCircle className="text-lg" />
            </button>
            <button
              onClick={() => onTrashTask(task)}
              className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              <MdDelete className="text-lg" />
            </button>
          </>
        )}
      </div>
    </div>
    <div className="flex flex-wrap gap-2 text-sm mb-1">
      <span
        className={clsx(
          "flex items-center gap-1",
          PRIOTITYSTYELS[task.priority]
        )}
      >
        {ICONS[task.priority]}{" "}
        <span className="capitalize">{task.priority}</span>
      </span>
      <span className="capitalize px-2 py-0.5 rounded bg-gray-100">
        {task.stage}
      </span>
      <span className="text-gray-500">{moment(task?.date).fromNow()}</span>
    </div>
    <div className="flex items-center gap-1 mt-2">
      {task.team.map((m, index) => (
        <div
          key={index}
          className={clsx(
            "w-7 h-7 rounded-full text-white flex items-center justify-center text-xs -mr-1",
            BGS[index % BGS.length]
          )}
        >
          <UserInfo user={m} />
        </div>
      ))}
    </div>
  </div>
);

const Tasks = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const { status } = useParams();
  const location = useLocation();
  const [openAddTask, setOpenAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    console.log("Tasks.jsx: useEffect - dispatching fetchTasks");
    dispatch(fetchTasks());
  }, [dispatch]);

  useEffect(() => {
    console.log("Tasks.jsx: openAddTask state changed to:", openAddTask);
  }, [openAddTask]);

  useEffect(() => {
    console.log("Tasks.jsx: Current user:", user);
    console.log("Tasks.jsx: User isAdmin:", user?.isAdmin);
    console.log("Tasks.jsx: User ID:", user?._id);
  }, [user]);

  const handleCompleteTask = async (task) => {
    try {
      if (task.stage === "completed") {
        toast.error("Task is already completed!");
        return;
      }
      
      await dispatch(updateTask({ 
        id: task._id, 
        taskData: { stage: "completed" } 
      })).unwrap();
      
      toast.success("Task marked as completed!");
    } catch (error) {
      toast.error("Failed to complete task: " + error.message);
    }
  };

  const handleTrashTask = async (task) => {
    try {
      if (window.confirm(`Are you sure you want to move "${task.title}" to trash?`)) {
        await dispatch(deleteTask(task._id)).unwrap();
        toast.success("Task moved to trash!");
      }
    } catch (error) {
      toast.error("Failed to trash task: " + error.message);
    }
  };

  if (loading) {
    return <div>Loading...  </div>;
  }

  // Determine which tasks to show based on the route
  let filteredTasks = tasks;
  if (location.pathname.startsWith("/todo")) {
    filteredTasks = tasks?.filter((task) => task.stage === "todo");
  } else if (location.pathname.startsWith("/in-progress")) {
    filteredTasks = tasks?.filter((task) => task.stage === "in progress");
  } else if (location.pathname.startsWith("/completed")) {
    filteredTasks = tasks?.filter((task) => task.stage === "completed");
  }

  return (
    <div className="w-full md:w-4/5 lg:w-5/6 bg-white px-1 md:px-4 pt-4 pb-4 shadow-md rounded relative">
      {/* Admin Add Task Button */}
      {user?.isAdmin && (
        <div className="w-full flex justify-between items-center mb-4">
            <h2 className="font-bold text-xl">Tasks</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition-all"
            onClick={() => {
              console.log("Tasks.jsx: Add Task button clicked");
              console.log("Tasks.jsx: Current user:", user);
              console.log("Tasks.jsx: Setting openAddTask to true");
              setEditingTask(null);
              setOpenAddTask(true);
            }}
          >
            + Add Task
          </button>
        </div>
      )}
      <AddTask 
        open={openAddTask} 
        setOpen={setOpenAddTask} 
        editingTask={editingTask}
        setEditingTask={setEditingTask}
      />
      {/* Desktop Table */}
      <table className="w-full hidden sm:table">
        <TableHeader />
        <tbody>
          {filteredTasks?.map((task, id) => (
            <TableRow 
              key={id} 
              task={task} 
              isAdmin={user?.isAdmin}
              onEditTask={(task) => {
                console.log("Tasks.jsx: Edit task clicked:", task);
                setEditingTask(task);
                setOpenAddTask(true);
              }}
              onCompleteTask={handleCompleteTask}
              onTrashTask={handleTrashTask}
            />
          ))}
        </tbody>
      </table>
      {/* Mobile Cards */}
      <div className="sm:hidden">
        {filteredTasks?.map((task, id) => (
          <TaskCard 
            key={id} 
            task={task} 
            isAdmin={user?.isAdmin}
            onEditTask={(task) => {
              console.log("Tasks.jsx: Edit task clicked (mobile):", task);
              setEditingTask(task);
              setOpenAddTask(true);
            }}
            onCompleteTask={handleCompleteTask}
            onTrashTask={handleTrashTask}
          />
        ))}
      </div>
    </div>
  );
};

export default Tasks;
