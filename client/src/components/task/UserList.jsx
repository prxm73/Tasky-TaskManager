import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTaskSummary } from "../../redux/slices/taskSlice";
import { getInitials } from "../../utils";

const UserList = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTaskSummary());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='w-full flex flex-col gap-4'>
      {summary?.activeUsers?.map((user, index) => (
        <div
          key={index + user?._id}
          className='flex items-center gap-4 p-2 hover:bg-gray-100 rounded-md'
        >
          <div className='w-10 h-10 rounded-full text-white flex items-center justify-center text-sm bg-violet-700'>
            <span className='text-center'>{getInitials(user?.name)}</span>
          </div>

          <div>
            <p className='text-sm font-semibold'>{user?.name}</p>
            <span className='text-xs text-gray-500'>{user?.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
