
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  CalendarDays, 
  ReceiptText, 
  TrendingUp,
  Download
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import IncomeStreams from './components/IncomeStreams';
import Roster from './components/Roster';
import Expenses from './components/Expenses';
import { AppState, IncomeStream, Shift, Expense } from './types';
import { INITIAL_STREAMS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'roster' | 'expenses'>('dashboard');
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('student_fin_state');
    if (saved) return JSON.parse(saved);
    return {
      streams: INITIAL_STREAMS,
      shifts: [],
      expenses: [],
    };
  });

  useEffect(() => {
    localStorage.setItem('student_fin_state', JSON.stringify(state));
  }, [state]);

  const addOrUpdateStream = (stream: IncomeStream) => setState(prev => {
    const exists = prev.streams.find(s => s.id === stream.id);
    if (exists) {
      return { ...prev, streams: prev.streams.map(s => s.id === stream.id ? stream : s) };
    }
    return { ...prev, streams: [...prev.streams, stream] };
  });
  
  const addOrUpdateShift = (shift: Shift) => setState(prev => {
    const exists = prev.shifts.find(s => s.id === shift.id);
    if (exists) {
      return { ...prev, shifts: prev.shifts.map(s => s.id === shift.id ? shift : s) };
    }
    return { ...prev, shifts: [...prev.shifts, shift] };
  });

  const addOrUpdateExpense = (expense: Expense) => setState(prev => {
    const exists = prev.expenses.find(e => e.id === expense.id);
    if (exists) {
      return { ...prev, expenses: prev.expenses.map(e => e.id === expense.id ? expense : e) };
    }
    return { ...prev, expenses: [...prev.expenses, expense] };
  });

  const deleteStream = (id: string) => setState(prev => ({ ...prev, streams: prev.streams.filter(s => s.id !== id) }));
  const deleteShift = (id: string) => setState(prev => ({ ...prev, shifts: prev.shifts.filter(s => s.id !== id) }));
  const deleteExpense = (id: string) => setState(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));

  const exportData = () => {
    const csvRows = [
      ['Date', 'Type', 'Category/Stream', 'Amount', 'Note'],
      ...state.expenses.map(e => [e.date, 'Expense', e.category, e.amount, e.note || '']),
      ...state.shifts.filter(s => s.isPaid).map(s => {
        const stream = state.streams.find(st => st.id === s.streamId);
        return [s.date, 'Income', stream?.name || 'Unknown', s.actualPaidAmount || 0, 'Shift'];
      })
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bucky-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pb-20 md:pb-0 md:pl-64">
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-black border-r border-zinc-800 flex-col p-6 z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-red-600 p-2 rounded-lg text-white">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">BUCKY</h1>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="COMMAND CENTER" />
          <NavItem active={activeTab === 'income'} onClick={() => setActiveTab('income')} icon={<Wallet size={20} />} label="REVENUE SOURCES" />
          <NavItem active={activeTab === 'roster'} onClick={() => setActiveTab('roster')} icon={<CalendarDays size={20} />} label="PAYDAY ROSTER" />
          <NavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<ReceiptText size={20} />} label="EXPENDITURE" />
        </nav>

        <button 
          onClick={exportData}
          className="mt-auto flex items-center gap-2 text-zinc-500 hover:text-red-500 font-bold text-xs uppercase tracking-widest py-3 px-4 transition-colors"
        >
          <Download size={16} />
          <span>Export Audit Log</span>
        </button>
      </aside>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-10">
        {activeTab === 'dashboard' && <Dashboard state={state} />}
        {activeTab === 'income' && <IncomeStreams streams={state.streams} onSave={addOrUpdateStream} onDelete={deleteStream} />}
        {activeTab === 'roster' && <Roster state={state} onSave={addOrUpdateShift} onDelete={deleteShift} />}
        {activeTab === 'expenses' && <Expenses expenses={state.expenses} onSave={addOrUpdateExpense} onDelete={deleteExpense} />}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 flex justify-around items-center p-3 z-20">
        <MobileNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={24} />} />
        <MobileNavItem active={activeTab === 'income'} onClick={() => setActiveTab('income')} icon={<Wallet size={24} />} />
        <MobileNavItem active={activeTab === 'roster'} onClick={() => setActiveTab('roster')} icon={<CalendarDays size={24} />} />
        <MobileNavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<ReceiptText size={24} />} />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-md transition-all uppercase text-xs tracking-widest font-bold ${active ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full transition-all ${active ? 'text-red-500' : 'text-zinc-600'}`}
  >
    {icon}
  </button>
);

export default App;
