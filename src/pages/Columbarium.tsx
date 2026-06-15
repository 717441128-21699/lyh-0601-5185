import Scene3D from '../components/3d/Scene3D';
import { useAppStore } from '../store/useAppStore';
import {
  Archive,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Unlock,
  CalendarDays,
} from 'lucide-react';
import { useState } from 'react';

export default function Columbarium() {
  const slots = useAppStore((s) => s.slots);
  const unlockSlot = useAppStore((s) => s.unlockSlot);
  const [filter, setFilter] = useState<string>('all');

  const statusConfig = {
    available: { label: '空闲', icon: CheckCircle2, color: 'text-slate-400', dot: 'bg-slate-500' },
    occupied: { label: '正常', icon: CheckCircle2, color: 'text-blue-400', dot: 'bg-blue-500' },
    expiring: { label: '即将到期', icon: Clock, color: 'text-orange-400', dot: 'bg-orange-500' },
    expired: { label: '已超期', icon: AlertTriangle, color: 'text-red-400', dot: 'bg-red-500' },
    locked: { label: '已上锁', icon: Lock, color: 'text-slate-500', dot: 'bg-slate-600' },
  };

  const filtered = filter === 'all' ? slots : slots.filter((s) => s.status === filter);

  const stats = {
    total: slots.length,
    occupied: slots.filter((s) => s.status === 'occupied').length,
    expiring: slots.filter((s) => s.status === 'expiring').length,
    expired: slots.filter((s) => s.status === 'expired' || s.status === 'locked').length,
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            <Archive className="w-6 h-6 text-amber-400" />
            骨灰寄存管理
          </h2>
          <p className="text-slate-400 text-sm mt-1">到期提醒、续费通知、超期自动上锁</p>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1">
            <Scene3D view="columbarium" />
          </div>

          <div className="w-96 border-l border-slate-700 bg-slate-900/50 flex flex-col">
            <div className="grid grid-cols-4 gap-2 p-3 border-b border-slate-700">
              <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">总格口</p>
              </div>
              <div className="bg-blue-900/30 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-blue-400">{stats.occupied}</p>
                <p className="text-xs text-slate-400">正常</p>
              </div>
              <div className="bg-orange-900/30 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-orange-400">{stats.expiring}</p>
                <p className="text-xs text-slate-400">即将到期</p>
              </div>
              <div className="bg-red-900/30 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-red-400">{stats.expired}</p>
                <p className="text-xs text-slate-400">超期</p>
              </div>
            </div>

            <div className="flex gap-1 p-2 border-b border-slate-700">
              {['all', 'occupied', 'expiring', 'expired', 'locked'].map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`flex-1 text-xs py-1.5 rounded-md transition-all ${
                    filter === k
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {k === 'all' ? '全部' : statusConfig[k as keyof typeof statusConfig].label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filtered.map((slot) => {
                const status = statusConfig[slot.status];
                const daysLeft = slot.leaseEndDate
                  ? Math.ceil((slot.leaseEndDate.getTime() - Date.now()) / (24 * 3600000))
                  : null;

                return (
                  <div
                    key={slot.id}
                    className={`border rounded-lg p-3 transition-all ${
                      slot.status === 'expiring'
                        ? 'bg-orange-900/20 border-orange-700 animate-pulse'
                        : slot.status === 'expired' || slot.status === 'locked'
                          ? 'bg-red-900/20 border-red-700'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                        <div>
                          <h4 className="text-white font-medium text-sm">{slot.location}</h4>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <status.icon className={`w-3 h-3 ${status.color}`} />
                            <span className={status.color}>{status.label}</span>
                          </div>
                        </div>
                      </div>
                      {slot.locked && (
                        <button
                          onClick={() => unlockSlot(slot.id)}
                          className="flex items-center gap-1 text-xs bg-amber-600 hover:bg-amber-500 text-white px-2 py-1 rounded-md transition-colors"
                        >
                          <Unlock className="w-3 h-3" />
                          解锁
                        </button>
                      )}
                    </div>

                    {slot.lesseeName && (
                      <div className="mt-2 pt-2 border-t border-slate-700 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">使用家属</span>
                          <span className="text-slate-200">{slot.lesseeName}</span>
                        </div>
                        {daysLeft !== null && (
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {daysLeft < 0 ? '超期天数' : '剩余天数'}
                            </span>
                            <span
                              className={`font-mono font-bold ${
                                daysLeft < 0
                                  ? 'text-red-400'
                                  : daysLeft <= 30
                                    ? 'text-orange-400'
                                    : 'text-green-400'
                              }`}
                            >
                              {daysLeft < 0 ? `${-daysLeft}天` : `${daysLeft}天`}
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
    </div>
  );
}
