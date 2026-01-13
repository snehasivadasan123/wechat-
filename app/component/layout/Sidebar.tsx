"use client";

import { User as UserIcon } from "lucide-react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/redux/store";
import { selectUser } from "@/app/redux/features/chat/chatsice";
import { fetchUsers } from "@/app/redux/features/auth/usersthunk";

export default function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const selectedUser = useSelector(
    (state: RootState) => state.chat.selectedUser
  );
  const unreadCounts = useSelector(
    (state: RootState) => state.chat.unreadCounts
  );
  const users = useSelector((state: RootState) => state.chat.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers =
    users.filter((u) => u.email !== currentUser?.email) || [];

  const handleSelectUser = (user: any) => {
    dispatch(selectUser({ name: user.name, email: user.email }));
  };

  return (
    <aside className="h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="h-16 flex items-center px-6 text-green-500 text-xl font-bold border-b border-zinc-800">
        We Chat
      </div>

      {currentUser && (
        <div className="px-4 py-3 border-b border-zinc-800">
          <p className="text-zinc-400 text-xs mb-1">Logged in as</p>
          <p className="text-white text-sm font-medium">
            {currentUser.name || currentUser.email}
          </p>
        </div>
      )}

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <div className="flex items-center gap-2 text-green-400 text-sm mb-3 font-medium">
          <UserIcon size={18} />
          <span>Friends ({filteredUsers.length})</span>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-zinc-500 text-sm px-2">No other users</p>
        ) : (
          <div className="space-y-1">
            {filteredUsers.map((user) => {
              const unreadCount = unreadCounts[user.email] || 0;

              return (
                <button
                  key={user.email}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-zinc-800 transition-all text-left ${
                    selectedUser?.email === user.email
                      ? "bg-zinc-800 border border-green-500/40"
                      : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0">
                    <UserIcon size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.name || user.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}
