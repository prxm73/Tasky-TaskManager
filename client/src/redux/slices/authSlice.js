import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("userInfo"))?.user || null,
  token: JSON.parse(localStorage.getItem("userInfo"))?.token || null,
  loading: false,
  error: null,
  isSidebarOpen: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      // Accepts either { user, token } or a flat user object with token
      let user, token;
      if (action.payload.user) {
        user = action.payload.user;
        token = action.payload.token;
      } else {
        // Flat user object, token may be present
        user = { ...action.payload };
        token = action.payload.token;
      }
      state.user = user;
      state.token = token;
      localStorage.setItem("userInfo", JSON.stringify({ user, token }));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      // Clear from localStorage
      localStorage.removeItem("userInfo");
    },
    setOpenSidebar: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { setCredentials, setLoading, setError, logout, setOpenSidebar } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsSidebarOpen = (state) => state.auth.isSidebarOpen;
