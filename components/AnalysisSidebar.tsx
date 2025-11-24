import React from 'react';
import { PieChart, ArrowUpRight } from 'lucide-react';
import { Transaction, CategoryConfig } from '../types';

interface AnalysisSidebarProps {
  transactions: Transaction[];
  categoryConfigs: CategoryConfig[];
}

const AnalysisSidebar: React.FC<AnalysisSidebarProps> = ({ transactions, categoryConfigs }) => {
  // Calculate category totals - only filter for positive spending (expenses)
  const categoryTotals = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const totalSpend = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpend > 0 ? (amount / totalSpend) * 100 : 0
    }));

  const getProgressColor = (catName: string) => {
    const config = categoryConfigs.find(c => c.name === catName);
    if (config) return config.color.fill;
    return 'bg-slate-400';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="text-slate-400" size={20} />
          <h3 className="font-bold text-slate-800">Spending Analysis</h3>
        </div>

        <div className="space-y-6">
          {sortedCategories.length > 0 ? (
            sortedCategories.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium text-slate-700">{item.category}</span>
                  <span className="text-sm font-bold text-slate-900">${item.amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getProgressColor(item.category)}`} 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1 text-xs text-slate-400">
                  {item.percentage.toFixed(1)}% of total
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-10 text-slate-400 text-sm">
               No spending data to analyze.
             </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-1.5 rounded text-blue-600 mt-0.5">
            <ArrowUpRight size={14} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-1">Pro Tip</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              Search for specific card numbers (e.g., "0547") to separate spending between primary and secondary cards. Rules you add in Settings apply instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSidebar;