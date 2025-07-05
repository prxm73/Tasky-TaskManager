import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, updateTask, deleteTask } from "../redux/slices/taskSlice";
import moment from "moment";
import clsx from "clsx";
import { getInitials } from "../utils";
import Title from "../components/Title";
import UserInfo from "../components/UserInfo";
import { BGS, PRIOTITYSTYELS, TASK_TYPE } from "../utils";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { MdDelete, MdCheckCircle } from "react-icons/md";
import { toast } from "sonner";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const TeamTable = ({ tasks, onCompleteTask, onTrashTask, isAdmin }) => {
  const TableHeader = () => (
    <thead className='border-b border-gray-300'>
      <tr className='text-black text-left'>
        <th className='py-2'>Task Title</th>
        <th className='py-2'>Priority</th>
        <th className='py-2'>Stage</th>
        <th className='py-2'>Team Members</th>
        <th className='py-2'>Created At</th>
        {isAdmin && <th className='py-2'>Actions</th>}
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-400/10'>
      <td className='py-2'>
        <div className='flex items-center gap-2'>
          <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
          <p className='text-base text-black'>{task.title}</p>
          </div>
      </td>

      <td className='py-2'>
        <div className='flex gap-1 items-center'>
          <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
            {ICONS[task.priority]}
          </span>
          <span className='capitalize'>{task.priority}</span>
        </div>
      </td>

      <td className='py-2'>
        <span className='capitalize'>{task.stage}</span>
      </td>

      <td className='py-2'>
        <div className='flex'>
          {task.team.map((member, index) => (
            <div
              key={index}
          className={clsx(
                "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS.length]
          )}
        >
              <UserInfo user={member} />
            </div>
          ))}
        </div>
      </td>

      <td className='py-2'>
        <span className='text-base text-gray-600'>
          {moment(task?.date).fromNow()}
        </span>
      </td>

      {isAdmin && (
        <td className='py-2'>
          <div className='flex gap-2 items-center'>
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
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className='w-full bg-white h-fit px-2 md:px-6 py-4 shadow-md rounded'>
      <table className='w-full mb-5'>
        <TableHeader />
        <tbody>
          {tasks?.map((task, index) => (
            <TableRow key={index + task?._id} task={task} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Users = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

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
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className='w-full md:px-1 px-0 mb-6'>
        <div className='flex items-center justify-between mb-8'>
          <Title title={user?.isAdmin ? 'All Teams & Tasks' : 'My Teams & Tasks'} />
        </div>

        <TeamTable 
          tasks={tasks || []} 
          isAdmin={user?.isAdmin}
          onCompleteTask={handleCompleteTask}
          onTrashTask={handleTrashTask}
        />
      </div>
    </>
  );
};

export default Users;
