import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { LuClipboardEdit } from "react-icons/lu";
import { FaNewspaper, FaUsers } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import moment from "moment";
import clsx from "clsx";
import { Chart } from "../components/Chart";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import UserInfo from "../components/UserInfo";
import { useDispatch, useSelector } from "react-redux";
import { fetchTaskSummary, fetchChartData } from "../redux/slices/taskSlice";
import Loading from "../components/Loader";
import { toast } from "sonner";

const TaskTable = ({ tasks }) => {
  const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300 ">
      <tr className="text-black text-left">
        <th className="py-2">Task Title</th>
        <th className="py-2">Priority</th>
        <th className="py-2">Team</th>
        <th className="py-2 hidden md:block">Created At</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className="border-b border-gray-300 text-gray-600 hover:bg-gray-300/10">
      <td className="py-2">
        <div className="flex items-center gap-2">
          <div
            className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
          />

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
      <td className="py-2 hidden md:block">
        <span className="text-base text-gray-600">
          {moment(task?.date).fromNow()}
        </span>
      </td>
    </tr>
  );
  return (
    <>
      <div className="w-full md:w-2/3 bg-white px-2 md:px-4 pt-4 pb-4 shadow-md rounded">
      <div className="text-2xl font-bold mb-3">Tasks Table</div>
        <table className="w-full">
          <TableHeader />
          <tbody>
            {tasks?.map((task, id) => (
              <TableRow key={id} task={task} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const UserTable = ({ users }) => {
  const TableHeader = () => (
    <thead className="border-b border-gray-300 ">
      <tr className="text-black  text-left">
        <th className="py-2">Full Name</th>
        <th className="py-2">Status</th>
        <th className="py-2">Created At</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
    <tr className="border-b border-gray-200  text-gray-600 hover:bg-gray-400/10">
      <td className="py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-700">
            <span className="text-center">{getInitials(user?.name)}</span>
          </div>

          <div>
            <p> {user.name}</p>
            <span className="text-xs text-black">{user?.role}</span>
          </div>
        </div>
      </td>

      <td>
        <p
          className={clsx(
            "w-fit px-3 py-1 rounded-full text-sm",
            user?.isActive ? "bg-blue-200" : "bg-yellow-100"
          )}
        >
          {user?.isActive ? "Active" : "Disabled"}
        </p>
      </td>
      <td className="py-2 text-sm">{moment(user?.createdAt).fromNow()}</td>
    </tr>
  );

  return (
    <div className="w-full md:w-1/3 bg-white h-fit px-2 md:px-6 py-4 shadow-md rounded">
      <div className="text-2xl font-bold mb-3">Team Members</div>
      <table className="w-full mb-5">
        <TableHeader />
        <tbody>
          {users?.map((user, index) => (
            <TableRow key={index + user?._id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { summary, chartData, loading, error } = useSelector(
    (state) => state.tasks
  );

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          dispatch(fetchTaskSummary()).unwrap(),
          dispatch(fetchChartData()).unwrap(),
        ]);
      } catch (error) {
        toast.error(error.message || "Failed to load dashboard data");
      }
    };
    loadDashboardData();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  console.log("Dashboard summary data:", summary);

  const stats = [
    {
      _id: "1",
      label: "TOTAL TASK",
      total: summary?.totalTasks || 0,
      icon: <FaNewspaper />,
      bg: "bg-[#1d4ed8]",
      route: "/tasks",
    },
    {
      _id: "2",
      label: "COMPLETED TASK",
      total: summary?.tasks?.completed || 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e]",
      route: "/completed/completed",
    },
    {
      _id: "3",
      label: "TASK IN PROGRESS",
      total: summary?.tasks?.["in progress"] || 0,
      icon: <LuClipboardEdit />,
      bg: "bg-[#f59e0b]",
      route: "/in-progress/in progress",
    },
    {
      _id: "4",
      label: "TODOS",
      total: summary?.tasks?.todo || 0,
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d]",
      route: "/todo/todo",
    },
  ];

  console.log("Stats array:", stats);

  const Card = ({ label, count, bg, icon, route, onClick }) => {
    console.log(`Card ${label}:`, { label, count, bg });
    return (
      <div 
        className="w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={onClick}
      >
        <div className="h-full flex flex-1 flex-col justify-between">
          <p className="text-base text-gray-600">{label}</p>
          <span className="text-2xl font-semibold">{count}</span>
          <span className="text-sm text-gray-400">Click to view</span>
        </div>

        <div
          className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center text-white",
            bg
          )}
        >
          {icon}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full py-4 w-full flex flex-col gap-6">
      {/* Task Statistics Cards in one line */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {stats.map((item) => (
          <Card 
            key={item._id} 
            label={item.label} 
            count={item.total} 
            bg={item.bg} 
            icon={item.icon}
            onClick={() => {
              console.log(`Navigating to ${item.route}`);
              navigate(item.route);
            }}
          />
        ))}
      </div>

      {/* Priority Task Chart - Full Width */}
      <div className="w-full bg-white px-6 py-4 shadow-md rounded">
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          PRIORITY TASK
        </h3>
        <Chart data={chartData} />
      </div>

      {/* Task and User Tables */}
      <div className="w-full flex flex-col md:flex-row gap-5">
        <TaskTable tasks={summary?.last10Tasks || []} />
        <UserTable users={summary?.activeUsers || []} />
      </div>
    </div>
  );
};

export default Dashboard;
