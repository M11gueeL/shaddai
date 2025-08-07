import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="sticky top-0 z-50">
        <Header 
          sidebarOpen={sidebarOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
      </div>
      
      <div className="flex flex-1"> {/* Añadido mt-16 aquí */}
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Contenido principal */}
        <main className={`flex-1 min-h-0 overflow-y-auto ${
          sidebarOpen 
        }`}>
          <Outlet />
        </main>
      </div>
      
      <Footer />
    </div>
  );
}