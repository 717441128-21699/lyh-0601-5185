import { Building2, Bell, Clock, Flame, Users, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function Header() {
  const halls = useAppStore((s) => s.halls);
  const furnaces = useAppStore((s) => s.furnaces);
  const alerts = useAppStore((s) => s.alerts);
  const currentTime = useAppStore((s) => s.currentTime);

  const inUseHalls = halls.filter((h) => h.status === 'in_use').length;
  const runningFurnaces = furnaces.filter((f) => f.status === 'running' || f.status === 'warning').length;
  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length;

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          >
            殡仪馆3D运营调度平台
          </h1>
          <p className="text-xs text-slate-400">Funeral Home 3D Operations Center</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-white font-mono text-sm">
            {currentTime.toLocaleString('zh-CN')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/40 rounded-lg border border-blue-800">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-blue-200 text-sm font-medium">
              在厅 {inUseHalls}/{halls.length}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-900/40 rounded-lg border border-orange-800">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-orange-200 text-sm font-medium">
              火化 {runningFurnaces}/{furnaces.length}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/40 rounded-lg border border-red-800 relative">
            <Bell className="w-4 h-4 text-red-400" />
            <span className="text-red-200 text-sm font-medium">告警 {unresolvedAlerts}</span>
            {unresolvedAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">
                !
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
