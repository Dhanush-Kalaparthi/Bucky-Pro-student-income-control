
import React, { useMemo } from 'react';
import { AppState, ExpenseCategory } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { formatCurrency, calculatePayBreakdown } from '../utils';
import { AlertCircle, TrendingUp, TrendingDown, Zap, ShieldCheck, HeartPulse } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const analytics = useMemo(() => {
    // 1. Current Month Filtered Data
    const monthlyExpenses = state.expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const monthlyShifts = state.shifts.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    let totalGrossMonthly = 0;
    let totalNetMonthly = 0;

    monthlyShifts.forEach(s => {
      const stream = state.streams.find(st => st.id === s.streamId);
      if (stream) {
        const breakdown = calculatePayBreakdown(s, stream);
        totalGrossMonthly += breakdown.gross;
        totalNetMonthly += breakdown.net;
      }
    });

    // 2. Cumulative (Lifetime) Data for Tax and Super
    let cumulativeTax = 0;
    let cumulativeSuper = 0;

    state.shifts.forEach(s => {
      const stream = state.streams.find(st => st.id === s.streamId);
      if (stream) {
        const breakdown = calculatePayBreakdown(s, stream);
        cumulativeTax += breakdown.tax;
        cumulativeSuper += breakdown.super + breakdown.superEmployer;
      }
    });

    const totalExpenseMonthly = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netPositionMonthly = totalNetMonthly - totalExpenseMonthly;

    // Charts
    const categoryData = Object.values(ExpenseCategory).map(cat => ({
      name: cat.toUpperCase(),
      value: monthlyExpenses.filter(e => e.category === cat).reduce((a, c) => a + c.amount, 0)
    })).filter(d => d.value > 0);

    const incomeData = state.streams.map(st => {
      const streamShifts = monthlyShifts.filter(s => s.streamId === st.id);
      const streamNet = streamShifts.reduce((acc, s) => acc + calculatePayBreakdown(s, st).net, 0);
      return { name: st.name.toUpperCase(), value: streamNet };
    }).filter(d => d.value > 0);

    return { 
      totalGrossMonthly, 
      cumulativeTax, 
      cumulativeSuper, 
      totalNetMonthly, 
      totalExpenseMonthly, 
      netPositionMonthly, 
      categoryData, 
      incomeData 
    };
  }, [state, currentMonth, currentYear]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs mb-1">Audit Mode: Full Ledger</h2>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Command Center</h1>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">24H Precision Active</span>
        </div>
      </header>

      {/* Main KPI Grid - Mix of Monthly Revenue and Cumulative Audit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
        <StatCard label="MONTHLY GROSS" amount={analytics.totalGrossMonthly} icon={<TrendingUp size={20} />} type="white" />
        <StatCard label="TAX WITHHELD (TOTAL)" amount={analytics.cumulativeTax} icon={<ShieldCheck size={20} />} type="red" />
        <StatCard label="SUPER SAVED (TOTAL)" amount={analytics.cumulativeSuper} icon={<HeartPulse size={20} />} type="red" />
        <StatCard label="NET RECEIVED (MO)" amount={analytics.totalNetMonthly} icon={<Zap size={20} />} type="accent" highlight />
      </div>

      {/* Secondary Row: Spending and Net Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <div className="bg-white p-8 flex justify-between items-center group cursor-help">
          <div>
            <span className="text-zinc-400 font-black uppercase text-[10px] tracking-[0.3em]">Monthly Expenditure</span>
            <div className="text-4xl font-black text-black tracking-tighter italic">{formatCurrency(analytics.totalExpenseMonthly)}</div>
          </div>
          <div className="text-zinc-200 group-hover:text-red-500 transition-colors">
            <TrendingDown size={48} />
          </div>
        </div>
        <div className={`p-8 flex justify-between items-center ${analytics.netPositionMonthly >= 0 ? 'bg-zinc-900 border border-zinc-800' : 'bg-red-600'}`}>
          <div>
            <span className="text-zinc-400 font-black uppercase text-[10px] tracking-[0.3em]">Monthly Surplus</span>
            <div className={`text-4xl font-black tracking-tighter italic ${analytics.netPositionMonthly >= 0 ? 'text-white' : 'text-white underline underline-offset-8 decoration-black'}`}>
              {formatCurrency(analytics.netPositionMonthly)}
            </div>
          </div>
          <div className="text-white opacity-20">
            <Zap size={48} />
          </div>
        </div>
      </div>

      {/* Smart Alerts */}
      {analytics.netPositionMonthly < 0 && (
        <div className="bg-white text-black p-6 border-l-[16px] border-red-600 animate-pulse">
          <div className="flex items-center gap-4">
            <AlertCircle size={40} strokeWidth={3} className="text-red-600" />
            <div>
              <h4 className="font-black uppercase italic text-2xl tracking-tighter">Liquidity Warning</h4>
              <p className="font-bold uppercase text-xs opacity-70">Monthly expenditure outstripping net received by {formatCurrency(Math.abs(analytics.netPositionMonthly))}.</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-sm">
          <h3 className="text-black font-black uppercase italic tracking-tighter text-lg mb-8 border-b-2 border-black pb-2">Monthly Revenue Stack</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.incomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {analytics.incomeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#000' : '#EF4444'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: 'none', color: '#fff', borderRadius: '0' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                  formatter={(value: number) => formatCurrency(value)} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-sm">
          <h3 className="text-black font-black uppercase italic tracking-tighter text-lg mb-8 border-b-2 border-black pb-2">Burn Velocity (Current Month)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#000', fontWeight: 'bold', fontSize: 10 }} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ backgroundColor: '#000', border: 'none', color: '#fff', borderRadius: '0' }}
                  formatter={(value: number) => formatCurrency(value)} 
                />
                <Bar dataKey="value" fill="#EF4444" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 border-l-[12px] border-black flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="flex-1">
          <h3 className="text-black font-black uppercase italic text-3xl tracking-tighter mb-2 underline decoration-red-600 decoration-4">LIFETIME AUDIT</h3>
          <p className="text-black font-bold text-lg leading-tight uppercase">
            Total historical tax withheld: <span className="bg-black text-white px-2 italic">{formatCurrency(analytics.cumulativeTax)}</span>. 
            Total historical superannuation saved: <span className="text-red-600 font-black">{formatCurrency(analytics.cumulativeSuper)}</span>.
          </p>
        </div>
        <div className="text-red-600 font-black text-7xl italic shrink-0 tracking-tighter opacity-10 select-none">
          ACCURACY
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; amount: number; icon: React.ReactNode; type: 'white' | 'red' | 'accent'; highlight?: boolean }> = ({ label, amount, icon, type, highlight }) => {
  const bgColor = highlight ? 'bg-red-600 text-white' : 'bg-white text-black';
  const labelColor = type === 'red' && !highlight ? 'text-red-600' : type === 'white' && !highlight ? 'text-zinc-400' : 'text-white opacity-80';
  const amountColor = type === 'red' && !highlight ? 'text-red-600' : 'inherit';

  return (
    <div className={`p-6 border border-zinc-200 card-hover ${bgColor}`}>
      <div className={`flex items-center justify-between font-black uppercase tracking-widest text-[9px] italic mb-4 ${labelColor}`}>
        <span>{label}</span>
        {icon}
      </div>
      <div className={`text-2xl font-black tracking-tighter ${amountColor}`}>
        {formatCurrency(amount)}
      </div>
    </div>
  );
};

export default Dashboard;
