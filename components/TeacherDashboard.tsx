import React from 'react';
import { User, StudentProgress } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, BookOpen, AlertCircle } from 'lucide-react';

interface TeacherDashboardProps {
  user: User;
}

// Mock data as we can't easily fetch all rows from private Google Sheets without backend
const mockData: StudentProgress[] = [
  { studentName: 'Nguyen Van A', topic: 'Greetings', questionsAnswered: 30, averageScore: 8.5, lastActive: '2 mins ago' },
  { studentName: 'Tran Thi B', topic: 'Greetings', questionsAnswered: 15, averageScore: 6.2, lastActive: '1 hour ago' },
  { studentName: 'Le Van C', topic: 'Greetings', questionsAnswered: 30, averageScore: 9.1, lastActive: 'Yesterday' },
  { studentName: 'Pham Thi D', topic: 'Greetings', questionsAnswered: 5, averageScore: 4.5, lastActive: '3 days ago' },
  { studentName: 'Hoang Van E', topic: 'Greetings', questionsAnswered: 22, averageScore: 7.8, lastActive: '5 mins ago' },
];

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Teacher Dashboard</h2>
        <p className="text-slate-500">Welcome back, {user.name}. Here is the class progress.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Students</p>
              <p className="text-2xl font-bold text-slate-800">{mockData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Questions Answered</p>
              <p className="text-2xl font-bold text-slate-800">
                {mockData.reduce((acc, curr) => acc + curr.questionsAnswered, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Needs Attention</p>
              <p className="text-2xl font-bold text-slate-800">
                {mockData.filter(s => s.averageScore < 5).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Class Performance (Greetings Topic)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="studentName" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={[0, 10]} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="averageScore" radius={[4, 4, 0, 0]} barSize={40}>
                {mockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.averageScore >= 8 ? '#22c55e' : entry.averageScore >= 5 ? '#6366f1' : '#f97316'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-sm font-semibold text-slate-600">Student Name</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Topic</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Progress</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Avg. Score</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Last Active</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((student, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{student.studentName}</td>
                  <td className="p-4 text-slate-600">{student.topic}</td>
                  <td className="p-4">
                    <div className="w-full max-w-[100px] bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((student.questionsAnswered / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 inline-block">{student.questionsAnswered}/30</span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{student.averageScore}</td>
                  <td className="p-4 text-slate-500 text-sm">{student.lastActive}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                      ${student.questionsAnswered >= 30 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'}`}>
                      {student.questionsAnswered >= 30 ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 text-xs text-slate-500 text-center border-t border-slate-200">
          Data is synced from the connected Google Sheet automatically.
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;