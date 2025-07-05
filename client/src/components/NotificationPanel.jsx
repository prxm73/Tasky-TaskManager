import { Popover, Transition } from "@headlessui/react";
import moment from "moment";
import { Fragment, useState } from "react";
import { BiSolidMessageRounded } from "react-icons/bi";
import { HiBellAlert } from "react-icons/hi2";
import { IoIosNotificationsOutline } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation
} from "../redux/slices/apiSlice.js";

const ICONS = {
  // Task-related notifications
  task_assigned: (
    <HiBellAlert className='h-5 w-5 text-blue-600 group-hover:text-blue-700' />
  ),
  task_completed: (
    <HiBellAlert className='h-5 w-5 text-green-600 group-hover:text-green-700' />
  ),
  task_trashed: (
    <HiBellAlert className='h-5 w-5 text-red-600 group-hover:text-red-700' />
  ),
  task_restored: (
    <HiBellAlert className='h-5 w-5 text-yellow-600 group-hover:text-yellow-700' />
  ),
  team_added: (
    <BiSolidMessageRounded className='h-5 w-5 text-purple-600 group-hover:text-purple-700' />
  ),
  task_updated: (
    <HiBellAlert className='h-5 w-5 text-indigo-600 group-hover:text-indigo-700' />
  ),
  task_started: (
    <HiBellAlert className='h-5 w-5 text-orange-600 group-hover:text-orange-700' />
  ),
  task_duplicated: (
    <HiBellAlert className='h-5 w-5 text-cyan-600 group-hover:text-cyan-700' />
  ),
  task_priority_changed: (
    <HiBellAlert className='h-5 w-5 text-pink-600 group-hover:text-pink-700' />
  ),
  task_deadline_changed: (
    <HiBellAlert className='h-5 w-5 text-amber-600 group-hover:text-amber-700' />
  ),
  
  // User-related notifications
  user_registered: (
    <BiSolidMessageRounded className='h-5 w-5 text-emerald-600 group-hover:text-emerald-700' />
  ),
  user_role_changed: (
    <BiSolidMessageRounded className='h-5 w-5 text-violet-600 group-hover:text-violet-700' />
  ),
  user_deactivated: (
    <BiSolidMessageRounded className='h-5 w-5 text-red-500 group-hover:text-red-600' />
  ),
  user_activated: (
    <BiSolidMessageRounded className='h-5 w-5 text-green-500 group-hover:text-green-600' />
  ),
  
  // System notifications
  system_maintenance: (
    <HiBellAlert className='h-5 w-5 text-orange-500 group-hover:text-orange-600' />
  ),
  system_update: (
    <HiBellAlert className='h-5 w-5 text-blue-500 group-hover:text-blue-600' />
  ),
  new_feature: (
    <HiBellAlert className='h-5 w-5 text-purple-500 group-hover:text-purple-600' />
  ),
  announcement: (
    <HiBellAlert className='h-5 w-5 text-indigo-500 group-hover:text-indigo-600' />
  ),
  
  // Activity notifications
  comment_added: (
    <BiSolidMessageRounded className='h-5 w-5 text-teal-600 group-hover:text-teal-700' />
  ),
  subtask_added: (
    <BiSolidMessageRounded className='h-5 w-5 text-lime-600 group-hover:text-lime-700' />
  ),
  subtask_completed: (
    <BiSolidMessageRounded className='h-5 w-5 text-green-500 group-hover:text-green-600' />
  ),
  file_uploaded: (
    <BiSolidMessageRounded className='h-5 w-5 text-sky-600 group-hover:text-sky-700' />
  ),
};

