"use client";

import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./features/auth/authslice";
import {
  persistStore,
  persistReducer,

} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { chatReducer } from "./features/chat/chatsice";

const persistConfig = {
  key: "auth",
  storage,
};
const chatPersistConfig = {
  key: "chat",
  storage,
  whitelist: ["messages"],
};
const persistedAuthReducer = persistReducer(persistConfig, authReducer);
const persistedChatReducer = persistReducer(chatPersistConfig, chatReducer);
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    chat: persistedChatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});


export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
