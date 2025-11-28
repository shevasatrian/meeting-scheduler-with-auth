import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function SidebarLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
