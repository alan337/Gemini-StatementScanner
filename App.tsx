import React, { useState, useMemo } from 'react';
import { Upload, Wallet, Receipt, Calendar, Settings, FileText, Download, Github, Loader2, Edit2, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import TransactionList from './components/TransactionList';
import AnalysisSidebar from './components/AnalysisSidebar';
import SettingsModal from './components/SettingsModal';
import { Transaction, KeywordRule, DEFAULT_RULES, AppState, CATEGORY_NAMES, CategoryConfig, DEFAULT_CATEGORY_CONFIGS, COLOR_PALETTE, CategoryColor } from './types';
import { analyzeStatement } from './services/geminiService';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<KeywordRule[]>(DEFAULT_RULES);
  // Store full config including colors
  const [categoryConfigs, setCategoryConfigs] = useState<CategoryConfig[]>(DEFAULT_CATEGORY_CONFIGS);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [period, setPeriod] = useState<{start: string, end: string}>({ start: 'Unknown', end: 'Unknown' });
  const [fileName, setFileName] = useState<string>('');
  const [extractedTotal, setExtractedTotal] = useState<number | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to get category names string array
  const categories = useMemo(() => categoryConfigs.map(c => c.name), [categoryConfigs]);

  // Process transactions against rules
  const processedTransactions = useMemo(() => {
    return transactions.map(t => {
      // 1. Manual override has highest priority
      if (t.manualCategory) {
        return { ...t, category: t.manualCategory };
      }

      // 2. Keyword rules
      const matchingRule = rules.find(r => 
        t.description.toLowerCase().includes(r.keyword.toLowerCase())
      );
      if (matchingRule) {
        return { ...t, category: matchingRule.category };
      }
      
      // 3. AI / Original
      return t;
    });
  }, [transactions, rules]);

  // Filtered transactions for view and stats
  const filteredTransactions = processedTransactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.amount.toString().includes(searchTerm) ||
    t.cardLast4?.includes(searchTerm)
  );

  const totalSpend = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrorMsg("Please upload a valid PDF file.");
      return;
    }

    setAppState(AppState.PROCESSING);
    setFileName(file.name);
    setErrorMsg('');

    try {
      const result = await analyzeStatement(file);
      setTransactions(result.transactions);
      setPeriod({ start: result.startDate, end: result.endDate });
      setExtractedTotal(result.statementTotal);
      setAppState(AppState.ANALYZED);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to process the statement. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleExport = () => {
    if (processedTransactions.length === 0) return;
    
    const headers = ["Date", "Description", "Card", "Category", "Amount"];
    // Add BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF";
    
    const rows = processedTransactions.map(t => [
      t.date,
      // Escape quotes, remove newlines, and wrap in quotes
      `"${t.description.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      t.cardLast4 || '',
      t.category,
      t.amount.toFixed(2)
    ]);

    const csvContent = headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    // Use encodeURIComponent to handle special characters (like '#') correctly in data URIs
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(BOM + csvContent);
    
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `statement_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setTransactions([]);
    setFileName('');
    setSearchTerm('');
    setExtractedTotal(undefined);
  };

  const handleUpdateRule = (updatedRule: KeywordRule) => {
    setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
  };

  const handleManualCategoryChange = (transactionId: string, newCategory: string) => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId ? { ...t, manualCategory: newCategory } : t
    ));
  };

  // Assign a random unused color for new categories
  const getUnusedColor = (): CategoryColor => {
    const usedColors = new Set(categoryConfigs.map(c => c.color.id));
    const allColors = Object.values(COLOR_PALETTE);
    const unused = allColors.find(c => !usedColors.has(c.id));
    // If all used, pick random
    return unused || allColors[Math.floor(Math.random() * allColors.length)];
  };

  const handleAddCategory = (newCategory: string) => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategoryConfigs([
        ...categoryConfigs, 
        { name: newCategory, color: getUnusedColor() }
      ]);
    }
  };

  const handleUpdateCategoryColor = (categoryName: string, newColor: CategoryColor) => {
    setCategoryConfigs(prev => prev.map(c => 
      c.name === categoryName ? { ...c, color: newColor } : c
    ));
  };

  const isValidationSuccessful = useMemo(() => {
    if (extractedTotal === undefined) return false;
    return Math.abs(totalSpend - extractedTotal) < 1.0; 
  }, [totalSpend, extractedTotal]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <FileText size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Statement<span className="text-blue-600">Scanner</span>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <Edit2 size={14} />
              </button>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {appState === AppState.ANALYZED && (
               <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                 <ShieldCheck size={14} />
                 Secure Processing
               </div>
             )}
             <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
                Powered by Gemini 2.5
             </div>
             <div className="h-6 w-px bg-slate-200 mx-1"></div>
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
             >
                <Settings size={20} />
                <span className="hidden sm:inline text-sm font-medium">Settings</span>
             </button>
             <a href="#" className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Github size={20} /></a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-2 shadow-sm border border-blue-100">
              <Upload size={40} />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-3xl font-bold text-slate-900">Scan your statement</h2>
              <p className="text-slate-500">Upload your credit card PDF statement. We'll extract transactions and categorize them securely using AI.</p>
            </div>
            
            <div className="mt-8">
              <label className="relative cursor-pointer group">
                <input 
                  type="file" 
                  accept="application/pdf"
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <div className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-blue-600/20 group-hover:bg-blue-700 group-hover:-translate-y-0.5 transition-all flex items-center gap-3">
                  <Upload size={20} />
                  Upload PDF Statement
                </div>
              </label>
              <p className="mt-4 text-xs text-slate-400">Supported format: PDF only</p>
            </div>
          </div>
        )}

        {appState === AppState.PROCESSING && (
           <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
             <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
             <h3 className="text-xl font-semibold text-slate-800">Analyzing Statement...</h3>
             <p className="text-slate-500 mt-2">Extracting transactions with Gemini AI</p>
           </div>
        )}

        {appState === AppState.ERROR && (
           <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
             <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
               <ShieldCheck size={32} />
             </div>
             <h3 className="text-xl font-semibold text-slate-800">Processing Error</h3>
             <p className="text-red-500 mt-2 max-w-md">{errorMsg}</p>
             <button onClick={resetApp} className="mt-6 text-slate-600 hover:text-slate-900 underline">Try again</button>
           </div>
        )}

        {appState === AppState.ANALYZED && (
          <>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">{fileName}</h2>
                  <p className="text-xs text-slate-500">Extracted {processedTransactions.length} items</p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                 <button onClick={resetApp} className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <RefreshCw size={16} /> New Upload
                 </button>
                 <button onClick={handleExport} className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20">
                    <Download size={16} /> Export to Excel
                 </button>
              </div>
            </div>

            {extractedTotal !== undefined && isValidationSuccessful && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-emerald-800">Data validation successful</h3>
                  <p className="text-sm text-emerald-600 mt-0.5">
                    The calculated total (${totalSpend.toFixed(2)}) matches the statement summary (${extractedTotal.toFixed(2)}).
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spend</p>
                  <p className="text-2xl font-bold text-slate-900">${totalSpend.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                  <Receipt size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transactions</p>
                  <p className="text-2xl font-bold text-slate-900">{processedTransactions.length}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Period</p>
                  <p className="text-lg font-bold text-slate-900">{period.start} — {period.end}</p>
                </div>
              </div>
            </div>

            {/* Responsive Main Grid: 
                - Mobile: Stacked, auto height, Transaction list limit 500px 
                - Desktop: Side-by-side, fills viewport
            */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:h-[calc(100vh-220px)] h-auto">
               <div className="lg:col-span-2 h-[500px] lg:h-full flex flex-col min-h-0">
                 <TransactionList 
                    transactions={processedTransactions} 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm}
                    categoryConfigs={categoryConfigs}
                    onCategoryChange={handleManualCategoryChange}
                    availableCategories={categories}
                 />
               </div>

               <div className="lg:col-span-1 h-auto lg:h-full overflow-y-auto custom-scrollbar bg-white lg:bg-transparent rounded-xl shadow-sm lg:shadow-none border border-slate-200 lg:border-none p-4 lg:p-0">
                 <AnalysisSidebar 
                   transactions={filteredTransactions} 
                   categoryConfigs={categoryConfigs}
                 />
               </div>
            </div>
          </>
        )}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        rules={rules}
        categoryConfigs={categoryConfigs}
        onAddRule={(newRule) => setRules([...rules, newRule])}
        onUpdateRule={handleUpdateRule}
        onDeleteRule={(id) => setRules(rules.filter(r => r.id !== id))}
        onAddCategory={handleAddCategory}
        onUpdateCategoryColor={handleUpdateCategoryColor}
      />
    </div>
  );
};

export default App;