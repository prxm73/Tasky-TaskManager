import React from "react";
import { getInitials } from "../../utils";

const UserList = ({ setTeam, team, users = [] }) => {

  const handleUserSelect = (user) => {
    const isSelected = team.some(member => member._id === user._id);
    if (isSelected) {
      setTeam(team.filter(member => member._id !== user._id));
    } else {
      setTeam([...team, user]);
  }
  };

  return (
    <div className='w-full flex flex-col gap-4'>
      <label className="text-sm font-medium text-gray-700">Select Team Members</label>
      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
        {users.map((user, index) => {
        const isSelected = team.some(member => member._id === user._id);
        return (
        <div
          key={index + user?._id}
            className={`flex items-center gap-4 p-2 hover:bg-gray-100 rounded-md cursor-pointer ${
              isSelected ? 'bg-blue-100 border border-blue-300' : ''
            }`}
            onClick={() => handleUserSelect(user)}
        >
          <div className='w-10 h-10 rounded-full text-white flex items-center justify-center text-sm bg-violet-700'>
            <span className='text-center'>{getInitials(user?.name)}</span>
          </div>

          <div>
            <p className='text-sm font-semibold'>{user?.name}</p>
            <span className='text-xs text-gray-500'>{user?.title}</span>
          </div>
            
            {isSelected && (
              <div className="ml-auto">
                <span className="text-blue-600 text-sm">✓ Selected</span>
              </div>
            )}
          </div>
        );
      })}
        </div>
    </div>
  );
};

export default UserList;
