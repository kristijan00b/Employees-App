import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-5 bg-white min-h-screen text-gray-900">
        <Outlet/>
      </main>
    </div>
  );
};

export default Dashboard;
