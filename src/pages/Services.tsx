import { useAppStore } from '../store/useAppStore';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ServiceSchedule, ResourceOption } from '../types';
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
  Wrench,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';

export default function Services() {
  const staff = useAppStore((s) => s.staff);
  const vehicles = useAppStore((s) => s.vehicles);
  const schedules = useAppStore((s) => s.schedules);
  const confirmSchedule = useAppStore((s) => s.confirmSchedule);
  const updateProgress = useAppStore((s) => s.updateProgress);
  const escalateOverdueSchedules = useAppStore((s) => s.escalateOverdueSchedules);
  const autoAssignMissingResources = useAppStore((s) => s.autoAssignMissingResources);
  const repairIncompleteSchedules = useAppStore((s) => s.repairIncompleteSchedules);
  const resolveScheduleConflict = useAppStore((s) => s.resolveScheduleConflict);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tick, setTick] = useState(0);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null);

  const highlightId = searchParams.get('highlight') || undefined;

  useEffect(() => {
    if (highlightId) {
      setExpandedScheduleId(highlightId);
      const timer = setTimeout(() => {
        setSearchParams((prev) => {
          prev.delete('highlight');
          return prev;
        });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, setSearchParams]);

  useEffect(() => {
    repairIncompleteSchedules();
    const t1 = setInterval(() => {
      updateProgress();
      setTick((t) => t + 1);
    }, 1000);
    const t2 = setInterval(() => {
      escalateOverdueSchedules();
    }, 5000);
    const t3 = setInterval(() => {
      repairIncompleteSchedules();
    }, 10000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
    };
  }, [updateProgress, escalateOverdueSchedules, repairIncompleteSchedules]);

  const currentTime = new Date();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const isResourceComplete = (sch: any) => {
    if (sch.type === '车辆调度') {
      return !!sch.staffId && !!sch.vehicleId;
    }
    return !!sch.staffId;
  };

  const getAvailableOptions = (sch: ServiceSchedule) => {
    const otherSchedules = schedules.filter((s) => s.id !== sch.id);
    const staffRole = sch.type === '车辆调度' ? '灵车司机' : sch.type;

    const staffOptions: ResourceOption[] = staff
      .filter((s) => s.role === staffRole)
      .map((s) => {
        const hasConflict = otherSchedules.some(
          (os) =>
            os.staffId === s.id &&
            os.startTime < sch.endTime &&
            os.endTime > sch.startTime,
        );
        return {
          id: s.id,
          name: s.name,
          conflictReason: hasConflict ? `与 ${otherSchedules.find(os => os.staffId === s.id && os.startTime < sch.endTime && os.endTime > sch.startTime)?.familyName || '其他预约'} 冲突` : undefined,
        };
      });

    const vehicleOptions: ResourceOption[] | undefined = sch.type === '车辆调度'
      ? vehicles
          .filter((v) => v.type === '灵车')
          .map((v) => {
            const hasConflict = otherSchedules.some(
              (os) =>
                os.vehicleId === v.id &&
                os.startTime < sch.endTime &&
                os.endTime > sch.startTime,
            );
            return {
              id: v.id,
              name: v.plateNumber,
              conflictReason: hasConflict ? `与 ${otherSchedules.find(os => os.vehicleId === v.id && os.startTime < sch.endTime && os.endTime > sch.startTime)?.familyName || '其他预约'} 冲突` : undefined,
            };
          })
      : undefined;

    return { staffOptions, vehicleOptions };
  };

  const handleConfirm = (id: string) => {
    const result = confirmSchedule(id);
    showToast(result.success ? 'success' : 'error', result.message);
  };

  const handleAutoAssign = (id: string) => {
    const result = autoAssignMissingResources(id);
    showToast(result.success ? 'success' : 'error', result.message);
  };

  const handleResolveConflict = (scheduleId: string, staffId?: string, vehicleId?: string) => {
    const result = resolveScheduleConflict(scheduleId, staffId, vehicleId);
    showToast(result.success ? 'success' : 'error', result.message);
    if (result.success) {
      setExpandedScheduleId(null);
    }
  };

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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/30 rounded-lg border border-purple-700">
            <Wrench className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300">资源不齐：{schedules.filter((s) => !s.confirmed && s.status !== 'completed' && !isResourceComplete(s)).length}</span>
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
                const isHighlighted = highlightId === sch.id;
                const isExpanded = expandedScheduleId === sch.id;
                const { staffOptions, vehicleOptions } = !sch.confirmed ? getAvailableOptions(sch) : { staffOptions: [], vehicleOptions: undefined };
                const hasConflict = staffOptions.some((o) => o.conflictReason) || vehicleOptions?.some((o) => o.conflictReason);

                return (
                  <div
                    key={sch.id}
                    ref={(el) => {
                      if (isHighlighted && el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={`${status.bg} border rounded-xl transition-all hover:scale-[1.005] ${
                      confirmTime?.urgent ? 'animate-pulse shadow-lg' : ''
                    } ${isHighlighted ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-amber-500/50 shadow-lg' : ''}`}
                  >
                    <div className="p-4">
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
                              {hasConflict && !sch.confirmed && (
                                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700">
                                  <AlertTriangle className="w-3 h-3" />
                                  资源冲突
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
                          <div className="flex flex-col gap-1.5 items-end">
                            {!sch.confirmed && (
                              <>
                                {hasConflict && (
                                  <button
                                    onClick={() => setExpandedScheduleId(isExpanded ? null : sch.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-xs rounded-lg transition-all shadow-lg shadow-purple-900/30 font-medium"
                                  >
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    冲突方案
                                  </button>
                                )}
                                {!isResourceComplete(sch) && sch.type === '车辆调度' && (
                                  <button
                                    onClick={() => handleAutoAssign(sch.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xs rounded-lg transition-all shadow-lg shadow-blue-900/30 font-medium"
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                    自动补派
                                  </button>
                                )}
                                {!sch.escalated && (
                                  <button
                                    onClick={() => handleConfirm(sch.id)}
                                    disabled={!isResourceComplete(sch)}
                                    className={`flex items-center gap-1 px-5 py-2 text-white text-sm rounded-lg transition-all shadow-lg font-medium ${
                                      isResourceComplete(sch)
                                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-900/30'
                                        : 'bg-slate-600 cursor-not-allowed opacity-50'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {isResourceComplete(sch) ? '确认排班' : '资源不齐'}
                                  </button>
                                )}
                                {sch.escalated && (
                                  <button
                                    onClick={() => handleConfirm(sch.id)}
                                    disabled={!isResourceComplete(sch)}
                                    className={`flex items-center gap-1 px-5 py-2 text-white text-sm rounded-lg transition-all shadow-lg font-medium ${
                                      isResourceComplete(sch)
                                        ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-900/30'
                                        : 'bg-slate-600 cursor-not-allowed opacity-50'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {isResourceComplete(sch) ? '主管确认' : '资源不齐'}
                                  </button>
                                )}
                              </>
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
                    </div>

                    {isExpanded && hasConflict && (
                      <div className="border-t border-slate-700 p-4 bg-slate-900/50 space-y-4">
                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-purple-400" />
                          资源冲突替换方案
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-slate-400 block mb-2">
                              {sch.type === '车辆调度' ? '司机选择' : '人员选择'}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {staffOptions.map((opt) => (
                                <button
                                  key={opt.id}
                                  onClick={() => !opt.conflictReason && handleResolveConflict(sch.id, opt.id, undefined)}
                                  disabled={!!opt.conflictReason}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                                    opt.conflictReason
                                      ? 'bg-red-900/20 border border-red-700/50 text-red-400 cursor-not-allowed opacity-60'
                                      : 'bg-green-900/20 border border-green-700/50 text-green-400 hover:bg-green-900/40 cursor-pointer'
                                  } ${sch.staffId === opt.id ? 'ring-2 ring-amber-400' : ''}`}
                                >
                                  <User className="w-4 h-4 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{opt.name}</div>
                                    {opt.conflictReason && (
                                      <div className="text-xs text-red-500 truncate">{opt.conflictReason}</div>
                                    )}
                                    {!opt.conflictReason && sch.staffId !== opt.id && (
                                      <div className="text-xs text-green-500">点击选择</div>
                                    )}
                                    {sch.staffId === opt.id && (
                                      <div className="text-xs text-amber-400">当前分配</div>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {vehicleOptions && (
                            <div>
                              <label className="text-xs text-slate-400 block mb-2">车辆选择</label>
                              <div className="grid grid-cols-2 gap-2">
                                {vehicleOptions.map((opt) => (
                                  <button
                                    key={opt.id}
                                    onClick={() => !opt.conflictReason && handleResolveConflict(sch.id, undefined, opt.id)}
                                    disabled={!!opt.conflictReason}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                                      opt.conflictReason
                                        ? 'bg-red-900/20 border border-red-700/50 text-red-400 cursor-not-allowed opacity-60'
                                        : 'bg-green-900/20 border border-green-700/50 text-green-400 hover:bg-green-900/40 cursor-pointer'
                                    } ${sch.vehicleId === opt.id ? 'ring-2 ring-amber-400' : ''}`}
                                  >
                                    <Car className="w-4 h-4 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium font-mono truncate">{opt.name}</div>
                                      {opt.conflictReason && (
                                        <div className="text-xs text-red-500 truncate">{opt.conflictReason}</div>
                                      )}
                                      {!opt.conflictReason && sch.vehicleId !== opt.id && (
                                        <div className="text-xs text-green-500">点击选择</div>
                                      )}
                                      {sch.vehicleId === opt.id && (
                                        <div className="text-xs text-amber-400">当前分配</div>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-slate-500">
                          提示：绿色选项可直接点击切换，红色选项表示该时间段与其他家属冲突
                        </p>
                      </div>
                    )}
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

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
