import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Sidebar = ({ onLinkClick }) => {
  const location = useLocation();
  const { logOutUser } = UserAuth();

  const linkClass = (path) =>
    `block px-4 py-2 rounded-lg transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  const handleLinkClick = () => {
    if (onLinkClick) onLinkClick();
  };

  return (
    <aside className="flex flex-col h-full">
      <div className="flex justify-center p-5 border-b border-gray-800">
        <img
          src="https://cdn-icons-png.freepik.com/512/622/622850.png"
          alt=""
          className="h-20"
        />
      </div>

      <nav className="flex-1 p-3 space-y-2">
        <Link
          to="/dashboard/employees-list"
          className={linkClass("/dashboard/employees-list")}
          onClick={handleLinkClick}
        >
          Employees List
        </Link>
        <Link
          to="/dashboard/employee-add"
          className={linkClass("/dashboard/employee-add")}
          onClick={handleLinkClick}
        >
          Add Employee
        </Link>
        <Link
          to="/dashboard/check-came"
          className={linkClass("/dashboard/check-came")}
          onClick={handleLinkClick}
        >
          Check Came
        </Link>
        <Link
          to="/dashboard/came-history"
          className={linkClass("/dashboard/came-history")}
          onClick={handleLinkClick}
        >
          Came History
        </Link>
        <Link
          to="/dashboard/shifts"
          className={linkClass("/dashboard/shifts")}
          onClick={handleLinkClick}
        >
          Shifts
        </Link>
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={logOutUser}
          className="hover:cursor-pointer w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
          Logout
        </button>
      </div>

      <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
        © {new Date().getFullYear()} Employees Portal App
      </div>
    </aside>
  );
};

export default Sidebar;
