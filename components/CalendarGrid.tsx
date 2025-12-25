
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Clock, User, Calendar as CalendarIcon, Eraser } from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus } from '../types';

interface Props {
  student?: Student;
  records: AttendanceRecord[];
  onUpdateAttendance: (date: string, studentId: string, status: AttendanceStatus) => void;
}

const CalendarGrid: React.FC<Props> = ({ student, records, onUpdateAttendance }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingDay, setEditingDay] = useState<number | null>(null);

  if (!student) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-300">
        <div className="bg-slate-50 p-6 rounded-full mb-6">
          <User className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">未选择学生</h3>
        <p className="text-slate-500 mt-2 max-w-xs">请在左侧（或顶部）菜单中添加或选择一个学生以开始追踪出勤。</p>
      </div>
    );
  }

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDayKey = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getStatusForDay = (day: number) => {
    const key = getDayKey(day);
    const record = records.find(r => r.date === key && r.studentId === student.id);
    return record?.status || 'unmarked';
  };

  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{student.name} 的出勤表</h2>
            <div className="flex items-center text-slate-500 text-sm mt-0.5">
              <CalendarIcon className="w-4 h-4 mr-1.5" />
              <span>{year}年 {monthNames[month]}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={prevMonth} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="px-4 py-2 font-semibold text-slate-700 min-w-[140px] text-center">
            {monthNames[month]}
          </div>
          <button onClick={nextMonth} className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
        <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div> 出勤</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div> 请假</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-rose-500 rounded-full mr-2"></div> 缺勤</div>
        <div className="flex items-center"><div className="w-3 h-3 bg-slate-200 rounded-full mr-2"></div> 未打卡</div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="grid grid-cols-7 gap-px mb-4">
          {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map(d => (
            <div key={d} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const status = getStatusForDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            const isEditing = editingDay === day;

            return (
              <div key={day} className="relative group">
                <button
                  onClick={() => setEditingDay(isEditing ? null : day)}
                  className={`relative w-full aspect-square flex flex-col items-center justify-center rounded-2xl md:rounded-3xl border transition-all ${
                    status === 'present' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-100' :
                    status === 'leave' ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm shadow-amber-100' :
                    status === 'absent' ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm shadow-rose-100' :
                    'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'
                  } ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                >
                  <span className={`text-sm md:text-lg font-bold mb-1 ${status === 'unmarked' ? 'text-slate-400' : ''}`}>
                    {day}
                  </span>
                  <div className="hidden md:block">
                    {status === 'present' && <Check className="w-4 h-4" />}
                    {status === 'leave' && <Clock className="w-4 h-4" />}
                    {status === 'absent' && <X className="w-4 h-4" />}
                  </div>
                </button>

                {isEditing && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex flex-col gap-1 w-32 animate-in fade-in zoom-in-95 duration-200">
                    <StatusOption 
                      active={status === 'present'} 
                      onClick={() => { onUpdateAttendance(getDayKey(day), student.id, 'present'); setEditingDay(null); }}
                      color="emerald" label="出勤" icon={<Check className="w-3 h-3" />}
                    />
                    <StatusOption 
                      active={status === 'leave'} 
                      onClick={() => { onUpdateAttendance(getDayKey(day), student.id, 'leave'); setEditingDay(null); }}
                      color="amber" label="请假" icon={<Clock className="w-3 h-3" />}
                    />
                    <StatusOption 
                      active={status === 'absent'} 
                      onClick={() => { onUpdateAttendance(getDayKey(day), student.id, 'absent'); setEditingDay(null); }}
                      color="rose" label="缺勤" icon={<X className="w-3 h-3" />}
                    />
                    
                    {/* Reset Option */}
                    {status !== 'unmarked' && (
                      <div className="h-px bg-slate-100 my-1"></div>
                    )}
                    {status !== 'unmarked' && (
                      <StatusOption 
                        active={false} 
                        onClick={() => { onUpdateAttendance(getDayKey(day), student.id, 'unmarked'); setEditingDay(null); }}
                        color="slate" label="重置记录" icon={<Eraser className="w-3 h-3" />}
                      />
                    )}

                    <button 
                      onClick={() => setEditingDay(null)}
                      className="w-full text-center py-1.5 text-[10px] text-slate-400 font-bold hover:text-slate-600 border-t border-slate-50 mt-1"
                    >
                      关闭
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatusOption: React.FC<{ active: boolean; onClick: () => void; color: string; label: string; icon: React.ReactNode }> = ({ active, onClick, color, label, icon }) => {
  const styles: Record<string, string> = {
    emerald: active ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50 text-emerald-700',
    amber: active ? 'bg-amber-500 text-white' : 'hover:bg-amber-50 text-amber-700',
    rose: active ? 'bg-rose-500 text-white' : 'hover:bg-rose-50 text-rose-700',
    slate: 'hover:bg-slate-100 text-slate-500',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${styles[color]}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default CalendarGrid;
