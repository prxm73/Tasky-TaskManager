import React, { useState, useEffect } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList";
import SelectList from "../SelectList";
import { BiImages } from "react-icons/bi";
import Button from "../Button";
import { useSelector, useDispatch } from "react-redux";
import { createTask, updateTask } from "../../redux/slices/taskSlice";
import axiosInstance from "../../utils/axios";
import { toast } from "sonner";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORIRY = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

const uploadedFileURLs = [];

const AddTask = ({ open, setOpen, editingTask, setEditingTask }) => {

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();
  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users when modal opens
  useEffect(() => {
    if (open) {
      console.log("AddTask.jsx: Modal opened");
      fetchUsers();
    }
  }, [open]);

  // Reset and pre-fill form when editing task changes
  useEffect(() => {
    if (editingTask) {
      console.log("AddTask.jsx: Editing task:", editingTask);
      console.log("AddTask.jsx: Team leader from editing task:", editingTask.teamLeader);
      
      // Reset form with editing task data
      reset({
        title: editingTask.title || "",
        date: editingTask.date ? new Date(editingTask.date).toISOString().split('T')[0] : "",
      });
      
      // Set other form values
      setStage(editingTask.stage?.toUpperCase() || LISTS[0]);
      setPriority(editingTask.priority?.toUpperCase() || PRIORIRY[2]);
      setAssets(editingTask.assets || []);
      
      // Set team leader - handle both string and object formats
      const teamLeaderValue = editingTask.teamLeader;
      if (teamLeaderValue) {
        if (typeof teamLeaderValue === 'string') {
          setTeamLeader(teamLeaderValue);
        } else if (teamLeaderValue._id) {
          setTeamLeader(teamLeaderValue._id);
        } else if (teamLeaderValue.id) {
          setTeamLeader(teamLeaderValue.id);
        }
      } else {
        setTeamLeader("");
      }
      
      console.log("AddTask.jsx: Set team leader to:", teamLeaderValue);
    } else {
      // Reset form for new task
      reset({
        title: "",
        date: "",
      });
      setTeam([]);
      setStage(LISTS[0]);
      setPriority(PRIORIRY[2]);
      setAssets([]);
      setTeamLeader("");
    }
  }, [editingTask, reset]);

  // Set team when editing task changes and users are loaded
  useEffect(() => {
    if (editingTask && users.length > 0) {
      console.log("AddTask.jsx: Setting team from editing task with users loaded");
      console.log("AddTask.jsx: Editing task team:", editingTask.team);
      console.log("AddTask.jsx: Available users:", users);
      
      // Map team members to full user objects if they're just IDs
      const teamMembers = editingTask.team?.map(teamMember => {
        if (typeof teamMember === 'string') {
          // If it's just an ID, find the full user object
          return users.find(user => user._id === teamMember);
        } else if (teamMember._id) {
          // If it's already a user object, find the full user object
          return users.find(user => user._id === teamMember._id);
        }
        return teamMember;
      }).filter(Boolean); // Remove any undefined members
      
      console.log("AddTask.jsx: Mapped team members:", teamMembers);
      setTeam(teamMembers);
    }
  }, [editingTask, users]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axiosInstance.get("/api/users");
      console.log("AddTask.jsx: Fetched users:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.log("AddTask.jsx: Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };
  
  const [team, setTeam] = useState([]);
  const [stage, setStage] = useState(LISTS[0]);
  const [priority, setPriority] = useState(PRIORIRY[2]);
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [teamLeader, setTeamLeader] = useState("");

  // Debug useEffect to track team leader changes
  useEffect(() => {
    console.log("AddTask.jsx: Team leader state changed to:", teamLeader);
  }, [teamLeader]);

  const submitHandler = async (data) => {
    console.log("AddTask.jsx: submitHandler called with data:", data);
    console.log("AddTask.jsx: Current state - team:", team, "teamLeader:", teamLeader, "stage:", stage, "priority:", priority);
    
    const taskData = {
      ...data,
      team,
      teamLeader,
      stage,
      priority,
      assets,
    };
    console.log("AddTask.jsx: Final taskData to be sent:", taskData);
    
    setUploading(true);
    console.log("AddTask.jsx: Set uploading to true");
    
    try {
      if (editingTask) {
        console.log("AddTask.jsx: Dispatching updateTask");
        const result = await dispatch(updateTask({ id: editingTask._id, taskData })).unwrap();
        console.log("AddTask.jsx: updateTask successful, result:", result);
        toast.success("Task updated successfully!");
      } else {
        console.log("AddTask.jsx: Dispatching createTask");
        const result = await dispatch(createTask(taskData)).unwrap();
        console.log("AddTask.jsx: createTask successful, result:", result);
        toast.success("Task created successfully!");
      }
      setUploading(false);
      setOpen(false);
      setEditingTask(null);
    } catch (err) {
      console.log("AddTask.jsx: Task operation failed with error:", err);
      setUploading(false);
      toast.error(err?.message || `Failed to ${editingTask ? 'update' : 'create'} task`);
    }
  };

  const handleSelect = (e) => {
    setAssets(e.target.files);
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            {editingTask ? "UPDATE TASK" : "ADD TASK"}
          </Dialog.Title>

          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Task Title'
              type='text'
              name='title'
              label='Task Title'
              className='w-full rounded'
              register={register("title", { 
                required: "Title is required"
              })}
              error={errors.title ? errors.title.message : ""}
            />

            {loadingUsers ? (
              <div className="text-center py-4">Loading users...</div>
            ) : (
              <UserList setTeam={setTeam} team={team} users={users} />
            )}

            {team.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Team Leader</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={teamLeader}
                  onChange={e => setTeamLeader(e.target.value)}
                >
                  <option value="">Select a team leader</option>
                  {team.map(member => (
                    <option key={member._id || member.id || member} value={member._id || member.id || member}>
                      {member.name || member.email || member}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className='flex gap-4'>
              <SelectList
                label='Task Stage'
                lists={LISTS}
                selected={stage}
                setSelected={setStage}
              />

              <div className='w-full'>
                <Textbox
                  placeholder='Date'
                  type='date'
                  name='date'
                  label='Task Deadline'
                  className='w-full rounded'
                  register={register("date", {
                    required: "Date is required!"
                  })}
                  error={errors.date ? errors.date.message : ""}
                />
              </div>
            </div>

            <div className='flex gap-4'>
              <SelectList
                label='Priority Level'
                lists={PRIORIRY}
                selected={priority}
                setSelected={setPriority}
              />

              <div className='w-full flex items-center justify-center mt-4'>
                <label
                  className='flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4'
                  htmlFor='imgUpload'
                >
                  <input
                    type='file'
                    className='hidden'
                    id='imgUpload'
                    onChange={(e) => handleSelect(e)}
                    accept='.jpg, .png, .jpeg'
                    multiple={true}
                  />
                  <BiImages />
                  <span>Add Assets</span>
                </label>
              </div>
            </div>

            <div className='bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4'>
              {uploading ? (
                <span className='text-sm py-2 text-red-500'>
                  Uploading assets
                </span>
              ) : (
                <Button
                  label={editingTask ? 'Update' : 'Submit'}
                  type='submit'
                  className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto'
                />
              )}

              <Button
                type='button'
                className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto'
                onClick={() => {
                  setOpen(false);
                  setEditingTask(null);
                }}
                label='Cancel'
              />
            </div>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddTask;
