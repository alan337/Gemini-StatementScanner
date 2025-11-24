import React, { useState } from 'react';
import { X, Plus, Trash2, Zap, List, Settings, Save, RotateCcw, Check, Palette } from 'lucide-react';
import { KeywordRule, CategoryConfig, CategoryColor, COLOR_PALETTE } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: KeywordRule[];
  categoryConfigs: CategoryConfig[];
  onAddRule: (rule: KeywordRule) => void;
  onUpdateRule: (rule: KeywordRule) => void;
  onDeleteRule: (id: string) => void;
  onAddCategory: (category: string) => void;
  onUpdateCategoryColor: (category: string, color: CategoryColor) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  rules, 
  categoryConfigs,
  onAddRule, 
  onUpdateRule, 
  onDeleteRule,
  onAddCategory,
  onUpdateCategoryColor
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'rules'>('rules');
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [selectedCategoryForColor, setSelectedCategoryForColor] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = categoryConfigs.map(c => c.name);

  const handleSave = () => {
    if (newKeyword && newCategory) {
      if (editingId) {
        onUpdateRule({
          id: editingId,
          keyword: newKeyword,
          category: newCategory
        });
        setEditingId(null);
      } else {
        onAddRule({
          id: Date.now().toString(),
          keyword: newKeyword,
          category: newCategory
        });
      }
      setNewKeyword('');
      setNewCategory('');
    }
  };

  const handleAddCustomCategory = () => {
    if (newCustomCategory.trim()) {
      onAddCategory(newCustomCategory.trim());
      setNewCustomCategory('');
    }
  };

  const startEditing = (rule: KeywordRule) => {
    setNewKeyword(rule.keyword);
    setNewCategory(rule.category);
    setEditingId(rule.id);
  };

  const cancelEditing = () => {
    setNewKeyword('');
    setNewCategory('');
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'categories' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <List size={16} /> Categories List
          </button>
          <button 
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'rules' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Zap size={16} /> Keyword Rules
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'categories' && (
            <div className="space-y-6">
              
              {/* Color Picker Overlay */}
              {selectedCategoryForColor && (
                <div className="absolute inset-0 z-10 bg-white/95 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
                  <div className="w-full max-w-xs bg-white shadow-2xl rounded-xl border border-slate-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-slate-700 text-sm">Pick color for "{selectedCategoryForColor}"</h3>
                       <button onClick={() => setSelectedCategoryForColor(null)} className="text-slate-400 hover:text-slate-600">
                         <X size={16} />
                       </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.values(COLOR_PALETTE).map((color) => {
                         const isActive = categoryConfigs.find(c => c.name === selectedCategoryForColor)?.color.id === color.id;
                         return (
                           <button
                             key={color.id}
                             onClick={() => {
                               onUpdateCategoryColor(selectedCategoryForColor, color);
                               setSelectedCategoryForColor(null);
                             }}
                             className={`w-10 h-10 rounded-full ${color.bg} ${color.border} border-2 flex items-center justify-center transition-transform hover:scale-110 ${isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                             title={color.id}
                           >
                             {isActive && <Check size={16} className={color.text} />}
                           </button>
                         );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Add New Category
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Category Name" 
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={newCustomCategory}
                    onChange={(e) => setNewCustomCategory(e.target.value)}
                  />
                  <button 
                    onClick={handleAddCustomCategory}
                    disabled={!newCustomCategory.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                  Available Categories <span className="font-normal normal-case text-slate-400 ml-1">(Click to change color)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categoryConfigs.map(c => (
                    <button 
                      key={c.name} 
                      onClick={() => setSelectedCategoryForColor(c.name)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${c.color.bg} ${c.color.text} ${c.color.border}`}
                    >
                      {c.name}
                      <span className="opacity-50"><Palette size={12} /></span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                <strong>How it works:</strong> If a transaction description contains the keyword, it will automatically be assigned to the selected category, overriding the AI.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  {editingId ? 'Edit Rule' : 'Add New Rule'}
                </label>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Keyword (e.g. 'S NF)" 
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${editingId ? 'border-blue-300 bg-blue-50/30 focus:ring-blue-500' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 focus:ring-2'}`}
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <select 
                      className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    
                    {editingId ? (
                      <>
                        <button 
                          onClick={handleSave}
                          disabled={!newKeyword || !newCategory}
                          className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Save size={16} /> Update
                        </button>
                        <button 
                          onClick={cancelEditing}
                          className="bg-slate-200 text-slate-600 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
                          title="Cancel"
                        >
                          <RotateCcw size={16} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={handleSave}
                        disabled={!newKeyword || !newCategory}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Plus size={16} /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Rules ({rules.length})</label>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {rules.length === 0 ? (
                    <div className="text-sm text-slate-400 italic text-center py-4">No custom rules added yet.</div>
                  ) : (
                    rules.map(rule => (
                      <div key={rule.id} className={`flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm group hover:border-blue-300 transition-all ${editingId === rule.id ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono text-xs">"{rule.keyword}"</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-semibold text-slate-800">{rule.category}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEditing(rule)}
                            className="text-slate-400 hover:text-blue-600 p-1.5 rounded-md transition-colors hover:bg-blue-50"
                            title="Edit Rule"
                          >
                            <Settings size={16} />
                          </button>
                          <button 
                            onClick={() => onDeleteRule(rule.id)}
                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-md transition-colors hover:bg-red-50"
                            title="Delete Rule"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;