import { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  const [isOpen, setIsOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <Navbar />

      {/* Sidebar + Main Content */}
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <Sidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />

        {/* Main Content */}
        <main
          className={`min-w-0 flex-1 p-6 transition-all duration-300 ${
            isOpen
              ? "ml-64"
              : "ml-20"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;