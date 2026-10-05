import React from 'react';
import { Shield, ShieldAlert, LogOut, CheckCircle, PhoneCall } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  currentMode: 'user' | 'admin';
  setMode: (mode: 'user' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentMode, setMode }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Shield className="h-5 w-5 text-white" />
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">CYBERGUARD</span>
              <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cyan-400 border border-cyan-800/50">
                INDIA-FIRST AI DEFENCE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Connects the Attack Chain • Predicts Next Step • Speaks the Warning
            </p>
          </div>
        </div>

        {/* Center / Navigation Switch & Emergency Call */}
        {isAuthenticated && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setMode('user')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  currentMode === 'user'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>User Mode</span>
              </button>
              <button
                onClick={() => setMode('admin')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  currentMode === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>SOC Command</span>
              </button>
            </div>

            <button
              onClick={() => navigate('/emergency')}
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-rose-600/70 bg-rose-950/80 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/80 transition shadow-sm animate-pulse"
              title="1930 Cyber Fraud Emergency Hub"
            >
              <PhoneCall className="h-3.5 w-3.5 text-rose-400" />
              <span>1930 Emergency</span>
            </button>
          </div>
        )}

        {/* Right User Bar */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-slate-200">
                  {user.full_name}
                </p>
                <div className="flex items-center justify-end gap-1 text-[11px] text-cyan-400">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Shield Active</span>
                </div>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 font-semibold text-xs">
                {user.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 shadow-sm transition"
              >
                Get Protected
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
