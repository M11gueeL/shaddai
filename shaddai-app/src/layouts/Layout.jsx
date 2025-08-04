import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 ">
            <Header />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default Layout;