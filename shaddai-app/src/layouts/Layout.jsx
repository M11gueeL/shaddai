import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex flex-1 mx-auto w-full sm:px-6 lg:px-0 overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Contenido principal */}
        <main className={`flex-1 bg-green-200 shadow-md p-8 transition-all duration-300 overflow-y-auto ${
          sidebarOpen ? "ml-0" : "ml-0"
        }`}>
          <Outlet />
        </main>
      </div>
      
      <Footer />
    </div>
  );
}