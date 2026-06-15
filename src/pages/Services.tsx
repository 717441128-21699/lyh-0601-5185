import { useAppStore } from '../store/useAppStore';
import { useEffect, useState, useMemo } from 'react';
import {
  Users2,
  Mic,
  Music,
  Car,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ChevronRight,
  Timer,
} from 'lucide-react';

export default function Services() {
  const staff = useAppStore((s) => s.staff);
  const vehicles = useAppStore((s) => s.vehicles);
  const schedules = useAppStore((s) => s.schedules);
  const confirmSchedule = useAppStore((s) => s.confirmSchedule);
  const updateProgress = useAppStore((s) => s.updateProgress);
  const escalateOverdueSchedules = useAppStore((s) => s.escalateOverdueSchedules);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => {
      updateProgress();
      setTick((t) => t + 1);
    }, 1000);
    const t2 = setInterval(() => {
      escalateOverdueSchedules();
    }, 5000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, [updateProgress, escalateOverdueSchedules]);

  const currentTime = new Date();

  const roleIcons: Record<string, any> = {
    '司仪': Mic,
    '乐队': Music,
    '灵车司机': Car,
    '车辆调度': Car,
  };

  const statusStyles = {
    confirmed: { label: '已确认', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-900/30 border-green-700' },
    pending: { label: '待确认', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-700' },
    completed: { label: '已完成', icon: CheckCircle2, color: 'text-slate-400', bg: 'bg-slate-800/50 border-slate-600' },
    escalated: { label: '已升级', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/30 border-red-700' },
  };

  const staffStatusColor = {
    '空闲': 'text-green-400',
    '服务中': 'text-blue-400',
    '出车中': 'text-blue-400',
    '休息': 'text-slate-500',
  };

  const vehicleStatusColor = {
    '空闲': 'text-green-400',
    '出车中': 'text-blue-400',
    '维护中': 'text-red-400',
  };

  const sortedSchedules = useMemo(
    () =>
      [...schedules].sort((a, b) => {
        const statusOrder = { escalated: 0, pending: 1, confirmed: 2, completed: 3 };
        const orderA = statusOrder[a.escalated ? 'escalated' : a.status] ?? 4;
        const orderB = statusOrder[b.escalated ? 'escalated' : b.status] ?? 4;
        if (orderA !== orderB) return orderA - orderB;
        return a.startTime.getTime() - b.startTime.getTime();
      }),
    [schedules],
  );

  const getRemainingConfirmTime = (deadline: Date) => {
    const diff = deadline.getTime() - currentTime.getTime();
    if (diff <= 0) return { text: '已超时', urgent: true };
    const minutes = Math.ceil(diff / 60000);
    if (minutes <= 5) return { text: `${minutes}分钟`, urgent: true };
    return { text: `${minutes}分钟`, urgent: false };
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            <Users2 className="w-6 h-6 text-amber-400" />
            治丧服务调度
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            司仪、乐队、灵车自动分配排班，超时未确认自动升级主管
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-900/30 rounded-lg border border-amber-700">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300">待确认：{schedules.filter((s) => !s.confirmed && !s.escalated).length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 rounded-lg border border-red-700">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-300">已升级：{schedules.filter((s) => s.escalated).length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              服务排班列表（按紧急度排序）
            </h3>
            <div className="grid gap-3">
              {sortedSchedules.map((sch) => {
                const status = sch.escalated ? statusStyles.escalated : statusStyles[sch.status];
                const Icon = roleIcons[sch.type] || Users2;
                const staffMember = sch.staffId ? staff.find((s) => s.id === sch.staffId) : null;
                const vehicle = sch.vehicleId ? vehicles.find((v) => v.id === sch.vehicleId) : null;
                const confirmTime = !sch.confirmed
                  ? getRemainingConfirmTime(sch.confirmDeadline)
                  : null;

                return (
                  <div
                    key={sch.id}
                    className={`${status.bg} border rounded-xl p-4 transition-all hover:scale-[1.005] ${
                      confirmTime?.urgent ? 'animate-pulse shadow-lg' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${status.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-white font-bold">{sch.type}</h4>
                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-900/60 ${status.color}`}>
                              <status.icon className="w-3 h-3" />
                              {status.label}
                            </span>
                            {sch.escalated && (
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-900/60 text-red-300 border border-red-700">
                                <AlertTriangle className="w-3 h-3" />
                                已升级主管处理
                              </span>
                            )}
                            {confirmTime && !sch.escalated && (
                              <span
                                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                  confirmTime.urgent
                                    ? 'bg-red-900/60 text-red-300 border border-red-700'
                                    : 'bg-blue-900/60 text-blue-300 border border-blue-700'
                                }`}
                              >
                                <Timer className="w-3 h-3" />
                                确认截止：{confirmTime.text}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {sch.startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                              {' - '}
                              {sch.endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-slate-200 font-medium">{sch.familyName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {staffMember && (
                          <div className="text-right border border-slate-600/50 rounded-lg px-3 py-1.5 bg-slate-900/40">
                            <div className="text-xs text-slate-400 mb-0.5">{sch.type === '车辆调度' ? '司机' : '人员'}</div>
                            <div className="text-sm text-white font-medium">{staffMember.name}</div>
                            <div className={`text-xs ${
                              !sch.confirmed ? 'text-amber-400' : staffStatusColor[staffMember.status as keyof typeof staffStatusColor]
                            }`}>
                              {!sch.confirmed ? '已占用(待确认)' : staffMember.status}
                            </div>
                          </div>
                        )}
                        {vehicle && (
                          <div className="text-right border border-slate-600/50 rounded-lg px-3 py-1.5 bg-slate-900/40">
                            <div className="text-xs text-slate-400 mb-0.5">车辆</div>
                            <div className="text-sm text-white font-mono font-medium">{vehicle.plateNumber}</div>
                            <div className={`text-xs ${
                              !sch.confirmed ? 'text-amber-400' : vehicleStatusColor[vehicle.status as keyof typeof vehicleStatusColor]
                            }`}>
                              {!sch.confirmed ? '已占用(待确认)' : vehicle.status}
                            </div>
                          </div>
                        )}
                        {sch.type === '车辆调度' && !staffMember && (
                          <div className="text-right border border-red-700/50 rounded-lg px-3 py-1.5 bg-red-900/20">
                            <div className="text-xs text-slate-400 mb-0.5">司机</div>
                            <div className="text-sm text-red-400 font-medium">未分配</div>
                            <div className="text-xs text-red-500">⚠ 缺司机</div>
                          </div>
                        )}
                        {sch.type === '车辆调度' && !vehicle && (
                          <div className="text-right border border-red-700/50 rounded-lg px-3 py-1.5 bg-red-900/20">
                            <div className="text-xs text-slate-400 mb-0.5">车辆</div>
                            <div className="text-sm text-red-400 font-mono font-medium">未分配</div>
                            <div className="text-xs text-red-500">⚠ 缺车辆</div>
                          </div>
                        )}
                        {!sch.confirmed && !sch.escalated && (
                          <button
                            onClick={() => confirmSchedule(sch.id)}
                            className="flex items-center gap-1 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm rounded-lg transition-all shadow-lg shadow-amber-900/30 font-medium"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            确认排班
                          </button>
                        )}
                        {sch.escalated && !sch.confirmed && (
                          <button
                            onClick={() => confirmSchedule(sch.id)}
                            className="flex items-center gap-1 px-5 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm rounded-lg transition-all shadow-lg shadow-red-900/30 font-medium"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            主管确认
                          </button>
                        )}
                        {sch.confirmed && (
                          <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            已确认
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-80 border-l border-slate-700 bg-slate-900/50 overflow-y-auto">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-white font-medium">服务人员</h3>
          </div>
          <div className="p-3 space-y-2">
            {staff.map((s) => {
              const RoleIcon = roleIcons[s.role] || Users2;
              const busyCount = schedules.filter(
                (sch) => sch.staffId === s.id && !sch.confirmed && sch.status !== 'completed',
              ).length;
              return (
                <div key={s.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <RoleIcon className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-slate-400">{s.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {busyCount > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300">
                          {busyCount}待确认
                        </span>
                      )}
                      <span className={`text-xs ${staffStatusColor[s.status as keyof typeof staffStatusColor]}`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <Phone className="w-3 h-3" />
                    {s.phone}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-b border-t border-slate-700">
            <h3 className="text-white font-medium">车辆状态</h3>
          </div>
          <div className="p-3 space-y-2">
            {vehicles.map((v) => {
              const busyCount = schedules.filter(
                (sch) => sch.vehicleId === v.id && !sch.confirmed && sch.status !== 'completed',
              ).length;
              return (
                <div key={v.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <Car className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-mono font-medium">{v.plateNumber}</div>
                        <div className="text-xs text-slate-400">{v.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {busyCount > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300">
                          {busyCount}待确认
                        </span>
                      )}
                      <span className={`text-xs ${vehicleStatusColor[v.status as keyof typeof vehicleStatusColor]}`}>
                        {v.status}
                      </span>
                    </div>
                  </div>
                  {v.currentTask && (
                    <div className="mt-2 text-xs text-blue-300 bg-blue-900/30 rounded px-2 py-1">
                      {v.currentTask}
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
