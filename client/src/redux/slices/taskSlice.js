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
  async (taskData, { rejectWithValue }) => {
    console.log("taskSlice.js: createTask thunk called with data:", taskData);
    try {
      console.log("taskSlice.js: Making POST request to /api/tasks");
      const response = await axiosInstance.post("/api/tasks", taskData);
      console.log("taskSlice.js: POST request successful, response:", response.data);
      return response.data;
    } catch (error) {
      console.log("taskSlice.js: POST request failed with error:", error);
      console.log("taskSlice.js: Error response:", error.response);
      return rejectWithValue(error.response?.data?.message || "Failed to create task");
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, taskData }) => {
    const response = await axiosInstance.put(`/api/tasks/${id}`, taskData);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (id) => {
    await axiosInstance.delete(`/api/tasks/${id}`);
    return id;
  }
);

export const restoreTask = createAsyncThunk(
  "tasks/restoreTask",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/tasks/${id}/restore`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to restore task");
    }
  }
);

export const addActivity = createAsyncThunk(
  "tasks/addActivity",
  async ({ taskId, activity }) => {
    const response = await axiosInstance.post(
      `/api/tasks/${taskId}/activities`,
      activity
    );
    return response.data;
  }
);

export const addSubtask = createAsyncThunk(
  "tasks/addSubtask",
  async ({ taskId, subtask }) => {
    const response = await axiosInstance.post(
      `/api/tasks/${taskId}/subtasks`,
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
      .addCase(createTask.pending, (state) => {
        console.log("taskSlice.js: createTask.pending reducer called");
        state.loading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        console.log("taskSlice.js: createTask.fulfilled reducer called with payload:", action.payload);
        state.loading = false;
        state.tasks.unshift(action.payload);
        console.log("taskSlice.js: Updated tasks state:", state.tasks);
      })
      .addCase(createTask.rejected, (state, action) => {
        console.log("taskSlice.js: createTask.rejected reducer called with error:", action.error);
        state.loading = false;
        state.error = action.error.message;
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
      // Restore Task
      .addCase(restoreTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreTask.fulfilled, (state, action) => {
        state.loading = false;
        // Add the restored task back to the tasks array
        state.tasks.unshift(action.payload.task);
      })
      .addCase(restoreTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
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