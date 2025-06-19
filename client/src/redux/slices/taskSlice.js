import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axios";

// Async thunks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async ({ stage, priority, search, isTrashed } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (stage) params.append("stage", stage);
      if (priority) params.append("priority", priority);
      if (search) params.append("search", search);
      if (isTrashed) params.append("isTrashed", isTrashed);

      const response = await axiosInstance.get(`/api/tasks?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
    }
  }
);

export const fetchTaskSummary = createAsyncThunk(
  "tasks/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/tasks/summary");
      const data = response.data;
      return {
        totalTasks: data.totalTasks,
        last10Tasks: data.last10Tasks,
        activeUsers: data.activeUsers,
        tasks: {
          todo: data.todoTasks,
          "in progress": data.inProgressTasks,
          completed: data.completedTasks
        }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch task summary");
    }
  }
);

export const fetchChartData = createAsyncThunk(
  "tasks/fetchChartData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/tasks/chart");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch chart data");
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData) => {
    const response = await axiosInstance.post("/tasks", taskData);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, taskData }) => {
    const response = await axiosInstance.put(`/tasks/${id}`, taskData);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id) => {
    await axiosInstance.delete(`/tasks/${id}`);
    return id;
  }
);

export const addActivity = createAsyncThunk(
  "tasks/addActivity",
  async ({ taskId, activity }) => {
    const response = await axiosInstance.post(
      `/tasks/${taskId}/activities`,
      activity
    );
    return response.data;
  }
);

export const addSubtask = createAsyncThunk(
  "tasks/addSubtask",
  async ({ taskId, subtask }) => {
    const response = await axiosInstance.post(
      `/tasks/${taskId}/subtasks`,
      subtask
    );
    return response.data;
  }
);

const initialState = {
  tasks: [],
  summary: null,
  chartData: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Summary
      .addCase(fetchTaskSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTaskSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchTaskSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Chart Data
      .addCase(fetchChartData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.loading = false;
        state.chartData = action.payload;
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          (task) => task._id === action.payload._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
      })
      // Add Activity
      .addCase(addActivity.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          (task) => task._id === action.payload._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      // Add Subtask
      .addCase(addSubtask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          (task) => task._id === action.payload._id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer; 