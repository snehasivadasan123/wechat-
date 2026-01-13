import { createSlice } from "@reduxjs/toolkit";
import { registerUser, loginUser, } from "./auththunk";

export interface User {
  name?: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("currentUser");
    },
  },
  extraReducers: (builder) => {
    /* ================= REGISTER ================= */
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("currentUser", JSON.stringify(action.payload));
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Registration failed";
    });

    /* ================= LOGIN ================= */
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("currentUser", JSON.stringify(action.payload));
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Login failed";
    });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
