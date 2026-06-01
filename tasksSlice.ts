import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api";
import { TasksState, Task } from "../../types";

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/tasks`);
      return response.data.tasks as Task[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch tasks.");
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async ({ projectId, title, dueDate }: { projectId: string; title: string; dueDate?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/projects/${projectId}/tasks`, { title, dueDate });
      return response.data.task as Task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create task.");
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async (
    { projectId, id, title, completed, dueDate }: { projectId: string; id: string; title?: string; completed?: boolean; dueDate?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/api/projects/${projectId}/tasks/${id}`, { title, completed, dueDate });
      return response.data.task as Task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update task.");
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async ({ projectId, id }: { projectId: string; id: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/projects/${projectId}/tasks/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete task.");
    }
  }
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTasksError: (state) => {
      state.error = null;
    },
    resetTasksState: (state) => {
      state.tasks = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createTask
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateTask
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTasksError, resetTasksState } = tasksSlice.actions;
export default tasksSlice.reducer;
