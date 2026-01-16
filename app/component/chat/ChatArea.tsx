"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import {
  sendMessage,
  selectConversation,
  receiveMessage,
  Message,
} from "@/app/redux/features/chat/chatsice";
import { socket } from "@/app/lib/socket";
// import { sendMessageToApi } from "@/app/redux/features/chat/chatthunk";

export default function ChatArea() {
  const dispatch = useDispatch<AppDispatch>();
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const selectedUser = useSelector(
    (state: RootState) => state.chat.selectedUser
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const handleTyping = ({ from }: any) => {
      if (from === selectedUser?.email) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ from }: any) => {
      if (from === selectedUser?.email) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (!currentUser?.email) return;

    socket.connect();

    const handleConnect = () => {
      console.log(" Socket connected with id:", socket.id);
      setIsConnected(true);
      socket.emit("join", currentUser.email);
    };

    const handleDisconnect = () => {
      console.log(" Socket disconnected");
      setIsConnected(false);
    };

    const handleConnectError = (error: any) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
    };
  }, [currentUser?.email]);
  useEffect(() => {
    console.log("Setting up socket listener for receive-message");

    const handleReceiveMessage = (message: any) => {
      console.log("Received message:", message);
      dispatch(receiveMessage(message));
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [dispatch]);

  const conversation = useSelector((state: RootState) =>
    currentUser && selectedUser
      ? selectConversation(state, currentUser.email, selectedUser.email)
      : []
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.length]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser || !currentUser) return;
    if (!socket.connected) {
      console.error("Socket not connected!");
      return;
    }

    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`, // unique ID
      sender: currentUser.email,
      receiver: selectedUser.email,
      text: message.trim(),
      timestamp: Date.now(),
    };

    // Optimistic UI update
    dispatch(sendMessage(newMessage));
    socket.emit("send-message", newMessage);

    try {
      console.log("now");
      // Persist message to backend
      // await dispatch(sendMessageToApi(newMessage)).unwrap();
    } catch (err) {
      console.error("Failed to send message to API:", err);
    }

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const typingTimeout = useRef<any>(null);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (!selectedUser || !currentUser) return;

    socket.emit("typing", {
      from: currentUser.email,
      to: selectedUser.email,
    });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop-typing", {
        from: currentUser.email,
        to: selectedUser.email,
      });
    }, 1200);
  };
  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chat_uploads");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dwuuz5o9v/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedUser || !currentUser) return;

    setUploadingCount(files.length);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const imageUrl = await uploadImageToCloudinary(file);

        const newMessage: Message = {
          id: `${Date.now()}-${Math.random()}`,
          sender: currentUser.email,
          receiver: selectedUser.email,
          image: imageUrl,
          timestamp: Date.now(),
        };

        // Optimistic update
        dispatch(sendMessage(newMessage));
        socket.emit("send-message", newMessage);

        // Persist message
        // await dispatch(sendMessageToApi(newMessage)).unwrap();
      } catch (err) {
        console.error("Image upload or API error:", err);
        // Optional: show error toast
      } finally {
        setUploadingCount((prev) => prev - 1);
      }
    }

    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-115px)] bg-zinc-900 rounded-lg border border-zinc-800 ">
      {/* Chat Header */}
      <div className="h-14 px-4 flex items-center gap-3 border-b border-zinc-800">
        {selectedUser ? (
          <>
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 px-4 pb-1 min-h-[40px]">
              {isTyping ? (
                <p className="text-xs text-zinc-400">
                  {selectedUser?.name || selectedUser?.email.split("@")[0]} is
                  typing...
                </p>
              ) : (
                <>
                  <h3 className="text-white font-semibold">
                    {selectedUser?.name || selectedUser?.email.split("@")[0]}
                  </h3>
                  <p className="text-xs text-zinc-400">{selectedUser?.email}</p>
                </>
              )}
            </div>

            {/* Connection status indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-zinc-400">
                {isConnected ? "Online" : "Offline"}
              </span>
            </div>
          </>
        ) : (
          <h3 className="text-white font-semibold">Select a user to chat</h3>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedUser ? (
          conversation.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-zinc-500">
                <User size={48} className="mx-auto mb-2 opacity-50" />
                <p>
                  Start chatting with{" "}
                  {selectedUser.name || selectedUser.email.split("@")[0]}
                </p>
              </div>
            </div>
          ) : (
            <>
              {uploadingCount > 0 &&
                Array.from({ length: uploadingCount }).map((_, i) => (
                  <div key={i} className="flex justify-end">
                    <div className="bg-zinc-800 p-2 rounded-lg">
                      <div className="w-[200px] h-[140px] bg-zinc-700 animate-pulse rounded-md" />
                      <div className="h-3 w-20 bg-zinc-700 animate-pulse rounded mt-2" />
                    </div>
                  </div>
                ))}

              {conversation.map((msg) => {
                const isCurrentUser = msg.sender === currentUser?.email;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isCurrentUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isCurrentUser
                          ? "bg-green-600 text-white"
                          : "bg-zinc-800 text-white"
                      }`}
                    >
                      {msg.text && (
                        <p className="text-sm break-words">{msg.text}</p>
                      )}

                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Shared image"
                          className="max-w-[200px] rounded-lg cursor-pointer"
                          onClick={() => window.open(msg.image, "_blank")}
                        />
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 mt-1 px-1">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-zinc-500">
              <User size={48} className="mx-auto mb-2 opacity-50" />
              <p>Select a user from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800 flex gap-2">
        <input
          type="file"
          accept="image/*"
          hidden
          multiple
          id="imageUpload"
          onChange={handleImageUpload}
        />

        <label
          htmlFor="imageUpload"
          className="cursor-pointer text-green-500 text-xl  "
        >
          📷
        </label>
        <Input
          placeholder={
            selectedUser
              ? `Message ${
                  selectedUser.name || selectedUser.email.split("@")[0]
                }...`
              : "Select a user to start chatting..."
          }
          className="bg-zinc-950 border-zinc-700 text-white"
          value={message}
          // onChange={(e) => setMessage(e.target.value)}
          onChange={handleTyping}
          onKeyPress={handleKeyPress}
          disabled={!selectedUser}
        />
        <Button
          disabled={!selectedUser || !message.trim() || !isConnected}
          onClick={handleSendMessage}
          className="cursor-pointer bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors rounded p-2"
        >
          <Send size={18} className="text-white" />
        </Button>
      </div>
    </div>
  );
}
