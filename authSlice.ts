import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";
import { AuthState } from "../../types";

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
  otpRequestedEmail: null,
  simulatedOtp: null,
};

export const requestOtp = createAsyncThunk(
  "auth/requestOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/request-otp", { email });
      return { email, simulatedOtp: response.data.simulatedOtp };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Failed to trigger OTP request.");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/verify-otp", { email, code });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || "Verification failed.");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const response = await api.get("/api/auth/me");
      return response.data.user;
    } catch (error: any) {
      localStorage.removeItem("token");
      return rejectWithValue(error.response?.data?.error || "Session expired.");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.token = null;
      state.otpRequestedEmail = null;
      state.simulatedOtp = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetOtpState: (state) => {
      state.otpRequestedEmail = null;
      state.simulatedOtp = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpRequestedEmail = action.payload.email;
        state.simulatedOtp = action.payload.simulatedOtp;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.otpRequestedEmail = null;
        state.simulatedOtp = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        if (!action.payload) {
          state.token = null;
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { logout, clearError, resetOtpState } = authSlice.actions;
export default authSlice.reducer;
