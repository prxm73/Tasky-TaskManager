import React, { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "./Textbox";
import { useForm } from "react-hook-form";
import SelectList from "./SelectList";
import Button from "./Button";
import { useCreateSystemNotificationMutation } from "../redux/slices/apiSlice";
import { toast } from "sonner";

const NOTIFICATION_TYPES = [
  "announcement",
  "system_maintenance", 
  "system_update",
  "new_feature"
];

const PRIORITY_LEVELS = ["low", "normal", "high", "urgent"];

const SystemNotificationModal = ({ open, setOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [createSystemNotification, { isLoading }] = useCreateSystemNotificationMutation();
  const [type, setType] = useState(NOTIFICATION_TYPES[0]);
  const [priority, setPriority] = useState(PRIORITY_LEVELS[1]);

  const submitHandler = async (data) => {
    try {
      const notificationData = {
        type,
        text: data.text,
        priority,
        metadata: {
          title: data.title || "",
        },
      };

      await createSystemNotification(notificationData).unwrap();
      toast.success("System notification created successfully!");
      setOpen(false);
      reset();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create system notification");
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <Dialog.Title
          as='h2'
          className='text-base font-bold leading-6 text-gray-900 mb-4'
        >
          Create System Notification
        </Dialog.Title>

        <div className='mt-2 flex flex-col gap-6'>
          <Textbox
            placeholder='Notification Title (Optional)'
            type='text'
            name='title'
            label='Title'
            className='w-full rounded'
            register={register("title")}
            error={errors.title ? errors.title.message : ""}
          />

          <div className='flex gap-4'>
            <SelectList
              label='Notification Type'
              lists={NOTIFICATION_TYPES}
              selected={type}
              setSelected={setType}
            />

            <SelectList
              label='Priority Level'
              lists={PRIORITY_LEVELS}
              selected={priority}
              setSelected={setPriority}
            />
          </div>

          <div className='w-full'>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Notification Message *
            </label>
            <textarea
              {...register("text", { 
                required: "Notification message is required",
                minLength: {
                  value: 10,
                  message: "Message must be at least 10 characters long"
                }
              })}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px] resize-y'
              placeholder='Enter the notification message that will be sent to all users...'
            />
            {errors.text && (
              <p className='text-red-500 text-sm mt-1'>{errors.text.message}</p>
            )}
          </div>

          <div className='bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4'>
            <Button
              label={isLoading ? 'Creating...' : 'Create Notification'}
              type='submit'
              disabled={isLoading}
              className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto disabled:opacity-50'
            />

            <Button
              type='button'
              className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto'
              onClick={handleClose}
              label='Cancel'
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default SystemNotificationModal; 