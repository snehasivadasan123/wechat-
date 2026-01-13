import { createAsyncThunk } from "@reduxjs/toolkit";
import { Message } from "./chatsice";

export const sendMessageToApi = createAsyncThunk(
  "chat/sendMessageToApi",
  async (msg: Message) => {
    console.log("reached at thunk")
    const res = await fetch("/api/auth/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    });

    if (!res.ok) throw new Error("Failed to send message");
    const data: Message = await res.json();
    return data;
  }
);

export const fetchConversation = createAsyncThunk(
  "chat/fetchConversation",
  async ({ user1, user2 }: { user1: string; user2: string }) => {
    const res = await fetch("/api/auth/message/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user1, user2 }),
    });

    if (!res.ok) throw new Error("Failed to fetch conversation");
    const data: Message[] = await res.json();
    return data;
  }
);
