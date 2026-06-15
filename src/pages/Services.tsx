import { useAppStore } from '../store/useAppStore';
import {
  Users2,
  Mic,
  Music,
  Car,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Phone,
  ChevronRight,
} from 'lucide-react';

export default function Services() {
  const staff = useAppStore((s) => s.staff);
  const vehicles = useAppStore((s) => s.vehicles);
  const schedules = useAppStore((s) => s.schedules);
  const confirmSchedule = useAppStore((s) => s.confirmSchedule);

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

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
          <Users2 className="w-6 h-6 text-amber-400" />
          治丧服务调度
        </h2>
        <p className="text-slate-400 text-sm mt-1">司仪、乐队、灵车自动排班，超时升级主管</p>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              服务排班
            </h3>
            <div className="grid gap-3">
              {schedules.map((sch) => {
                const status = sch.escalated ? statusStyles.escalated : statusStyles[sch.status];
                const Icon = roleIcons[sch.type] || Users2;
                const staffMember = sch.staffId ? staff.find((s) => s.id === sch.staffId) : null;
                const vehicle = sch.vehicleId ? vehicles.find((v) => v.id === sch.vehicleId) : null;

                return (
                  <div
                    key={sch.id}
                    className={`${status.bg} border rounded-xl p-4 transition-all hover:scale-[1.005]`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${status.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-bold">{sch.type}</h4>
                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-900/60 ${status.color}`}>
                              <status.icon className="w-3 h-3" />
                              {status.label}
                            </span>
                            {sch.escalated && (
                              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-900/60 text-red-300 border border-red-700">
                                <AlertTriangle className="w-3 h-3" />
                                已升级主管
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
                            <span className="text-slate-200">{sch.familyName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {staffMember && (
                          <div className="text-right">
                            <div className="text-sm text-white">{staffMember.name}</div>
                            <div className={`text-xs ${staffStatusColor[staffMember.status as keyof typeof staffStatusColor]}`}>
                              {staffMember.status}
                            </div>
                          </div>
                        )}
                        {vehicle && (
                          <div className="text-right">
                            <div className="text-sm text-white font-mono">{vehicle.plateNumber}</div>
                            <div className={`text-xs ${vehicleStatusColor[vehicle.status as keyof typeof vehicleStatusColor]}`}>
                              {vehicle.status}
                            </div>
                          </div>
                        )}
                        {!sch.confirmed && (
                          <button
                            onClick={() => confirmSchedule(sch.id)}
                            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-sm rounded-lg transition-all shadow-lg shadow-amber-900/30"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            确认
                          </button>
                        )}
                        {sch.confirmed && (
                          <div className="flex items-center gap-1 text-green-400 text-sm">
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
                    <div className={`text-xs ${staffStatusColor[s.status as keyof typeof staffStatusColor]}`}>
                      {s.status}
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
            {vehicles.map((v) => (
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
                  <div className={`text-xs ${vehicleStatusColor[v.status as keyof typeof vehicleStatusColor]}`}>
                    {v.status}
                  </div>
                </div>
                {v.currentTask && (
                  <div className="mt-2 text-xs text-blue-300 bg-blue-900/30 rounded px-2 py-1">
                    {v.currentTask}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
