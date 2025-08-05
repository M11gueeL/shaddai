import React from "react";

const TabContainer = ({ tabs, children }) => {
  return (
    <div className="w-full">
      {/* Barra de tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            title={tab.title}
            isActive={tab.isActive}
            onClick={tab.onClick}
          />
        ))}
      </div>
      
      {/* Contenido de los tabs */}
      <div className="py-6 px-4 w-full bg-white rounded-b-lg shadow-sm">
        {children}
      </div>
    </div>
  );
};

const TabButton = ({ id, title, isActive, onClick }) => (
  <button
    id={`tab-${id}`}
    onClick={() => onClick(id)}
    className={`flex-1 py-3 px-6 text-center font-medium text-sm transition-colors
      ${isActive
        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
  >
    {title}
  </button>
);

export default TabContainer;