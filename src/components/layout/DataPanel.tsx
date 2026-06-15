import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function DataPanel() {
  const alerts = useAppStore((s) => s.alerts);
  const resolveAlert = useAppStore((s) => s.resolveAlert);
  const getHallUsageRate = useAppStore((s) => s.getHallUsageRate);
  const getFurnaceUsageRate = useAppStore((s) => s.getFurnaceUsageRate);
  const getSlotUsageRate = useAppStore((s) => s.getSlotUsageRate);

  const unresolved = alerts.filter((a) => !a.resolved);

  const hallUsage = getHallUsageRate();
  const furnaceUsage = getFurnaceUsageRate();
  const slotUsage = getSlotUsageRate();

  const typeStyles = {
    error: {
      bg: 'bg-red-900/30 border-red-700',
      icon: AlertTriangle,
      color: 'text-red-400',
    },
    warning: {
      bg: 'bg-orange-900/30 border-orange-700',
      icon: AlertTriangle,
      color: 'text-orange-400',
    },
    info: {
      bg: 'bg-blue-900/30 border-blue-700',
      icon: Info,
      color: 'text-blue-400',
    },
  };

  return (
    <aside className="w-80 bg-slate-900/80 backdrop-blur-md border-l border-slate-700 flex flex-col">
      <div className="px-4 py-3 border-b border-slate-700">
        <h2
          className="text-white font-bold"
          style={{ fontFamily: 'Noto Serif SC, serif' }}
        >
          实时告警中心
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          共 {unresolved.length} 条待处理告警
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {unresolved.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <CheckCircle className="w-12 h-12 mb-2 text-green-600" />
            <p className="text-sm">暂无待处理告警</p>
          </div>
        )}
        {unresolved.slice().reverse().map((alert) => {
          const style = typeStyles[alert.type];
          const Icon = style.icon;
          return (
            <div
              key={alert.id}
              className={`${style.bg} border rounded-lg p-3 transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-2">
                <Icon className={`w-5 h-5 ${style.color} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 leading-relaxed">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {alert.time.toLocaleTimeString('zh-CN')}
                  </p>
                </div>
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="text-slate-500 hover:text-white transition-colors p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-700 space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">告别厅使用率</span>
            <span className="text-white font-medium">{hallUsage.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${hallUsage}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">火化炉使用率</span>
            <span className="text-white font-medium">{furnaceUsage.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${furnaceUsage}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">寄存格口占用率</span>
            <span className="text-white font-medium">{slotUsage.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${slotUsage}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
