import { createAsyncThunk } from "@reduxjs/toolkit";
export interface User {
  name?: string;
  email: string;
  password: string;
  createdAt?: string;
}
// const fakeApiRegister = (user: User) =>
//   new Promise<User>((resolve, reject) => {
//     setTimeout(() => {
//       if (user.email === "error@example.com") reject("Email already exists");
//       else resolve(user);
//     }, 1000);
//   });

// const fakeApiLogin = (user: User) =>
//   new Promise<User>((resolve, reject) => {
//     setTimeout(() => {
//       const users = JSON.parse(localStorage.getItem("users") || "[]");
//       console.log("Logging in user:", user, "Against users:", users);
//       const matched = users.find(
//         (u: User) => u.email === user.email && u.password === user.password
//       );
//       if (matched) resolve(matched);
//       else reject("Invalid credentials");
//     }, 500);
//   });

export const apiRegister = async (user: User) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed')
  }
  console.log("yes registered ", data.user)
  return data.user
}

const apiLogin = async (user: User) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  const text = await response.text(); // read raw first

  try {
    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    return data.user;
  } catch {
    console.error("Server returned HTML:", text);
    throw new Error("Server error. API not responding correctly.");
  }
};


export const registerUser = createAsyncThunk<User, User, { rejectValue: string }>(
  "auth/registerUser",
  async (user, { rejectWithValue }) => {
    try {
      const registeredUser = await apiRegister(user)
      return registeredUser
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const loginUser = createAsyncThunk<User, User, { rejectValue: string }>(
  "auth/loginUser",
  async (user, { rejectWithValue }) => {
    try {
      const loggedInUser = await apiLogin(user)
      return loggedInUser
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

