import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  GitBranch,
  Sliders,
  History,
  Lock,
  Smartphone,
  PhoneCall,
  Cpu,
  Globe2,
  Users,
  Grid,
  Zap,
  BarChart3,
} from 'lucide-react';


interface SidebarProps {
  mode: 'user' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ mode }) => {
  const userLinks = [
    { to: '/', label: 'Protection Center', icon: ShieldCheck },
    { to: '/emergency', label: 'Emergency 1930 Shield', icon: PhoneCall },
    { to: '/simulator', label: 'Mobile Simulator', icon: Smartphone },
    { to: '/threats', label: 'Threat Monitoring', icon: AlertTriangle },
    { to: '/attack-chain', label: 'Attack Chain Story', icon: GitBranch },
    { to: '/sources', label: 'Protection Sources', icon: Sliders },
    { to: '/activity', label: 'Security Activity', icon: History },
    { to: '/consent', label: 'Privacy & Consent', icon: Lock },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Command Center', icon: Cpu },
    { to: '/admin/intel', label: 'Threat Intelligence', icon: Globe2 },
    { to: '/admin/chains', label: 'Attack Graph Master', icon: GitBranch },
    { to: '/admin/users', label: 'Protected Identities', icon: Users },
    { to: '/admin/mitre', label: 'MITRE ATT&CK Matrix', icon: Grid },
    { to: '/admin/response', label: 'Response & Containment', icon: Zap },
    { to: '/admin/evaluation', label: 'Model Evaluation', icon: BarChart3 },
  ];

  const links = mode === 'user' ? userLinks : adminLinks;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-4 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {mode === 'user' ? 'Individual Protection' : 'SOC Analyst Workspace'}
        </p>
        <p className="text-xs font-medium text-cyan-400 mt-0.5">
          {mode === 'user' ? 'Personal Zero-Trust Shield' : 'Fleet Attack Engine'}
        </p>
      </div>

      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Indian Scam Quick Shield Reference */}
      <div className="mt-8 rounded-xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950 p-3.5">
        <div className="flex items-center gap-2 text-cyan-400 mb-1.5">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-xs font-semibold">India Threat Shield</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Active filters for SBI/Paytm KYC fraud, UPI lure patterns, Digital Arrest scams, and Devanagari threats.
        </p>
      </div>
    </aside>
  );
};
