import Scene3D from '../components/3d/Scene3D';
import { useAppStore } from '../store/useAppStore';
import {
  DoorOpen,
  Users,
  Clock,
  Crown,
  AlertCircle,
  CheckCircle2,
  Circle,
} from 'lucide-react';

export default function Farewell() {
  const halls = useAppStore((s) => s.halls);
  const appointments = useAppStore((s) => s.appointments);

  const statusConfig = {
    available: { label: '空闲', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-900/30 border-green-700' },
    in_use: { label: '使用中', icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-700' },
    reserved: { label: '已预约', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-700' },
    maintenance: { label: '维护中', icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-800/50 border-slate-600' },
  };

  const specIcon = {
    '标准': Circle,
    '豪华': Crown,
    'VIP': Crown,
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            <DoorOpen className="w-6 h-6 text-amber-400" />
            告别厅管理
          </h2>
          <p className="text-slate-400 text-sm mt-1">智能分配厅室，实时监控仪式进度</p>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1">
            <Scene3D view="farewell" />
          </div>

          <div className="w-96 border-l border-slate-700 bg-slate-900/50 overflow-y-auto p-4 space-y-3">
            <h3 className="text-white font-medium text-sm mb-2">厅室列表</h3>
            {halls.map((hall) => {
              const status = statusConfig[hall.status];
              const SpecIcon = specIcon[hall.spec];
              const apt = appointments.find(
                (a) => a.hallId === hall.id && (a.status === 'in_progress' || a.status === 'scheduled'),
              );
              const remaining = apt && apt.status === 'in_progress'
                ? Math.max(0, Math.round((apt.endTime.getTime() - Date.now()) / 60000))
                : null;

              return (
                <div
                  key={hall.id}
                  className={`${status.bg} border rounded-xl p-4 transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                        <DoorOpen className={`w-5 h-5 ${status.color}`} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{hall.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <SpecIcon className="w-3 h-3" />
                          {hall.spec}规格 · 容纳{hall.capacity}人
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 ${status.color} text-xs px-2 py-1 rounded-full bg-slate-900/50`}>
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </div>
                  </div>

                  {apt && (
                    <div className="bg-slate-900/60 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">当前家属</span>
                        <span className="text-white text-sm font-medium">{apt.familyName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-xs">出席人数</span>
                        <span className="text-slate-200 text-sm">{apt.attendees}人</span>
                      </div>
                      {apt.status === 'in_progress' && (
                        <>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">仪式进度</span>
                              <span className="text-amber-400">{apt.progress.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-amber-400 transition-all duration-500"
                                style={{ width: `${apt.progress}%` }}
                              />
                            </div>
                          </div>
                          {remaining !== null && (
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-slate-400 text-xs">剩余时长</span>
                              <span className="text-orange-400 text-sm font-mono font-bold">
                                {remaining}分钟
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      {apt.status === 'scheduled' && (
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-slate-400 text-xs">预约开始</span>
                          <span className="text-blue-400 text-sm">
                            {apt.startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
