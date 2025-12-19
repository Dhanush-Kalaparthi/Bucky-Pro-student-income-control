
import React, { useState } from 'react';
import { IncomeStream, IncomeType, PayFrequency, DeductionMethod, SuperType } from '../types';
import { Plus, Briefcase, Trash2, X, Info } from 'lucide-react';
import { formatCurrency } from '../utils';

interface IncomeStreamsProps {
  streams: IncomeStream[];
  onSave: (stream: IncomeStream) => void;
  onDelete: (id: string) => void;
}

const IncomeStreams: React.FC<IncomeStreamsProps> = ({ streams, onSave, onDelete }) => {
  const [editingItem, setEditingItem] = useState<IncomeStream | null>(null);

  const startAdding = () => {
    setEditingItem({
      id: Date.now().toString(),
      name: '',
      type: IncomeType.HOURLY,
      payRate: 0,
      frequency: PayFrequency.WEEKLY,
      color: '#EF4444',
      isNetPay: false,
      taxEnabled: false,
      taxMethod: DeductionMethod.PERCENT,
      taxValue: 0,
      superEnabled: false,
      superMethod: DeductionMethod.PERCENT,
      superValue: 0,
      superType: SuperType.EMPLOYER_PAID
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.name && editingItem.payRate >= 0) {
      onSave(editingItem);
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs mb-1">Asset Management</h2>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Revenue Streams</h1>
        </div>
        <button 
          onClick={startAdding}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full red-shadow transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {streams.map(stream => (
          <button 
            key={stream.id} 
            onClick={() => setEditingItem(stream)}
            className="bg-white p-8 border border-zinc-200 text-left flex items-center justify-between group card-hover overflow-hidden relative"
          >
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-black text-white">
                <Briefcase size={28} />
              </div>
              <div>
                <h3 className="font-black text-2xl text-black uppercase italic tracking-tighter leading-none">{stream.name}</h3>
                <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                  {stream.isNetPay ? 'NET' : 'GROSS'} • {stream.type} • {stream.frequency}
                </p>
                <div className="flex gap-2 mt-2">
                  {stream.taxEnabled && <span className="bg-red-100 text-red-600 px-1 font-black text-[8px] uppercase">Tax Active</span>}
                  {stream.superEnabled && <span className="bg-black text-white px-1 font-black text-[8px] uppercase">Super Active</span>}
                </div>
              </div>
            </div>
            <div className="text-right relative z-10">
              <p className="font-black text-xl text-black tracking-tighter leading-none">{formatCurrency(stream.payRate)}</p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Base Rate</p>
            </div>
            <div className="absolute right-0 bottom-0 p-2 opacity-5 scale-150 group-hover:opacity-20 transition-opacity">
              <Briefcase size={64} />
            </div>
          </button>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl p-8 rounded-sm text-black relative my-auto">
            <button onClick={() => setEditingItem(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-black">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6 border-b-4 border-black pb-2">Stream Configuration</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Stream Label</label>
                  <input 
                    autoFocus required
                    className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-bold text-lg outline-none focus:border-black"
                    value={editingItem.name}
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Frequency</label>
                  <select 
                    className="w-full border-2 border-zinc-100 bg-zinc-50 p-4 font-bold outline-none"
                    value={editingItem.frequency}
                    onChange={e => setEditingItem({ ...editingItem, frequency: e.target.value as PayFrequency })}
                  >
                    {Object.values(PayFrequency).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Rate Configuration */}
              <div className="bg-zinc-950 p-6 text-white space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black uppercase italic tracking-widest text-xs text-red-500">Rate Engineering</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase">Gross</span>
                    <button 
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, isNetPay: !editingItem.isNetPay })}
                      className={`w-12 h-6 rounded-full relative transition-colors ${editingItem.isNetPay ? 'bg-red-600' : 'bg-zinc-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingItem.isNetPay ? 'left-7' : 'left-1'}`}></div>
                    </button>
                    <span className="text-[10px] font-black uppercase">Net</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500">Rate Basis</label>
                    <select className="w-full bg-zinc-900 border-b-2 border-zinc-700 p-2 font-bold outline-none" value={editingItem.type} onChange={e => setEditingItem({ ...editingItem, type: e.target.value as IncomeType })}>
                      <option value={IncomeType.HOURLY}>Hourly Rate</option>
                      <option value={IncomeType.FIXED}>Fixed per Period</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500">Value (USD)</label>
                    <input type="number" step="0.01" className="w-full bg-zinc-900 border-b-2 border-zinc-700 p-2 font-black text-xl outline-none" value={editingItem.payRate} onChange={e => setEditingItem({ ...editingItem, payRate: parseFloat(e.target.value) })} />
                  </div>
                </div>
              </div>

              {/* Tax & Super Tabs (Side by side on desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tax Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <h4 className="font-black uppercase text-xs">Tax Handling</h4>
                    <input type="checkbox" className="w-5 h-5 accent-red-600" checked={editingItem.taxEnabled} onChange={e => setEditingItem({ ...editingItem, taxEnabled: e.target.checked })} />
                  </div>
                  {editingItem.taxEnabled && (
                    <div className="space-y-3 animate-in slide-in-from-top-1">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditingItem({ ...editingItem, taxMethod: DeductionMethod.PERCENT })} className={`flex-1 p-2 text-[10px] font-black uppercase border-2 ${editingItem.taxMethod === DeductionMethod.PERCENT ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-400'}`}>% Percent</button>
                        <button type="button" onClick={() => setEditingItem({ ...editingItem, taxMethod: DeductionMethod.FIXED })} className={`flex-1 p-2 text-[10px] font-black uppercase border-2 ${editingItem.taxMethod === DeductionMethod.FIXED ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-400'}`}>$ Fixed</button>
                      </div>
                      <div className="relative">
                        <input type="number" className="w-full border-b-2 border-zinc-200 p-2 font-black text-lg outline-none" value={editingItem.taxValue} onChange={e => setEditingItem({ ...editingItem, taxValue: parseFloat(e.target.value) })} />
                        <span className="absolute right-2 bottom-2 text-xs font-black text-zinc-300 uppercase">{editingItem.taxMethod === DeductionMethod.PERCENT ? '%' : 'USD'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Super Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <h4 className="font-black uppercase text-xs">Superannuation</h4>
                    <input type="checkbox" className="w-5 h-5 accent-red-600" checked={editingItem.superEnabled} onChange={e => setEditingItem({ ...editingItem, superEnabled: e.target.checked })} />
                  </div>
                  {editingItem.superEnabled && (
                    <div className="space-y-3 animate-in slide-in-from-top-1">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditingItem({ ...editingItem, superMethod: DeductionMethod.PERCENT })} className={`flex-1 p-2 text-[10px] font-black uppercase border-2 ${editingItem.superMethod === DeductionMethod.PERCENT ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-400'}`}>% Percent</button>
                        <button type="button" onClick={() => setEditingItem({ ...editingItem, superMethod: DeductionMethod.FIXED })} className={`flex-1 p-2 text-[10px] font-black uppercase border-2 ${editingItem.superMethod === DeductionMethod.FIXED ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-400'}`}>$ Fixed</button>
                      </div>
                      <input type="number" className="w-full border-b-2 border-zinc-200 p-2 font-black text-lg outline-none" value={editingItem.superValue} onChange={e => setEditingItem({ ...editingItem, superValue: parseFloat(e.target.value) })} />
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-zinc-400">Treatment</label>
                        <select className="w-full bg-zinc-50 p-2 font-bold text-[10px] uppercase outline-none" value={editingItem.superType} onChange={e => setEditingItem({ ...editingItem, superType: e.target.value as SuperType })}>
                          <option value={SuperType.EMPLOYER_PAID}>Employer Paid (On Top)</option>
                          <option value={SuperType.INCLUDED_IN_GROSS}>Included in Gross (Set Aside)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-black text-white font-black uppercase p-6 tracking-tighter hover:bg-zinc-800 transition-colors shadow-xl">
                  Commit To Ledger
                </button>
                <button 
                  type="button" 
                  onClick={() => { if(confirm('Erase this income asset?')) { onDelete(editingItem.id); setEditingItem(null); } }}
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

export default IncomeStreams;
