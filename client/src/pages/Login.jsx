import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link, Navigate } from "react-router-dom";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";
import { toast } from "sonner";

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [role, setRole] = useState("User");

  const submitHandler = async (data) => {
    const loginData = { ...data, role };
    if (role === "Admin") {
      loginData.superKey = data.superKey;
    }
    try {
      const result = await login(loginData).unwrap();
      if (result) {
        dispatch(setCredentials(result));
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.data?.message || "Login failed. Please try again.");
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo && !user) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        dispatch(setCredentials(parsedUserInfo));
        navigate("/dashboard");
      } catch (error) {
        console.error("Error parsing user info:", error);
        localStorage.removeItem("userInfo");
      }
    }
  }, [dispatch, navigate, user]);

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6]'>
      <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
        {/* left side */}
        <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
          <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
            <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-base bordergray-300 text-gray-600'>
              Manage all your task in one place!
            </span>
            <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700'>
              <span>Cloud-Based</span>
              <span>Task Manager</span>
            </p>

            <div className='cell'>
              <div className='circle rotate-in-up-left'></div>
            </div>
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
                Welcome back!
              </p>
              <p className='text-center text-base text-gray-700 '>
                Keep all your credentials safe.
              </p>
            </div>

            <div className='flex flex-col gap-y-5'>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium text-gray-700'>Login as</label>
                <select
                  className='w-full rounded-2xl border border-gray-300/40 bg-white/80 px-3 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 hover:border-blue-300/60 hover:bg-blue-50/40'
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value='User'>User</option>
                  <option value='Admin'>Admin</option>
                </select>
              </div>
              <Textbox
                placeholder='email@example.com'
                type='email'
                name='email'
                label='Email Address'
                className='w-full rounded-full'
                register={register("email", {
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
                register={register("password", {
                  required: "Password is required!",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={errors.password ? errors.password.message : ""}
              />
              {role === "Admin" && (
                <Textbox
                  placeholder='Super Key'
                  type='password'
                  name='superKey'
                  label='Super Key'
                  className='w-full rounded-full'
                  register={register("superKey", {
                    required: "Super Key is required for admin login!"
                  })}
                  error={errors.superKey ? errors.superKey.message : ""}
                />
              )}

              <span className='text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer'>
                Forget Password?
              </span>

              <Button
                type='submit'
                label={isLoading ? "Logging in..." : "Login"}
                className='w-full h-10 bg-blue-700 text-white rounded-full'
              />

              <p className='text-center text-sm text-gray-600'>
                Don't have an account?{" "}
                <Link to='/register' className='text-blue-600 hover:underline'>
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
