import React from "react";
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskDetails from "./pages/TaskDetails";
import Tasks from "./pages/Tasks";
import Trash from "./pages/Trash";
import Users from "./pages/Users";
import Dashboard from "./pages/dashboard";
import { setOpenSidebar, logout, setCredentials } from "./redux/slices/authSlice";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">Please try refreshing the page or contact support if the problem persists.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Layout() {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Check token expiration only if we have a token
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
        
        if (Date.now() >= expirationTime) {
          dispatch(logout());
          navigate('/log-in', { state: { from: location }, replace: true });
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        dispatch(logout());
        navigate('/log-in', { state: { from: location }, replace: true });
      }
    } else if (!user) {
      // Only redirect if we don't have a user and no token
      navigate('/log-in', { state: { from: location }, replace: true });
    }
  }, [token, user, dispatch, navigate, location]);

  // Don't render anything while checking authentication
  if (!user && !token) {
    return null;
  }

  return (
    <div className='w-full h-screen flex flex-col md:flex-row'>
      <div className='w-1/5 h-screen bg-white sticky top-0 hidden md:block'>
        <Sidebar />
      </div>

      <MobileSidebar />

      <div className='flex-1 overflow-y-auto'>
        <Navbar />

        <div className='p-4 2xl:px-10'>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

const MobileSidebar = () => {
  const { isSidebarOpen } = useSelector((state) => state.auth);
  const mobileMenuRef = useRef(null);
  const dispatch = useDispatch();

  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  return (
    <>
      <Transition
        show={isSidebarOpen}
        as={Fragment}
        enter='transition-opacity duration-700'
        enterFrom='opacity-x-10'
        enterTo='opacity-x-100'
        leave='transition-opacity duration-700'
        leaveFrom='opacity-x-100'
        leaveTo='opacity-x-0'
      >
        {(ref) => (
          <div
            ref={(node) => (mobileMenuRef.current = node)}
            className={clsx(
              "md:hidden w-full h-full bg-black/40 transition-all duration-700 transform ",
              isSidebarOpen ? "translate-x-0" : "translate-x-full"
            )}
            onClick={() => closeSidebar()}
          >
            <div className='bg-white w-3/4 h-full'>
              <div className='w-full flex justify-end px-5'>
                <button
                  onClick={() => closeSidebar()}
                  className='flex justify-end items-end'
                >
                  <IoClose size={25} />
                </button>
              </div>

              <div className='mt-1'>
                <Sidebar />
              </div>
            </div>
          </div>
        )}
      </Transition>
    </>
  );
};

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        dispatch(setCredentials(JSON.parse(userInfo)));
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <main className='w-full min-h-screen bg-[#f3f4f6]'>
        <Routes>
          <Route path='/log-in' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route element={<Layout />}>
            <Route path='/' element={<Navigate to='/dashboard' replace />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/tasks' element={<Tasks />} />
            <Route path='/completed/:status' element={<Tasks />} />
            <Route path='/in-progress/:status' element={<Tasks />} />
            <Route path='/todo/:status' element={<Tasks />} />
            <Route path='/team' element={<Users />} />
            <Route path='/trashed' element={<Trash />} />
            <Route path='/task/:id' element={<TaskDetails />} />
          </Route>
        </Routes>

        <Toaster 
          richColors 
          position="top-right"
          expand={true}
          closeButton
        />
      </main>
    </ErrorBoundary>
  );
}

export default App;
