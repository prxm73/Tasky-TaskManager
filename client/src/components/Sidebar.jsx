import React from "react";
import {
  MdDashboard,
  MdOutlineAddTask,
  MdOutlinePendingActions,
  MdSettings,
  MdTaskAlt,
} from "react-icons/md";
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setOpenSidebar, logout } from "../redux/slices/authSlice";
import clsx from "clsx";
import { IoLogOutOutline } from "react-icons/io5";

const linkData = [
  {
    label: "Dashboard",
    link: "dashboard",
    icon: <MdDashboard />,
  },
  {
    label: "My Tasks",
    link: "tasks",
    icon: <FaTasks />,
  },
  {
    label: "Completed Tasks",
    link: "completed/completed",
    icon: <MdTaskAlt />,
  },
  {
    label: "Tasks In Progress",
    link: "in-progress/in progress",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Tasks To Do",
    link: "todo/todo",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "My Teams",
    link: "team",
    icon: <FaUsers />,
  },
  {
    label: "Trash",
    link: "trashed",
    icon: <FaTrashAlt />,
  },
];

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname.split("/")[1];

  // Show all links to admins, but regular users get all except Trash (which is admin-only)
  const sidebarLinks = user?.isAdmin ? linkData : linkData.filter(link => link.label !== "Trash");

  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/log-in');
  };

  const NavLink = ({ el }) => {
    return (
      <Link
        to={el.link}
        onClick={closeSidebar}
        className={clsx(
          "w-full lg:w-3/4 flex gap-2 px-3 py-2 rounded-full items-center text-gray-800 text-base hover:bg-[#2564ed2d]",
          path === el.link.split("/")[0] ? "bg-blue-700 text-neutral-100" : ""
        )}
      >
        {el.icon}
        <span className='hover:text-[#2564ed]'>{el.label}</span>
      </Link>
    );
  };
  return (
    <div className='w-full  h-full flex flex-col gap-6 p-5'>
      <h1 className='flex gap-1 items-center'>
        <p className='bg-blue-600 p-2 rounded-full'>
          <MdOutlineAddTask className='text-white text-2xl font-black' />
        </p>
        <span className='text-2xl font-bold text-black'>TaskMe</span>
      </h1>

      <div className='flex-1 flex flex-col gap-y-5 py-8'>
        {sidebarLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>

      <div className=''>
        <button className='w-full flex gap-2 p-2 items-center text-lg text-gray-800'>
          <MdSettings />
          <span>Settings</span>
        </button>
        <button
          className='w-full flex gap-2 p-2 items-center text-lg text-red-600 mt-2'
          onClick={logoutHandler}
        >
          <IoLogOutOutline />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
