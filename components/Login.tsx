import React from 'react';
import { User, UserRole } from '../types';
import { UserCircle, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleGoogleLogin = (role: UserRole) => {
    // Simulating a Google User Object
    const mockUser: User = {
      id: `google-${Date.now()}`,
      name: role === UserRole.TEACHER ? "Ms. Hạnh (Teacher)" : "Nguyễn Văn A (Student)",
      email: role === UserRole.TEACHER ? "teacher@school.edu.vn" : "student@school.edu.vn",
      avatar: `https://picsum.photos/200?random=${Date.now()}`,
      role: role
    };
    onLogin(mockUser);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-800">Chào mừng!</h2>
          <p className="mt-2 text-slate-500">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleGoogleLogin(UserRole.STUDENT)}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 group"
          >
            <div className="bg-indigo-100 p-2 rounded-full group-hover:bg-indigo-200">
              <UserCircle className="text-indigo-600" size={24} />
            </div>
            <span>Đăng nhập với vai trò <span className="text-indigo-600 font-bold">Học viên</span></span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-400">hoặc</span>
            </div>
          </div>

          <button
            onClick={() => handleGoogleLogin(UserRole.TEACHER)}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 group"
          >
            <div className="bg-emerald-100 p-2 rounded-full group-hover:bg-emerald-200">
              <ShieldCheck className="text-emerald-600" size={24} />
            </div>
            <span>Đăng nhập với vai trò <span className="text-emerald-600 font-bold">Giáo viên</span></span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400">
          Sử dụng tài khoản Google của bạn để đồng bộ quá trình học tập.
        </div>
      </div>
    </div>
  );
};

export default Login;