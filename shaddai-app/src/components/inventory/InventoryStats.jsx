import React from 'react';
import { Box, TrendingDown, DollarSign } from 'lucide-react';

export default function InventoryStats({ stats }) {
    const { total_items = 0, low_stock_count = 0, total_value = 0 } = stats || {};

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 lg:mt-0 w-full lg:w-auto">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-3 text-gray-500 mb-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <Box size={18} />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider">Total Items</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{total_items}</span>
            </div>

            <div className={`bg-white p-4 rounded-2xl border shadow-sm flex flex-col justify-between group transition-all ${low_stock_count > 0 ? 'border-red-100 hover:border-red-200' : 'border-gray-100 hover:border-indigo-200'}`}>
                <div className="flex items-center gap-3 text-gray-500 mb-2">
                    <div className={`p-2 rounded-lg transition-colors ${low_stock_count > 0 ? 'bg-red-50 text-red-600 group-hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
                        <TrendingDown size={18} />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider">Bajo Stock</span>
                </div>
                <span className={`text-2xl font-bold ${low_stock_count > 0 ? 'text-red-600' : 'text-gray-900'}`}>{low_stock_count}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-all md:flex">
                <div className="flex items-center gap-3 text-gray-500 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <DollarSign size={18} />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wider">Valor Total</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">${Number(total_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
        </div>
    );
}
