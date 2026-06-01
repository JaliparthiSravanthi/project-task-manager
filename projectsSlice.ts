import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../api";
import { ProjectsState, Project } from "../../types";

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
  activeProjectId: null,
};

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/projects");
      return response.data.projects as Project[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch projects.");
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async ({ title, description }: { title: string; description: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/projects", { title, description });
      return response.data.project as Project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to create project.");
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ id, title, description }: { id: string; title: string; description: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/projects/${id}`, { title, description });
      return response.data.project as Project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to update project.");
    }
  }
);

export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/projects/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to delete project.");
    }
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setActiveProjectId: (state, action: PayloadAction<string | null>) => {
      state.activeProjectId = action.payload;
    },
    clearProjectsError: (state) => {
      state.error = null;
    },
    resetProjectsState: (state) => {
      state.projects = [];
      state.activeProjectId = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.loading = false;
        state.projects = action.payload;
        if (action.payload.length > 0 && !state.activeProjectId) {
          state.activeProjectId = action.payload[0].id;
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createProject
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.loading = false;
        state.projects.push(action.payload);
        state.activeProjectId = action.payload.id;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateProject
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.loading = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // deleteProject
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
        if (state.activeProjectId === action.payload) {
          state.activeProjectId = state.projects.length > 0 ? state.projects[0].id : null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveProjectId, clearProjectsError, resetProjectsState } = projectsSlice.actions;
export default projectsSlice.reducer;
