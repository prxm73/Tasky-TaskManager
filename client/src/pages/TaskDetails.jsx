import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchTasks } from "../redux/slices/taskSlice";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import { getInitials } from "../utils";
import clsx from "clsx";
import moment from "moment";

const TaskDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const task = tasks?.find((task) => task._id === id);

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-8'>
        <Title title='Task Details' />
      </div>

      <div className='w-full bg-white h-fit px-2 md:px-6 py-4 shadow-md rounded'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-700'>
            <span className='text-center'>{getInitials(task?.title)}</span>
          </div>
          <div>
            <h2 className='text-xl font-semibold'>{task.title}</h2>
            <p className='text-sm text-gray-500'>{task.description}</p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <h3 className='text-sm font-semibold mb-2'>Priority</h3>
            <p
              className={clsx(
                "w-fit px-3 py-1 rounded-full text-sm",
                task?.priority === "high"
                  ? "bg-red-200"
                  : task?.priority === "medium"
                  ? "bg-yellow-200"
                  : "bg-blue-200"
              )}
            >
              {task?.priority}
            </p>
          </div>

          <div>
            <h3 className='text-sm font-semibold mb-2'>Stage</h3>
            <p
              className={clsx(
                "w-fit px-3 py-1 rounded-full text-sm",
                task?.stage === "todo"
                  ? "bg-blue-200"
                  : task?.stage === "in progress"
                  ? "bg-yellow-200"
                  : "bg-green-200"
              )}
            >
              {task?.stage}
            </p>
          </div>

          <div>
            <h3 className='text-sm font-semibold mb-2'>Created At</h3>
            <p className='text-sm'>{moment(task?.createdAt).format("LLL")}</p>
          </div>

          <div>
            <h3 className='text-sm font-semibold mb-2'>Modified At</h3>
            <p className='text-sm'>{moment(task?.updatedAt).format("LLL")}</p>
          </div>
        </div>

        {task?.subTasks?.length > 0 && (
          <div className='mb-4'>
            <h3 className='text-sm font-semibold mb-2'>Subtasks</h3>
            <ul className='list-disc list-inside'>
              {task.subTasks.map((subtask, index) => (
                <li key={index} className='text-sm'>
                  {subtask.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {task?.activities?.length > 0 && (
          <div>
            <h3 className='text-sm font-semibold mb-2'>Activities</h3>
            <ul className='space-y-2'>
              {task.activities.map((activity, index) => (
                <li key={index} className='text-sm'>
                  <p className='font-medium'>{activity.type}</p>
                  <p className='text-gray-500'>{activity.description}</p>
                  <p className='text-xs text-gray-400'>
                    {moment(activity.date).fromNow()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;
