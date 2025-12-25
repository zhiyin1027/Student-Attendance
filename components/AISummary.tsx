
import React, { useState, useMemo } from 'react';
import { Sparkles, Loader2, BrainCircuit, MessageSquare, AlertCircle, Calendar as CalendarIcon, TrendingUp, BarChart3 } from 'lucide-react';
import { getAttendanceSummary } from '../services/geminiService';
import { Student, AttendanceRecord } from '../types';
import TrendChart from './TrendChart';

interface Props {
  students: Student[];
  records: AttendanceRecord[];
}

const AISummary: React.FC<Props> = ({ students, records }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 对于按月统计，默认显示半年或一年的跨度更有参考价值
  const today = new Date();
  const sixMonthsAgo = new Date(new Date().setMonth(today.getMonth() - 6));
  
  const [startDate, setStartDate] = useState(sixMonthsAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => r.date >= startDate && r.date <= endDate);
  }, [records, startDate, endDate]);

  // 核心修改：将数据按“月份”聚合
  const monthlyData = useMemo(() => {
    const monthlyMap: Record<string, { present: number; total: number }> = {};
    
    filteredRecords.forEach(record => {
      // 提取 YYYY-MM
      const monthKey = record.date.substring(0, 7);
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { present: 0, total: 0 };
      }
      monthlyMap[monthKey].total += 1;
      if (record.status === 'present') {
        monthlyMap[monthKey].present += 1;
      }
    });

    return Object.keys(monthlyMap).sort().map(month => ({
      date: month, // 这里存储的是 YYYY-MM
      count: monthlyMap[month].total,
      rate: monthlyMap[month].total > 0 ? (monthlyMap[month].present / monthlyMap[month].total) * 100 : 0
    }));
  }, [filteredRecords]);

  const stats = useMemo(() => {
    const s = { present: 0, leave: 0, absent: 0 };
    filteredRecords.forEach(r => {
      if (r.status === 'present') s.present++;
      else if (r.status === 'leave') s.leave++;
      else if (r.status === 'absent') s.absent++;
    });
    const total = s.present + s.leave + s.absent;
    const rate = total > 0 ? Math.round((s.present / total) * 100) : 0;
    return { ...s, total, rate };
  }, [filteredRecords]);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const result = await getAttendanceSummary(students, filteredRecords, startDate, endDate);
      setSummary(result);
    } catch (err) {
      setSummary("分析数据时遇到错误。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Range Selector */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-100">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">月度出勤总结</h2>
              <p className="text-slate-500">按月份统计整体出勤率与趋势</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-2 px-3">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 text-slate-600"
              />
            </div>
            <div className="hidden sm:block text-slate-300">|</div>
            <div className="flex items-center space-x-2 px-3">
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Monthly Chart Section */}
        <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 text-slate-700 font-bold">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <span>月度平均出勤率 (%)</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              统计周期内共 {monthlyData.length} 个月
            </div>
          </div>
          <TrendChart data={monthlyData} />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="总平均出勤" value={`${stats.rate}%`} subLabel="当前时段" icon={<TrendingUp className="w-5 h-5" />} color="indigo" />
          <StatCard label="累计实到" value={stats.present} subLabel="Present" icon={<div className="w-2 h-2 bg-emerald-500 rounded-full" />} color="emerald" />
          <StatCard label="累计请假" value={stats.leave} subLabel="Leave" icon={<div className="w-2 h-2 bg-amber-500 rounded-full" />} color="amber" />
          <StatCard label="累计缺勤" value={stats.absent} subLabel="Absent" icon={<div className="w-2 h-2 bg-rose-500 rounded-full" />} color="rose" />
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || students.length === 0 || stats.total === 0}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-3 shadow-xl shadow-indigo-100 group"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6 group-hover:scale-125 transition-transform" />
            )}
            <span>{isLoading ? "正在生成 AI 分析..." : "生成 AI 智能报告"}</span>
          </button>
        </div>
      </div>

      {summary && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-slate-100">
            <div className="bg-indigo-50 p-3 rounded-2xl">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">智能分析报告</h3>
          </div>
          <div className="prose prose-indigo max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed prose-p:mb-4 prose-li:mb-2">
            {summary}
          </div>
          <div className="mt-12 pt-6 border-t border-slate-50 flex items-center text-sm text-slate-400 italic">
            <AlertCircle className="w-4 h-4 mr-2" />
            AI 生成内容仅供参考。
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; subLabel: string; icon: React.ReactNode; color: 'indigo' | 'emerald' | 'amber' | 'rose' }> = ({ label, value, subLabel, icon, color }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600"
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center">
      <div className={`p-2 rounded-xl mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-800 my-1">{value}</p>
      <p className="text-[10px] text-slate-400 font-medium">{subLabel}</p>
    </div>
  );
};

export default AISummary;
