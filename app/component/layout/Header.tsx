"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { selectTotalUnread } from "@/app/redux/features/chat/chatsice";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { selectUser } from "@/app/redux/features/chat/chatsice";
export default function Header() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();

  const totalUnread = useSelector(selectTotalUnread);
  const unreadCounts = useSelector(
    (state: RootState) => state.chat.unreadCounts
  );

  function handlelogout() {
    router.push("/login");
  }

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
      <h1 className="text-white text-lg font-semibold"></h1>

      <div className="flex items-center gap-4 relative">
        {/* Bell */}
        <button
          className="relative text-zinc-400 hover:text-white"
          onClick={() => setShow(!show)}
        >
          <Bell size={20} />

          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {show && (
          <div className="absolute right-0 top-10 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-50">
            {Object.values(unreadCounts).every((c) => c === 0) ? (
              <p className="text-zinc-500 p-3 text-sm">No new notifications</p>
            ) : (
              Object.entries(unreadCounts).map(([email, count]) =>
                count > 0 ? (
                  <div
                    key={email}
                    onClick={() => {
                      dispatch(selectUser({ email }));
                      setShow(false);
                    }}
                    className="p-3 border-b border-zinc-800 text-sm text-white cursor-pointer hover:bg-zinc-800"
                  >
                    <span className="font-medium">{email.split("@")[0]}</span>{" "}
                    sent {count} messages for you !
                  </div>
                ) : null
              )
            )}
          </div>
        )}

        {/* Logout */}
        <button
          className="flex items-center gap-2 text-zinc-300 hover:text-white"
          onClick={handlelogout}
        >
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
}
