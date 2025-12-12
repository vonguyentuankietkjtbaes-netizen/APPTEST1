import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import StudentWorksheet from './components/StudentWorksheet';
import { GraduationCap, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('vn_english_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('vn_english_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vn_english_user');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
              English Master AI
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role === UserRole.TEACHER ? 'Giáo viên' : 'Học viên'}</p>
              </div>
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-10 h-10 rounded-full border-2 border-indigo-100"
              />
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50">
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : user.role === UserRole.TEACHER ? (
          <TeacherDashboard user={user} />
        ) : (
          <StudentWorksheet user={user} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 English Master AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;