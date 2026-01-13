import Sidebar from "../component/layout/Sidebar";
import Header from "../component/layout/Header";
import ChatArea from "../component/chat/ChatArea";
export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 text-white">
          <ChatArea />
        </main>
      </div>
    </div>
  );
}
