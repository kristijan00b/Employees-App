import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Navbar = () => {
  const { logOutUser } = UserAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (path) =>
    `block px-4 py-2 rounded-lg transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <div className="md:hidden w-full bg-gray-900 text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <img
            src="https://cdn-icons-png.freepik.com/512/622/622850.png"
            alt="Logo"
            className="h-10"
          />
          <span className="font-semibold">Employees Portal</span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="hover:cursor-pointer focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="bg-gray-900 p-3 space-y-2">
          <Link
            to="/dashboard/employees-list"
            className={linkClass("/dashboard/employees-list")}
            onClick={handleLinkClick}
          >
            Zaposleni
          </Link>
          <Link
            to="/dashboard/employee-add"
            className={linkClass("/dashboard/employee-add")}
            onClick={handleLinkClick}
          >
            Zaposli
          </Link>
          <Link
            to="/dashboard/check-came"
            className={linkClass("/dashboard/check-came")}
            onClick={handleLinkClick}
          >
            Potvrdi dolaske
          </Link>
          <Link
            to="/dashboard/came-history"
            className={linkClass("/dashboard/came-history")}
            onClick={handleLinkClick}
          >
            Istorija dolazaka
          </Link>
          <Link
            to="/dashboard/shifts"
            className={linkClass("/dashboard/shifts")}
            onClick={handleLinkClick}
          >
            Smene
          </Link>

          <button
            onClick={logOutUser}
            className="hover:cursor-pointer w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition mt-2"
          >
            Odjavi se
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
