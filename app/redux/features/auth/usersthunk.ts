import { createAsyncThunk } from "@reduxjs/toolkit";

export interface User {
  email: string;
  name?: string;
}

export const fetchUsers = createAsyncThunk<User[]>(
  "chat/fetchUsers",
  async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    return data.users;
  }
);
