import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConsentProvider } from './context/ConsentContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ConsentCenter } from './pages/onboarding/ConsentCenter';
import { ProtectionCenter } from './pages/user/ProtectionCenter';
import { ThreatFeed } from './pages/user/ThreatFeed';
import { AttackChainView } from './pages/user/AttackChainView';
import { ActivityLog } from './pages/user/ActivityLog';
import { SimulatorPage } from './pages/user/SimulatorPage';
import { EmergencyDefenseHub } from './pages/user/EmergencyDefenseHub';
import { CommandCenter } from './pages/admin/CommandCenter';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<'user' | 'admin'>('user');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Initializing Cyberguard Shield...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar currentMode={mode} setMode={setMode} />
      <div className="flex flex-1">
        <Sidebar mode={mode} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<ProtectionCenter />} />
            <Route path="/emergency" element={<EmergencyDefenseHub />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/consent" element={<ConsentCenter />} />
            <Route path="/sources" element={<ConsentCenter />} />
            <Route path="/threats" element={<ThreatFeed />} />
            <Route path="/attack-chain" element={<AttackChainView />} />
            <Route path="/activity" element={<ActivityLog />} />
            <Route path="/admin" element={<CommandCenter />} />
            <Route path="/admin/intel" element={<CommandCenter />} />
            <Route path="/admin/chains" element={<CommandCenter />} />
            <Route path="/admin/users" element={<CommandCenter />} />
            <Route path="/admin/mitre" element={<CommandCenter />} />
            <Route path="/admin/response" element={<CommandCenter />} />
            <Route path="/admin/evaluation" element={<CommandCenter />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ConsentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </ConsentProvider>
    </AuthProvider>
  );
}

export default App;
