// chatSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { sendMessageToApi, fetchConversation } from "./chatthunk";
import { fetchUsers } from "../auth/usersthunk";
export interface ChatUser {
  name?: string;
  email: string;
}

// export interface Message {
//   id: string;
//   sender: string;
//   receiver: string;
//   text: string;
//   timestamp: number;
// }
export interface Message {
  id: string;
  sender: string;
  receiver: string;
  text?: string;
  image?: string;
  timestamp: number;
}

interface ChatState {
  selectedUser: ChatUser | null;
  messages: Message[];
  unreadCounts: Record<string, number>;
  loading: boolean;
  error?: string;
  users: ChatUser[];
}

const initialState: ChatState = {
  selectedUser: null,
  messages: [],
  unreadCounts: {},
  loading: false,
  error: undefined,
  users: [],
};
// export interface Message {
//   id: string;
//   sender: string;
//   receiver: string;
//   // text?: string;
//   image?: string;
//   timestamp: number;
// }

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<ChatUser>) => {
      state.selectedUser = action.payload;
      if (action.payload.email) {
        state.unreadCounts[action.payload.email] = 0;
      }
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    sendMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    receiveMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      console.log("yes ");
      const sender = action.payload.sender;

      if (state.selectedUser?.email !== sender) {
        if (!state.unreadCounts[sender]) state.unreadCounts[sender] = 0;
        state.unreadCounts[sender] += 1;
      }
    },

    // loadMessages: (state, action: PayloadAction<Message[]>) => {
    //   state.messages = action.payload;
    // },
  },
  extraReducers: (builder) => {
    // sendMessageToApi
    builder
      .addCase(sendMessageToApi.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(sendMessageToApi.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessageToApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    builder
      .addCase(fetchConversation.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.users = action.payload;
    });
  },
});
export const selectTotalUnread = (state: { chat: ChatState }) =>
  Object.values(state.chat.unreadCounts).reduce((a, b) => a + b, 0);
export const {
  selectUser,
  clearSelectedUser,
  sendMessage,
  receiveMessage,
  // loadMessages,
} = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
export const getUnreadCount = (state: { chat: ChatState }, userEmail: string) =>
  state.chat.unreadCounts[userEmail] || 0;
console.log("unread?", getUnreadCount);
// Selector to get messages between two users
export const selectConversation = (
  state: { chat: ChatState },
  userEmail: string,
  otherUserEmail: string
) => {
  return state.chat.messages.filter(
    (msg) =>
      (msg.sender === userEmail && msg.receiver === otherUserEmail) ||
      (msg.sender === otherUserEmail && msg.receiver === userEmail)
  );
};
