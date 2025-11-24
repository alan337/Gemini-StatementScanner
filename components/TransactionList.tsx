import React, { useState } from 'react';
import { Search, Edit2 } from 'lucide-react';
import { Transaction, CategoryConfig } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryConfigs: CategoryConfig[];
  onCategoryChange: (id: string, newCategory: string) => void;
  availableCategories: string[];
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  searchTerm, 
  onSearchChange, 
  categoryConfigs,
  onCategoryChange,
  availableCategories
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.amount.toString().includes(searchTerm) ||
    t.cardLast4?.includes(searchTerm)
  );

  const getCategoryStyle = (catName: string) => {
    const config = categoryConfigs.find(c => c.name === catName);
    if (config) {
      return `${config.color.bg} ${config.color.text} ${config.color.border}`;
    }
    // Fallback
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const handleCategorySelect = (id: string, newCat: string) => {
    onCategoryChange(id, newCat);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by merchant, amount, or card..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none text-sm"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="col-span-2">Date</div>
        <div className="col-span-5">Description</div>
        <div className="col-span-1 text-center">Card</div>
        <div className="col-span-2 text-center">Category</div>
        <div className="col-span-2 text-right">Amount</div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {filtered.length > 0 ? (
          filtered.map((t) => (
            <div key={t.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-50 hover:bg-blue-50/30 transition-colors items-center group">
              <div className="col-span-2 text-sm text-slate-500 font-medium">{t.date}</div>
              <div className="col-span-5 text-sm font-semibold text-slate-800 truncate" title={t.description}>
                {t.description}
              </div>
              <div className="col-span-1 text-center">
                 {t.cardLast4 && (
                   <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                     {t.cardLast4}
                   </span>
                 )}
              </div>
              
              <div className="col-span-2 flex justify-center items-center h-full relative group/cat">
                {editingId === t.id ? (
                  <select 
                    autoFocus
                    className="text-xs border border-blue-400 rounded px-1 py-1 bg-white shadow-sm outline-none w-full max-w-[120px]"
                    value={t.category}
                    onChange={(e) => handleCategorySelect(t.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                  >
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setEditingId(t.id)}>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getCategoryStyle(t.category)}`}>
                      {t.category}
                    </span>
                    <button 
                      className="text-slate-300 hover:text-blue-500 transition-colors opacity-0 group-hover/cat:opacity-100 p-1"
                      title="Edit Category"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className={`col-span-2 text-right text-sm font-bold ${t.amount < 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                {t.amount < 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <p className="text-sm">No transactions found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
      
      {/* Footer count */}
      <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-right">
        Showing {filtered.length} of {transactions.length} items
      </div>
    </div>
  );
};

export default TransactionList;