
import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { Plus, Tag, Trash2, X, Receipt } from 'lucide-react';
import { formatCurrency } from '../utils';

interface ExpensesProps {
  expenses: Expense[];
  onSave: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, onSave, onDelete }) => {
  const [editingItem, setEditingItem] = useState<Expense | null>(null);

  const startAdding = () => {
    setEditingItem({
      id: Date.now().toString(),
      amount: 0,
      category: ExpenseCategory.FOOD,
      date: new Date().toISOString().split('T')[0],
      method: 'CARD',
      note: ''
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.amount > 0) {
      onSave(editingItem);
      setEditingItem(null);
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs mb-1">Expenditure</h2>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Budget Drain</h1>
        </div>
        <button 
          onClick={startAdding}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full red-shadow transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="space-y-1">
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border-2 border-dashed border-zinc-800 rounded-sm">
            <Receipt size={64} className="mx-auto text-zinc-800 mb-6" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Zero Outflow Recorded</p>
          </div>
        ) : (
          sortedExpenses.map(expense => (
            <div 
              key={expense.id} 
              onClick={() => setEditingItem(expense)}
              className="bg-white p-5 border-l-8 border-red-600 flex items-center justify-between group cursor-pointer card-hover"
            >
              <div className="flex items-center gap-6">
                <div className="p-3 bg-black text-white">
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="font-black text-black uppercase italic tracking-tighter text-xl">{expense.category}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {new Date(expense.date).toLocaleDateString()} • {expense.method}
                    {expense.note && <span className="text-black ml-2 opacity-50">• {expense.note}</span>}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-2xl text-red-600 tracking-tighter">{formatCurrency(expense.amount)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg p-8 rounded-sm text-black relative">
            <button onClick={() => setEditingItem(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-black">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6 border-b-4 border-black pb-2">Entry Modification</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Magnitude</label>
                  <input 
                    type="number" step="0.01" required autoFocus
                    className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-black text-xl outline-none"
                    value={editingItem.amount}
                    onChange={e => setEditingItem({ ...editingItem, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</label>
                  <select 
                    className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-bold outline-none appearance-none"
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value as ExpenseCategory })}
                  >
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Timestamp</label>
                  <input type="date" className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-bold outline-none" value={editingItem.date} onChange={e => setEditingItem({ ...editingItem, date: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Channel</label>
                  <select className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-bold outline-none appearance-none" value={editingItem.method} onChange={e => setEditingItem({ ...editingItem, method: e.target.value as any })}>
                    <option value="CARD">Bank Card</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK">Direct Transfer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Annotation</label>
                <input className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-bold outline-none" placeholder="Context..." value={editingItem.note} onChange={e => setEditingItem({ ...editingItem, note: e.target.value })} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-black text-white font-black uppercase p-4 tracking-tighter hover:bg-zinc-800 transition-colors">
                  Authorize Entry
                </button>
                <button 
                  type="button" 
                  onClick={() => { if(confirm('Erase entry?')) { onDelete(editingItem.id); setEditingItem(null); } }}
                  className="bg-red-600 text-white p-4 hover:bg-red-700"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
