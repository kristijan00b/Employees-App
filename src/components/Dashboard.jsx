import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 fixed left-0 top-0 h-screen bg-gray-900">
        <Sidebar />
      </div>

      {/* Mobile navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 md:ml-64 h-screen overflow-y-auto p-2 md:p-5 text-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