const NotificationPanel = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const { data: notificationsData, isLoading, error, refetch } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsData?.data || [];
  console.log('Notifications data:', notifications);
  console.log('Current user:', user);
  
  const unreadCount = notifications.filter(notification => {
    // Check if the current user has read this notification
    const isRead = notification.isRead && notification.isRead.some(id => id === user?._id);
    console.log('Notification:', notification._id, 'isRead:', isRead, 'isRead array:', notification.isRead);
    return !isRead;
  }).length;

  const readHandler = async (notificationId) => {
    try {
      console.log('Marking notification as read:', notificationId);
      const result = await markAsRead(notificationId).unwrap();
      console.log('Mark as read result:', result);
      // Refetch notifications to update the UI
      refetch();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllReadHandler = async () => {
    try {
      console.log('Marking all notifications as read');
      const result = await markAllAsRead().unwrap();
      console.log('Mark all as read result:', result);
      // Refetch notifications to update the UI
      refetch();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteHandler = async (notificationId) => {
    try {
      console.log('Deleting notification:', notificationId);
      const result = await deleteNotification(notificationId).unwrap();
      console.log('Delete result:', result);
      // Refetch notifications to update the UI
      refetch();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const viewHandler = async (notification) => {
    console.log('Viewing notification:', notification);
    
    // Mark as read when clicked
    if (notification._id) {
      await readHandler(notification._id);
    }
    
    // Navigate to task if available
    if (notification.task?._id) {
      console.log('Navigating to task:', notification.task._id);
      navigate(`/tasks/${notification.task._id}`);
    }
    
    setOpen(false);
  };

  const getNotificationTypeText = (type) => {
    switch (type) {
      case "task_assigned":
        return "Task Assigned";
      case "task_completed":
        return "Task Completed";
      case "task_trashed":
        return "Task Trashed";
      case "task_restored":
        return "Task Restored";
      case "team_added":
        return "Added to Team";
      case "task_updated":
        return "Task Updated";
      case "task_started":
        return "Task Started";
      case "task_duplicated":
        return "Task Duplicated";
      case "task_priority_changed":
        return "Task Priority Changed";
      case "task_deadline_changed":
        return "Task Deadline Changed";
      case "user_registered":
        return "User Registered";
      case "user_role_changed":
        return "User Role Changed";
      case "user_deactivated":
        return "User Deactivated";
      case "user_activated":
        return "User Activated";
      case "system_maintenance":
        return "System Maintenance";
      case "system_update":
        return "System Update";
      case "new_feature":
        return "New Feature";
      case "announcement":
        return "Announcement";
      case "comment_added":
        return "Comment Added";
      case "subtask_added":
        return "Subtask Added";
      case "subtask_completed":
        return "Subtask Completed";
      case "file_uploaded":
        return "File Uploaded";
      default:
        return "Notification";
    }
  };

  const callsToAction = [
    { 
      name: "Mark All Read", 
      onClick: markAllReadHandler,
      disabled: unreadCount === 0
    },
  ];

  return (
    <>
      <Popover className='relative'>
        <Popover.Button className='inline-flex items-center outline-none'>
          <div className='w-8 h-8 flex items-center justify-center text-gray-800 relative'>
            <IoIosNotificationsOutline className='text-2xl' />
            {unreadCount > 0 && (
              <span className='absolute text-center top-0 right-1 text-xs text-white font-semibold w-5 h-5 rounded-full bg-red-600 flex items-center justify-center'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </Popover.Button>

        <Transition
          as={Fragment}
          enter='transition ease-out duration-200'
          enterFrom='opacity-0 translate-y-1'
          enterTo='opacity-100 translate-y-0'
          leave='transition ease-in duration-150'
          leaveFrom='opacity-100 translate-y-0'
          leaveTo='opacity-0 translate-y-1'
        >
          <Popover.Panel className='absolute -right-16 md:right-2 z-10 mt-5 flex w-screen max-w-max px-4'>
            {({ close }) => (
              <div className='w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5'>
                <div className='p-4'>
                  {isLoading ? (
                    <div className='text-center py-4'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto'></div>
                      <p className='mt-2 text-gray-600'>Loading notifications...</p>
                    </div>
                  ) : error ? (
                    <div className='text-center py-4'>
                      <p className='text-red-500'>Error loading notifications</p>
                      <button 
                        onClick={() => refetch()} 
                        className='text-blue-600 hover:text-blue-800 text-sm mt-2'
                      >
                        Try again
                      </button>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.slice(0, 5).map((item, index) => {
                      const isRead = item.isRead && item.isRead.some(id => id === user?._id);
                      console.log('Displaying notification:', item._id, 'isRead:', isRead, 'type:', item.type);
                      return (
                      <div
                        key={item._id + index}
                        className={`group relative flex gap-x-4 rounded-lg p-4 hover:bg-gray-50 ${
                          isRead ? 'opacity-75' : 'bg-blue-50'
                        }`}
                      >
                        <div className='mt-1 h-8 w-8 flex items-center justify-center'>
                          {ICONS[item.type] || (
                            <HiBellAlert className='h-5 w-5 text-gray-600 group-hover:text-gray-700' />
                          )}
                        </div>

                        <div
                          className='cursor-pointer flex-1'
                          onClick={() => viewHandler(item)}
                        >
                          <div className='flex items-center gap-3 font-semibold text-gray-900 capitalize'>
                            <p>{getNotificationTypeText(item.type)}</p>
                            {!isRead && (
                              <span className='w-2 h-2 bg-blue-600 rounded-full'></span>
                            )}
                            <span className='text-xs font-normal lowercase'>
                              {moment(item.createdAt).fromNow()}
                            </span>
                          </div>
                          <p className='line-clamp-2 mt-1 text-gray-600 text-sm'>
                            {item.text || 'No message content'}
                          </p>
                          {item.task && item.task.title && (
                            <p className='text-xs text-blue-600 mt-1'>
                              Task: {item.task.title}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Deleting notification:', item._id);
                            deleteHandler(item._id);
                          }}
                          className='opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded'
                        >
                          <MdDelete className='h-4 w-4 text-red-500' />
                        </button>
                      </div>
                    );
                    })
                  ) : (
                    <div className='text-center py-8'>
                      <IoIosNotificationsOutline className='h-12 w-12 text-gray-300 mx-auto mb-2' />
                      <p className='text-gray-500'>No notifications</p>
                      <p className='text-xs text-gray-400 mt-1'>You're all caught up!</p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className='grid grid-cols-1 divide-x bg-gray-50'>
                    {callsToAction.map((item) => (
                                              <button
                          key={item.name}
                          onClick={() => {
                            console.log('Mark all read clicked');
                            item.onClick();
                            close();
                          }}
                          disabled={item.disabled}
                          className='flex items-center justify-center gap-x-2.5 p-3 font-semibold text-blue-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          {item.name}
                        </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
    </>
  );
};

export default NotificationPanel;
