
import React, { useState } from 'react';
import { AppState, Shift, IncomeType } from '../types';
import { Plus, Calendar, Clock, X, Trash2 } from 'lucide-react';
import { calculatePayBreakdown, calculateShiftHours, formatCurrency } from '../utils';

interface RosterProps {
  state: AppState;
  onSave: (shift: Shift) => void;
  onDelete: (id: string) => void;
}

const Roster: React.FC<RosterProps> = ({ state, onSave, onDelete }) => {
  const [editingItem, setEditingItem] = useState<Shift | null>(null);

  const startAdding = () => {
    setEditingItem({
      id: Date.now().toString(),
      streamId: state.streams[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 30,
      isPaid: false
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.streamId) {
      onSave(editingItem);
      setEditingItem(null);
    }
  };

  const sortedShifts = [...state.shifts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs mb-1">Deployment Log</h2>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Payday Roster</h1>
        </div>
        <button 
          onClick={startAdding}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full red-shadow transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="space-y-3">
        {sortedShifts.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border-2 border-dashed border-zinc-800 rounded-sm">
            <Calendar size={64} className="mx-auto text-zinc-800 mb-6" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Zero Deployment Data</p>
          </div>
        ) : (
          sortedShifts.map(shift => {
            const stream = state.streams.find(s => s.id === shift.streamId);
            if (!stream) return null;
            const breakdown = calculatePayBreakdown(shift, stream);
            const hours = calculateShiftHours(shift.startTime, shift.endTime, shift.breakMinutes);

            return (
              <div 
                key={shift.id} 
                onClick={() => setEditingItem(shift)}
                className="bg-white border-l-[12px] border-black group cursor-pointer card-hover overflow-hidden"
              >
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 ${shift.isPaid ? 'bg-black text-white' : 'bg-red-600 text-white underline decoration-black underline-offset-4'}`}>
                      <Calendar size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-black uppercase italic tracking-tighter leading-none">{stream.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1">
                        {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-zinc-500 font-bold text-[10px] uppercase font-mono">
                        <Clock size={12} /> {shift.startTime} - {shift.endTime} ({hours}H)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-8">
                    <div className="text-left md:text-center">
                      <p className="text-[8px] font-black uppercase text-zinc-400">Gross</p>
                      <p className="font-black text-black tracking-tighter">{formatCurrency(breakdown.gross)}</p>
                    </div>
                    <div className="text-left md:text-center">
                      <p className="text-[8px] font-black uppercase text-red-500">Tax</p>
                      <p className="font-black text-red-600 tracking-tighter">{formatCurrency(breakdown.tax)}</p>
                    </div>
                    <div className="text-left md:text-center">
                      <p className="text-[8px] font-black uppercase text-zinc-400">Super</p>
                      <p className="font-black text-black tracking-tighter">{formatCurrency(breakdown.super + breakdown.superEmployer)}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[8px] font-black uppercase text-red-600 italic">Net Received</p>
                      <p className="font-black text-3xl text-black tracking-tighter italic leading-none">{formatCurrency(breakdown.net)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-50 p-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-black uppercase text-zinc-400 px-4 italic">Time Format: 24H HH:mm</span>
                  <div className="flex gap-4 px-4">
                    <span className="text-[9px] font-black uppercase text-zinc-800">Status: {shift.isPaid ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl p-8 rounded-sm text-black relative my-auto">
            <button onClick={() => setEditingItem(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-black">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6 border-b-4 border-black pb-2 text-red-600">24H Entry Audit</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Income Stream</label>
                  <select 
                    className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-bold outline-none"
                    value={editingItem.streamId}
                    onChange={e => setEditingItem({ ...editingItem, streamId: e.target.value })}
                  >
                    {state.streams.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Date</label>
                  <input type="date" className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-bold" value={editingItem.date} onChange={e => setEditingItem({ ...editingItem, date: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Start (24H)</label>
                  <input type="time" step="60" className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-black font-mono" value={editingItem.startTime} onChange={e => setEditingItem({ ...editingItem, startTime: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">End (24H)</label>
                  <input type="time" step="60" className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-black font-mono" value={editingItem.endTime} onChange={e => setEditingItem({ ...editingItem, endTime: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Break (Min)</label>
                  <input type="number" className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-bold" value={editingItem.breakMinutes} onChange={e => setEditingItem({ ...editingItem, breakMinutes: parseInt(e.target.value) })} />
                </div>
              </div>

              {/* Deduction Override Section */}
              <div className="bg-zinc-100 p-6 space-y-4">
                <h4 className="font-black uppercase italic tracking-widest text-xs border-b border-zinc-200 pb-2 text-black">Audit Overrides</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-zinc-400">Gross</label>
                    <input type="number" step="0.01" className="w-full bg-white p-2 font-bold text-xs" value={editingItem.overrideGross || ''} placeholder="Auto" onChange={e => setEditingItem({ ...editingItem, overrideGross: parseFloat(e.target.value) || undefined })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-red-500">Tax</label>
                    <input type="number" step="0.01" className="w-full bg-white p-2 font-bold text-xs text-red-600" value={editingItem.overrideTax || ''} placeholder="Auto" onChange={e => setEditingItem({ ...editingItem, overrideTax: parseFloat(e.target.value) || undefined })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-zinc-400">Super</label>
                    <input type="number" step="0.01" className="w-full bg-white p-2 font-bold text-xs" value={editingItem.overrideSuper || ''} placeholder="Auto" onChange={e => setEditingItem({ ...editingItem, overrideSuper: parseFloat(e.target.value) || undefined })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-red-600">Net Received</label>
                    <input type="number" step="0.01" className="w-full bg-white p-2 font-black text-xs border-red-200 border" value={editingItem.overrideNet || ''} placeholder="Auto" onChange={e => setEditingItem({ ...editingItem, overrideNet: parseFloat(e.target.value) || undefined })} />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white border border-zinc-200">
                  <input 
                    type="checkbox" 
                    id="paid"
                    className="w-5 h-5 accent-red-600"
                    checked={editingItem.isPaid} 
                    onChange={e => setEditingItem({ 
                      ...editingItem, 
                      isPaid: e.target.checked, 
                      actualPaidAmount: e.target.checked ? (editingItem.overrideNet || calculatePayBreakdown(editingItem, state.streams.find(s => s.id === editingItem.streamId)!).net) : undefined 
                    })} 
                  />
                  <label htmlFor="paid" className="font-black uppercase text-[10px] italic tracking-tighter">Liquid assets verified in account</label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-black text-white font-black uppercase p-6 tracking-tighter hover:bg-zinc-800 transition-colors shadow-xl">
                  Commit Record
                </button>
                <button 
                  type="button" 
                  onClick={() => { if(confirm('Erase this record from ledger?')) { onDelete(editingItem.id); setEditingItem(null); } }}
                  className="bg-red-600 text-white p-6 hover:bg-red-700 transition-colors"
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

export default Roster;
