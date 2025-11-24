
export interface Transaction {
  id: string;
  date: string;
  description: string;
  cardLast4: string;
  category: string;
  amount: number;
  originalCategory?: string; // To store AI's initial guess before rules
  manualCategory?: string;   // User manual override
}

export interface KeywordRule {
  id: string;
  keyword: string;
  category: string;
}

export interface StatementSummary {
  totalSpend: number;
  transactionCount: number;
  startDate: string;
  endDate: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  ANALYZED = 'ANALYZED',
  ERROR = 'ERROR'
}

// Visual styling for categories
export interface CategoryColor {
  id: string;
  bg: string;    // e.g., bg-emerald-100
  text: string;  // e.g., text-emerald-700
  border: string;// e.g., border-emerald-200
  fill: string;  // e.g., bg-emerald-500 (for charts)
}

export interface CategoryConfig {
  name: string;
  color: CategoryColor;
}

export const COLOR_PALETTE: Record<string, CategoryColor> = {
  emerald: { id: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', fill: 'bg-emerald-500' },
  green:   { id: 'green',   bg: 'bg-green-100',   text: 'text-green-700',   border: 'border-green-200',   fill: 'bg-green-500' },
  lime:    { id: 'lime',    bg: 'bg-lime-100',    text: 'text-lime-700',    border: 'border-lime-200',    fill: 'bg-lime-500' },
  teal:    { id: 'teal',    bg: 'bg-teal-100',    text: 'text-teal-700',    border: 'border-teal-200',    fill: 'bg-teal-500' },
  cyan:    { id: 'cyan',    bg: 'bg-cyan-100',    text: 'text-cyan-700',    border: 'border-cyan-200',    fill: 'bg-cyan-500' },
  sky:     { id: 'sky',     bg: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-200',     fill: 'bg-sky-500' },
  blue:    { id: 'blue',    bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-200',    fill: 'bg-blue-500' },
  indigo:  { id: 'indigo',  bg: 'bg-indigo-100',  text: 'text-indigo-700',  border: 'border-indigo-200',  fill: 'bg-indigo-500' },
  violet:  { id: 'violet',  bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-200',  fill: 'bg-violet-500' },
  purple:  { id: 'purple',  bg: 'bg-purple-100',  text: 'text-purple-700',  border: 'border-purple-200',  fill: 'bg-purple-500' },
  fuchsia: { id: 'fuchsia', bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200', fill: 'bg-fuchsia-500' },
  pink:    { id: 'pink',    bg: 'bg-pink-100',    text: 'text-pink-700',    border: 'border-pink-200',    fill: 'bg-pink-500' },
  rose:    { id: 'rose',    bg: 'bg-rose-100',    text: 'text-rose-700',    border: 'border-rose-200',    fill: 'bg-rose-500' },
  red:     { id: 'red',     bg: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-200',     fill: 'bg-red-500' },
  orange:  { id: 'orange',  bg: 'bg-orange-100',  text: 'text-orange-700',  border: 'border-orange-200',  fill: 'bg-orange-500' },
  amber:   { id: 'amber',   bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-200',   fill: 'bg-amber-500' },
  yellow:  { id: 'yellow',  bg: 'bg-yellow-100',  text: 'text-yellow-700',  border: 'border-yellow-200',  fill: 'bg-yellow-500' },
  slate:   { id: 'slate',   bg: 'bg-slate-100',   text: 'text-slate-700',   border: 'border-slate-200',   fill: 'bg-slate-500' },
  gray:    { id: 'gray',    bg: 'bg-gray-100',    text: 'text-gray-700',    border: 'border-gray-200',    fill: 'bg-gray-500' },
  zinc:    { id: 'zinc',    bg: 'bg-zinc-100',    text: 'text-zinc-700',    border: 'border-zinc-200',    fill: 'bg-zinc-500' },
  neutral: { id: 'neutral', bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-200', fill: 'bg-neutral-500' },
  stone:   { id: 'stone',   bg: 'bg-stone-100',   text: 'text-stone-700',   border: 'border-stone-200',   fill: 'bg-stone-500' },
};

export const DEFAULT_CATEGORY_CONFIGS: CategoryConfig[] = [
  // Food & Living
  { name: 'Groceries', color: COLOR_PALETTE.emerald },
  { name: 'Dining', color: COLOR_PALETTE.orange },
  
  // Transit & Travel
  { name: 'Gas', color: COLOR_PALETTE.amber },
  { name: 'Transportation', color: COLOR_PALETTE.yellow },
  { name: 'Travel', color: COLOR_PALETTE.cyan },
  
  // Tech & Utilities (Blue spectrum)
  { name: 'Internet', color: COLOR_PALETTE.sky },
  { name: 'Cellphone', color: COLOR_PALETTE.blue },
  { name: 'Online Services', color: COLOR_PALETTE.indigo },
  { name: 'Utilities', color: COLOR_PALETTE.teal },
  
  // Lifestyle (Vibrant)
  { name: 'Shopping', color: COLOR_PALETTE.fuchsia },
  { name: 'Entertainment', color: COLOR_PALETTE.purple },
  { name: 'Donation', color: COLOR_PALETTE.rose },
  
  // Misc & Work (Neutral/Professional)
  { name: 'Business', color: COLOR_PALETTE.slate },
  { name: 'Other', color: COLOR_PALETTE.stone }
];

// For fallback in prompts only
export const CATEGORY_NAMES = DEFAULT_CATEGORY_CONFIGS.map(c => c.name);

export const DEFAULT_RULES: KeywordRule[] = [
  { id: '1', keyword: "'S NF", category: 'Groceries' },
  { id: '2', keyword: "ESSO", category: 'Gas' },
  { id: '3', keyword: "COSTCO GAS", category: 'Gas' },
  { id: '4', keyword: "NETFLIX", category: 'Entertainment' },
  { id: '5', keyword: "407ETR", category: 'Transportation' },
  { id: '6', keyword: "CORP CANADA", category: 'Business' },
  { id: '7', keyword: "ROGERS ******2665", category: 'Cellphone' },
  { id: '8', keyword: "ROGERS ******8017", category: 'Internet' },
  { id: '9', keyword: "WWW.COSTCO CA", category: 'Shopping' }
];
