
import React, { useState } from 'react';
import { Plus, Trash2, User, UserPlus, Calendar } from 'lucide-react';
import { Student } from '../types';

interface Props {
  students: Student[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onViewCalendar: (id: string) => void;
}

const StudentManagement: React.FC<Props> = ({ students, onAdd, onRemove, onViewCalendar }) => {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Class Roster</h2>
        <p className="text-slate-500 mb-8">Add or remove students from your classroom.</p>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter student name..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100"
            >
              <UserPlus className="w-5 h-5" />
              <span>Add</span>
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {students.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p>No students added yet.</p>
            </div>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700">{student.name}</h4>
                    <p className="text-xs text-slate-400">Added {new Date(student.addedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewCalendar(student.id)}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>View Calendar</span>
                  </button>
                  <button
                    onClick={() => onRemove(student.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
