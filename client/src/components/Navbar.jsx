import React, { useState } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { HiBell } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { setOpenSidebar } from "../redux/slices/authSlice";
import UserAvatar from "./UserAvatar";
import NotificationPanel from "./NotificationPanel";
import SystemNotificationModal from "./SystemNotificationModal";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [openSystemNotification, setOpenSystemNotification] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center px-4 py-3 2xl:py-4 top-0">
        <div className="flex gap-4">
          <button
            onClick={() => dispatch(setOpenSidebar(true))}
            className="text-2xl text-gray-500 block md:hidden"
          >
            ☰
          </button>

          <div className="w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-white">
            <MdOutlineSearch className="text-gray-500 text-xl" />

            <input
              type="text"
              placeholder="Search...."
              className="flex-1 outline-none bg-transparent placeholder:text-gray-500 text-gray-800"
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {/* System Notification Button for Admins */}
          {user?.isAdmin && (
            <button
              onClick={() => setOpenSystemNotification(true)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="Create System Notification"
            >
              <HiBell className="text-lg" />
              <span className="hidden sm:inline">System Alert</span>
            </button>
          )}

          {/* User Details Section */}
          {user && (
            <div className="flex flex-col items-end mr-2 text-xs text-gray-700">
              <span className="font-semibold">{user.name}</span>
              <span>{user.email}</span>
            </div>
          )}
          <UserAvatar />
          <NotificationPanel />
        </div>
      </div>

      {/* System Notification Modal */}
      <SystemNotificationModal 
        open={openSystemNotification} 
        setOpen={setOpenSystemNotification} 
      />
    </>
  );
};

export default Navbar;
