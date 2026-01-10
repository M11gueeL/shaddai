import React from 'react';

export default function SummaryCard({ icon: Icon, label, value, subtext, color, bg }) {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        green: "bg-green-50 text-green-600 ring-green-100",
        blue: "bg-blue-50 text-blue-600 ring-blue-100",
        purple: "bg-purple-50 text-purple-600 ring-purple-100",
    };
    const cClass = colors[bg] || colors.emerald;

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${cClass} ring-1 ring-inset`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1 font-medium">{subtext}</p>}
            </div>
        </div>
    );
}
