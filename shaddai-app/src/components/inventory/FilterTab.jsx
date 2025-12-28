import React from 'react';

export default function FilterTab({ active, onClick, label, count, color, icon: Icon }) {
  const colors = {
    gray: active ? 'bg-gray-800 text-white shadow-lg shadow-gray-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200',
    red: active ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-red-600 hover:bg-red-50 border border-red-100',
    orange: active ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-100',
    blue: active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-100',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${colors[color]}`}
    >
      {Icon && <Icon size={16} />}
      {label}
      <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
        {count}
      </span>
    </button>
  );
}
