
import React, { useState, useEffect } from 'react';
import { Calendar, Users, ChartBar, Settings, CheckCircle2 } from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus } from './types';
import CalendarGrid from './components/CalendarGrid';
import StudentManagement from './components/StudentManagement';
import AISummary from './components/AISummary';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'students' | 'analysis'>('calendar');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [analysisStudentId, setAnalysisStudentId] = useState<string | null>(null);
  
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('sa_students');
    return saved ? JSON.parse(saved) : [];
  });
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('sa_records');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sa_students', JSON.stringify(students));
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students]);

  useEffect(() => {
    localStorage.setItem('sa_records', JSON.stringify(records));
  }, [records]);

  const addStudent = (name: string) => {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name,
      addedAt: Date.now(),
    };
    setStudents(prev => [...prev, newStudent]);
    if (!selectedStudentId) setSelectedStudentId(newStudent.id);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setRecords(prev => prev.filter(r => r.studentId !== id));
    if (selectedStudentId === id) setSelectedStudentId(null);
  };

  const updateAttendance = (date: string, studentId: string, status: AttendanceStatus) => {
    setRecords(prev => {
      const id = `${date}_${studentId}`;
      if (status === 'unmarked') {
        return prev.filter(r => r.id !== id);
      }
      const existing = prev.findIndex(r => r.id === id);
      if (existing > -1) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], status };
        return updated;
      }
      return [...prev, { id, date, studentId, status }];
    });
  };

  const handleViewAnalysis = (studentId: string) => {
    setAnalysisStudentId(studentId);
    setActiveTab('analysis');
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-6 space-y-8">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AttendPro</h1>
        </div>

        <nav className="flex flex-col space-y-1">
          <NavItem 
            active={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')}
            icon={<Calendar className="w-5 h-5" />}
            label="学生日历" 
          />
          <NavItem 
            active={activeTab === 'students'} 
            onClick={() => setActiveTab('students')}
            icon={<Users className="w-5 h-5" />}
            label="名单管理" 
          />
          <NavItem 
            active={activeTab === 'analysis'} 
            onClick={() => {
              setActiveTab('analysis');
              // 默认点击分析时，如果不带特定 ID，则恢复全班汇总（或保留上次选择）
            }}
            icon={<ChartBar className="w-5 h-5" />}
            label="数据分析" 
          />
        </nav>

        {activeTab === 'calendar' && students.length > 0 && (
          <div className="pt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">选择学生</h3>
            <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {students.map(student => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedStudentId === student.id 
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {student.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 text-slate-500 text-sm">
            <Settings className="w-4 h-4" />
            <span>设置</span>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-6 h-6 text-indigo-600" />
            <span className="text-lg font-bold">AttendPro</span>
          </div>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            { id: 'calendar', label: '日历' },
            { id: 'students', label: '名单' },
            { id: 'analysis', label: '分析' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'calendar' && students.length > 0 && (
          <div className="mt-2">
            <select 
              value={selectedStudentId || ''} 
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium"
            >
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'calendar' && (
          <CalendarGrid 
            student={selectedStudent} 
            records={records} 
            onUpdateAttendance={updateAttendance} 
            onViewAnalysis={handleViewAnalysis}
          />
        )}
        {activeTab === 'students' && (
          <StudentManagement 
            students={students} 
            onAdd={addStudent} 
            onRemove={removeStudent} 
            onViewCalendar={(id) => {
              setSelectedStudentId(id);
              setActiveTab('calendar');
            }}
          />
        )}
        {activeTab === 'analysis' && (
          <AISummary 
            students={students} 
            records={records} 
            initialStudentId={analysisStudentId}
          />
        )}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default App;
