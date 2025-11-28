/* eslint-disable react-hooks/set-state-in-effect */
import { NavLink, useNavigate } from "react-router-dom";
import { Calendar, Settings, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  const publicMenu = [
    { to: "/", icon: Calendar, label: "Booking Page" },
  ];

  const protectedMenu = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="h-full w-64 bg-slate-50 border-r border-gray-200 fixed left-0 top-0 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="text-white" size={18} />
          </div>
          <h1 className="text-gray-900 font-bold text-lg">Meeting Scheduler</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">

        {/* PUBLIC MENU */}
        {publicMenu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 !text-white"
                  : "!text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <item.icon size={18} />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}

        {/* PROTECTED MENU (hanya jika login) */}
        {loggedIn &&
          protectedMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 !text-white"
                    : "!text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}

        {/* AUTH BUTTON */}
        {!loggedIn ? (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mt-4 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 !text-white"
                  : "!text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <LogIn size={18} />
            <span className="font-medium text-sm">Login</span>
          </NavLink>
        ) : (
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 mt-4 rounded-lg transition-colors text-red-600 hover:bg-red-100 w-full text-left"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        )}
      </nav>
    </div>
  );
}
