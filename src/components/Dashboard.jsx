import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="h-screen flex overflow-hidden">
      <div className="w-64 fixed left-0 top-0 h-screen">
        <Sidebar />
      </div>
      <main className="ml-64 flex-1 h-screen overflow-y-auto bg-gray-100 p-5 text-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
