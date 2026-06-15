import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  DoorOpen,
  Flame,
  Archive,
  Users2,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '全景总览', icon: LayoutDashboard },
  { path: '/farewell', label: '告别厅管理', icon: DoorOpen },
  { path: '/cremation', label: '火化车间', icon: Flame },
  { path: '/columbarium', label: '骨灰寄存', icon: Archive },
  { path: '/services', label: '服务调度', icon: Users2 },
  { path: '/reports', label: '数据报表', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-slate-900/80 backdrop-blur-md border-r border-slate-700 flex flex-col">
      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-amber-600/30 to-amber-500/10 text-amber-300 border border-amber-600/40 shadow-lg shadow-amber-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`
            }
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-sm font-medium" style={{ fontFamily: 'Noto Sans SC, sans-serif' }}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-slate-700">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">当前用户</div>
          <div className="text-sm text-white font-medium">调度员 · 管理员</div>
          <div className="w-full mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
}
