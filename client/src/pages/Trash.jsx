import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, restoreTask } from "../redux/slices/taskSlice";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import { getInitials } from "../utils";
import clsx from "clsx";
import moment from "moment";
import { MdRestore } from "react-icons/md";
import { toast } from "sonner";

const Trash = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks({ isTrashed: true }));
  }, [dispatch]);

  const handleRestoreTask = async (task) => {
    try {
      await dispatch(restoreTask(task._id)).unwrap();
      
      toast.success("Task restored successfully!");
    } catch (error) {
      toast.error("Failed to restore task: " + error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const TableHeader = () => (
    <thead className='border-b border-gray-300'>
      <tr className='text-black text-left'>
        <th className='py-2'>Title</th>
        <th className='py-2'>Priority</th>
        <th className='py-2'>Stage</th>
        <th className='py-2'>Modified At</th>
        <th className='py-2'>Actions</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task, onRestoreTask }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-400/10'>
      <td className='py-2'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-700'>
            <span className='text-center'>{getInitials(task?.title)}</span>
          </div>
          <div>
            <p>{task.title}</p>
            <span className='text-xs text-black'>{task?.description}</span>
          </div>
        </div>
      </td>

      <td>
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
      </td>

      <td>
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
      </td>

      <td className='py-2 text-sm'>{moment(task?.updatedAt).fromNow()}</td>
      
      <td className='py-2'>
        <button
          onClick={() => onRestoreTask(task)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <MdRestore className="text-lg" />
          Restore
        </button>
      </td>
    </tr>
  );

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-8'>
        <Title title='Trashed Tasks' />
      </div>

      <div className='w-full bg-white h-fit px-2 md:px-6 py-4 shadow-md rounded'>
        <table className='w-full mb-5'>
          <TableHeader />
          <tbody>
            {tasks?.map((task, index) => (
              <TableRow key={index + task?._id} task={task} onRestoreTask={handleRestoreTask} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Trash;
