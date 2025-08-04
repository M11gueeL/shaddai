import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Shaddai</h1>
                        </div>
                    </div>
                    <div className="flex items-center"></div>
                </div>
            </div>
        </header>
    )
}

export default Header;