import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { toast } from "sonner";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitHandler = async (data) => {
    try {
      // Add default values for required fields
      const userData = {
        ...data,
        title: data.title || "User", // Default title if not provided
        isActive: true, // Default value
        isAdmin: false, // Default value
      };

      const result = await register(userData).unwrap();
      if (result) {
        dispatch(setCredentials(result));
        toast.success("Registration successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        {/* left side */}
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base bordergray-300 text-gray-600'>
              Join our task management platform!
            </span>
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700'>
              <span>Create Your</span>
              <span>Account</span>
            </p>
          </div>
        </div>

        {/* right side */}
        <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white px-10 pt-14 pb-14'
          >
            <div className=''>
              <p className='text-blue-600 text-3xl font-bold text-center'>
                Sign Up
              </p>
              <p className='text-center text-base text-gray-700'>
                Create your account to get started
              </p>
            </div>

            <div className='flex flex-col gap-y-5'>
              <Textbox
                placeholder='John Doe'
                type='text'
                name='name'
                label='Full Name'
                className='w-full rounded-full'
                register={registerForm("name", {
                  required: "Full name is required!",
                })}
                error={errors.name ? errors.name.message : ""}
              />
              <Textbox
                placeholder='email@example.com'
                type='email'
                name='email'
                label='Email Address'
                className='w-full rounded-full'
                register={registerForm("email", {
                  required: "Email Address is required!",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                error={errors.email ? errors.email.message : ""}
              />
              <Textbox
                placeholder='your password'
                type='password'
                name='password'
                label='Password'
                className='w-full rounded-full'
                register={registerForm("password", {
                  required: "Password is required!",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={errors.password ? errors.password.message : ""}
              />
              <Textbox
                placeholder='Your Title'
                type='text'
                name='title'
                label='Title'
                className='w-full rounded-full'
                register={registerForm("title", {
                  required: "Title is required!",
                })}
                error={errors.title ? errors.title.message : ""}
              />
              <select
                {...registerForm("role", {
                  required: "Role is required!",
                })}
                className='w-full rounded-full px-3 py-2.5 border border-gray-300 focus:ring-2 ring-blue-300 outline-none'
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Analyst">Analyst</option>
              </select>
              {errors.role && (
                <span className='text-xs text-[#f64949fe] mt-0.5'>{errors.role.message}</span>
              )}

              <Button
                type='submit'
                label={isLoading ? "Creating account..." : "Create Account"}
                className='w-full h-10 bg-blue-700 text-white rounded-full'
              />

              <p className='text-center text-sm text-gray-600'>
                Already have an account?{" "}
                <Link to='/log-in' className='text-blue-600 hover:underline'>
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 