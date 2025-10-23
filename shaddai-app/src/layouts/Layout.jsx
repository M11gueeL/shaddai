import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className={`flex flex-col flex-1 transition-all duration-300
        ${sidebarOpen 
          ? 'md:ml-64' 
          : 'md:ml-20'  
        }
      `}>
        
        <div className="sticky top-0 z-30">
          <Header 
            sidebarOpen={sidebarOpen} 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          />
        </div>
        
        <main className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
