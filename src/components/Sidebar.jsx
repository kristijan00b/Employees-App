import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const linkClass = (path) =>
    `block px-4 py-2 rounded-lg transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex justify-center p-5 border-b border-gray-800">
        <img
          src="https://cdn-icons-png.freepik.com/512/622/622850.png"
          alt=""
          className="h-20"
        />
      </div>
      <nav className="flex-1 p-3 space-y-2">
        <Link to="/dashboard" className={linkClass("/dashboard")}>
          Dashboard
        </Link>

        <Link
          to="/dashboard/employees"
          className={linkClass("/dashboard/employees")}
        >
          Employees List
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
        © {new Date().getFullYear()} Employees Portal App
      </div>
    </aside>
  );
};

export default Sidebar;
