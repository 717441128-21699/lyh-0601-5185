import Scene3D from '../components/3d/Scene3D';
import { useAppStore } from '../store/useAppStore';
import {
  Flame,
  Thermometer,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Activity,
} from 'lucide-react';

export default function Cremation() {
  const furnaces = useAppStore((s) => s.furnaces);

  const statusConfig = {
    running: { label: '运行中', icon: Flame, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-700' },
    idle: { label: '空闲', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-900/30 border-green-700' },
    maintenance: { label: '维护中', icon: Wrench, color: 'text-slate-400', bg: 'bg-slate-800/50 border-slate-600' },
    warning: { label: '预警', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-700' },
    error: { label: '故障', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/30 border-red-700' },
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            <Flame className="w-6 h-6 text-orange-400" />
            火化车间监控
          </h2>
          <p className="text-slate-400 text-sm mt-1">实时监控炉温、累计使用、保养倒计时</p>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1">
            <Scene3D view="cremation" />
          </div>

          <div className="w-96 border-l border-slate-700 bg-slate-900/50 overflow-y-auto p-4 space-y-3">
            <h3 className="text-white font-medium text-sm mb-2">火化炉状态</h3>
            {furnaces.map((f) => {
              const status = statusConfig[f.status];
              const maintenanceProgress = (f.usageCount / f.maintenanceThreshold) * 100;
              const needsMaintenance = maintenanceProgress >= 90;
              const tempNormal = f.temperature >= 750 && f.temperature <= 950;

              return (
                <div
                  key={f.id}
                  className={`${needsMaintenance ? 'border-orange-500 shadow-lg shadow-orange-900/30' : status.bg} border rounded-xl p-4 transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          f.status === 'running' || f.status === 'warning'
                            ? 'bg-gradient-to-br from-orange-600 to-red-700 animate-pulse'
                            : 'bg-slate-800'
                        }`}
                      >
                        <Flame className={`w-5 h-5 ${f.status === 'running' || f.status === 'warning' ? 'text-white' : status.color}`} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{f.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Gauge className="w-3 h-3" />
                          累计使用 {f.usageCount} 次
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 ${status.color} text-xs px-2 py-1 rounded-full bg-slate-900/50`}>
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </div>
                  </div>

                  <div className="bg-slate-900/60 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className={`w-4 h-4 ${tempNormal ? 'text-green-400' : 'text-red-400'}`} />
                        <span className="text-slate-400 text-sm">当前炉温</span>
                      </div>
                      <span
                        className={`text-xl font-bold font-mono ${
                          tempNormal ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {f.temperature}
                        <span className="text-sm ml-0.5">℃</span>
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Wrench className="w-3 h-3" />
                          保养进度
                        </span>
                        <span
                          className={
                            maintenanceProgress >= 95
                              ? 'text-red-400 font-bold'
                              : maintenanceProgress >= 90
                                ? 'text-orange-400 font-bold'
                                : 'text-slate-300'
                          }
                        >
                          {f.usageCount} / {f.maintenanceThreshold}
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            maintenanceProgress >= 95
                              ? 'bg-gradient-to-r from-red-600 to-red-500'
                              : maintenanceProgress >= 90
                                ? 'bg-gradient-to-r from-orange-600 to-orange-500 animate-pulse'
                                : 'bg-gradient-to-r from-green-600 to-green-500'
                          }`}
                          style={{ width: `${Math.min(100, maintenanceProgress)}%` }}
                        />
                      </div>
                      {needsMaintenance && (
                        <p className="text-xs text-orange-400 mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          接近保养阈值，请尽快安排维护
                        </p>
                      )}
                    </div>

                    {f.currentFamily && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-700">
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          服务家属
                        </span>
                        <span className="text-blue-300 text-sm font-medium">{f.currentFamily}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
