import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks } from "../redux/slices/taskSlice";
import { PRIOTITYSTYELS, TASK_TYPE, BGS } from "../utils";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardDoubleArrowUp } from "react-icons/md";
import moment from "moment";
import clsx from "clsx";
import UserInfo from "../components/UserInfo";
import { useParams, useLocation } from "react-router-dom";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const TableHeader = () => (
  <thead className='border-b border-gray-300 hidden sm:table-header-group'>
    <tr className='text-black text-left'>
      <th className='py-2'>Task Title</th>
      <th className='py-2'>Priority</th>
      <th className='py-2'>Stage</th>
      <th className='py-2'>Team</th>
      <th className='py-2'>Created At</th>
    </tr>
  </thead>
);

const TableRow = ({ task }) => (
  <tr className='border-b border-gray-300 text-gray-600 hover:bg-gray-300/10 hidden sm:table-row'>
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

    <td className='py-2'>
      <span className='text-base text-gray-600'>
        {moment(task?.date).fromNow()}
      </span>
    </td>
  </tr>
);

const TaskCard = ({ task }) => (
  <div className="sm:hidden w-full bg-white rounded shadow mb-3 p-3 border border-gray-200">
    <div className="flex items-center gap-2 mb-2">
      <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
      <span className="font-semibold text-black text-base">{task.title}</span>
    </div>
    <div className="flex flex-wrap gap-2 text-sm mb-1">
      <span className={clsx("flex items-center gap-1", PRIOTITYSTYELS[task.priority])}>
        {ICONS[task.priority]} <span className="capitalize">{task.priority}</span>
      </span>
      <span className="capitalize px-2 py-0.5 rounded bg-gray-100">{task.stage}</span>
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
  const { status } = useParams();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
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
    <div className='w-full md:w-2/3 bg-white px-1 md:px-4 pt-4 pb-4 shadow-md rounded'>
      {/* Desktop Table */}
      <table className='w-full hidden sm:table'>
        <TableHeader />
        <tbody>
          {filteredTasks?.map((task, id) => (
            <TableRow key={id} task={task} />
          ))}
        </tbody>
      </table>
      {/* Mobile Cards */}
      <div className="sm:hidden">
        {filteredTasks?.map((task, id) => (
          <TaskCard key={id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default Tasks;
