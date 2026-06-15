import Scene3D from '../components/3d/Scene3D';
import { useAppStore } from '../store/useAppStore';
import { useState, useMemo } from 'react';
import type { NewAppointmentRequest, UpdateAppointmentRequest, Appointment } from '../types';
import {
  DoorOpen,
  Users,
  Clock,
  Crown,
  AlertCircle,
  CheckCircle2,
  Circle,
  Plus,
  CalendarDays,
  UserPlus,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mic,
  Music,
  Car,
  X,
  Pencil,
} from 'lucide-react';

export default function Farewell() {
  const halls = useAppStore((s) => s.halls);
  const appointments = useAppStore((s) => s.appointments);
  const createAppointment = useAppStore((s) => s.createAppointment);
  const updateAppointment = useAppStore((s) => s.updateAppointment);
  const lastAllocationResult = useAppStore((s) => s.lastAllocationResult);
  const clearAllocationResult = useAppStore((s) => s.clearAllocationResult);

  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<{
    familyName: string;
    date: string;
    time: string;
    durationMinutes: number;
    spec: '标准' | '豪华' | 'VIP';
    priority: number;
    attendees: number;
    needsEmcee: boolean;
    needsBand: boolean;
    needsVehicle: boolean;
  }>({
    familyName: '',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    durationMinutes: 60,
    spec: '标准',
    priority: 2,
    attendees: 50,
    needsEmcee: false,
    needsBand: false,
    needsVehicle: false,
  });

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

  const sortedAppointments = useMemo(
    () => [...appointments].sort((a, b) => a.priority - b.priority),
    [appointments],
  );

  const resetForm = () => {
    setFormData({
      familyName: '',
      date: new Date().toISOString().slice(0, 10),
      time: '10:00',
      durationMinutes: 60,
      spec: '标准',
      priority: 2,
      attendees: 50,
      needsEmcee: false,
      needsBand: false,
      needsVehicle: false,
    });
    setEditingAppointment(null);
  };

  const handleSubmit = () => {
    if (!formData.familyName.trim()) return;
    const startDateTime = new Date(`${formData.date}T${formData.time}:00`);

    if (editingAppointment) {
      const request: UpdateAppointmentRequest = {
        appointmentId: editingAppointment.id,
        startTime: startDateTime,
        durationMinutes: formData.durationMinutes,
        spec: formData.spec,
        priority: formData.priority,
        attendees: formData.attendees,
      };
      updateAppointment(request);
    } else {
      const request: NewAppointmentRequest = {
        familyName: formData.familyName,
        startTime: startDateTime,
        durationMinutes: formData.durationMinutes,
        spec: formData.spec,
        priority: formData.priority,
        attendees: formData.attendees,
        needsEmcee: formData.needsEmcee,
        needsBand: formData.needsBand,
        needsVehicle: formData.needsVehicle,
      };
      createAppointment(request);
    }
    setShowForm(false);
    resetForm();
  };

  const openEditForm = (apt: Appointment) => {
    const hall = halls.find(h => h.id === apt.hallId);
    const duration = Math.round((apt.endTime.getTime() - apt.startTime.getTime()) / 60000);
    setEditingAppointment(apt);
    setFormData({
      familyName: apt.familyName,
      date: apt.startTime.toISOString().slice(0, 10),
      time: apt.startTime.toTimeString().slice(0, 5),
      durationMinutes: duration,
      spec: (hall?.spec || '标准') as '标准' | '豪华' | 'VIP',
      priority: apt.priority,
      attendees: apt.attendees,
      needsEmcee: apt.needsEmcee || false,
      needsBand: apt.needsBand || false,
      needsVehicle: apt.needsVehicle || false,
    });
    setShowForm(true);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
              <DoorOpen className="w-6 h-6 text-amber-400" />
              告别厅管理 · 智能调度
            </h2>
            <p className="text-slate-400 text-sm mt-1">按时间、规格、优先级自动分配，冲突时按遗体告别优先排序调整</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-lg transition-all shadow-lg shadow-amber-900/30 font-medium"
          >
            <Plus className="w-4 h-4" />
            新增预约
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <Scene3D view="farewell" />
            </div>

            {lastAllocationResult && (
              <div
                className={`m-4 p-4 rounded-xl border ${
                  lastAllocationResult.status === 'success'
                    ? 'bg-green-900/30 border-green-700'
                    : lastAllocationResult.status === 'conflict'
                      ? 'bg-amber-900/30 border-amber-700'
                      : 'bg-red-900/30 border-red-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {lastAllocationResult.status === 'success' ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : lastAllocationResult.status === 'conflict' ? (
                      <ArrowRightLeft className="w-6 h-6 text-amber-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <h4
                        className={`font-bold ${
                          lastAllocationResult.status === 'success'
                            ? 'text-green-400'
                            : lastAllocationResult.status === 'conflict'
                              ? 'text-amber-400'
                              : 'text-red-400'
                        }`}
                      >
                        {lastAllocationResult.status === 'success' ? '分配成功' : lastAllocationResult.status === 'conflict' ? '冲突已调整' : '分配失败'}
                      </h4>
                      <p className="text-slate-300 text-sm">{lastAllocationResult.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={clearAllocationResult}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {lastAllocationResult.assignedHallName && (
                  <div className="mb-3 px-3 py-2 bg-slate-900/50 rounded-lg">
                    <span className="text-slate-400 text-sm">分配厅室：</span>
                    <span className="text-white font-medium ml-2">{lastAllocationResult.assignedHallName}</span>
                  </div>
                )}

                {lastAllocationResult.conflicts.length > 0 && (
                  <div>
                    <h5 className="text-sm text-slate-300 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      受影响的家属名单（已自动调整）：
                    </h5>
                    <div className="space-y-2">
                      {lastAllocationResult.conflicts.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <UserPlus className="w-4 h-4 text-amber-400" />
                            <span className="text-white font-medium">{c.familyName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="text-slate-500">{c.oldHallName}</span>
                            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                            <span className="text-green-400">{c.newHallName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-slate-700 p-4">
              <h4 className="text-sm text-slate-300 mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-amber-400" />
                预约时间表（按优先级排序，优先级1最高）
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 px-2">优先级</th>
                      <th className="text-left py-2 px-2">家属</th>
                      <th className="text-left py-2 px-2">厅室</th>
                      <th className="text-left py-2 px-2">开始时间</th>
                      <th className="text-left py-2 px-2">结束时间</th>
                      <th className="text-left py-2 px-2">状态</th>
                      <th className="text-left py-2 px-2">服务</th>
                      <th className="text-left py-2 px-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAppointments.filter(a => a.status !== 'completed').map((apt) => (
                      <tr key={apt.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            apt.priority === 1 ? 'bg-red-900/50 text-red-400' : apt.priority === 2 ? 'bg-amber-900/50 text-amber-400' : 'bg-blue-900/50 text-blue-400'
                          }`}>
                            P{apt.priority}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-white font-medium">{apt.familyName}</td>
                        <td className="py-2 px-2 text-slate-300">{halls.find(h => h.id === apt.hallId)?.name}</td>
                        <td className="py-2 px-2 text-slate-300 font-mono text-xs">
                          {apt.startTime.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2 px-2 text-slate-300 font-mono text-xs">
                          {apt.endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2 px-2">
                          <span className={`text-xs ${
                            apt.status === 'in_progress' ? 'text-green-400' : apt.status === 'scheduled' ? 'text-amber-400' : 'text-slate-500'
                          }`}>
                            {apt.status === 'in_progress' ? '进行中' : apt.status === 'scheduled' ? '已预约' : '已完成'}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1">
                            {apt.needsEmcee && <Mic className="w-3.5 h-3.5 text-blue-400" aria-label="司仪" />}
                            {apt.needsBand && <Music className="w-3.5 h-3.5 text-purple-400" aria-label="乐队" />}
                            {apt.needsVehicle && <Car className="w-3.5 h-3.5 text-emerald-400" aria-label="灵车" />}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <button
                            onClick={() => openEditForm(apt)}
                            className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 rounded text-xs transition-colors"
                            title="编辑预约（调整时间、规格、优先级后自动重新分配厅室）"
                          >
                            <Pencil className="w-3 h-3" />
                            编辑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="w-96 border-l border-slate-700 bg-slate-900/50 overflow-y-auto p-4 space-y-3">
            <h3 className="text-white font-medium text-sm mb-2">厅室状态</h3>
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

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
                <CalendarDays className="w-5 h-5 text-amber-400" />
                {editingAppointment ? '调整告别仪式预约' : '新增告别仪式预约'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">家属姓名</label>
                <input
                  type="text"
                  value={formData.familyName}
                  onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                  placeholder="如：李氏家属"
                  readOnly={!!editingAppointment}
                  className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500 transition-colors ${
                    editingAppointment
                      ? 'bg-slate-900 border-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
                  }`}
                />
                {editingAppointment && (
                  <p className="text-xs text-slate-500 mt-1">家属姓名不可修改</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">预约日期</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">开始时间</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">持续时长（分钟）</label>
                  <select
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value={30}>30 分钟</option>
                    <option value={45}>45 分钟</option>
                    <option value={60}>60 分钟</option>
                    <option value={90}>90 分钟</option>
                    <option value={120}>120 分钟</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">厅室规格</label>
                  <select
                    value={formData.spec}
                    onChange={(e) => setFormData({ ...formData, spec: e.target.value as '标准' | '豪华' | 'VIP' })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="标准">标准厅</option>
                    <option value="豪华">豪华厅</option>
                    <option value="VIP">VIP厅</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">优先级</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value={1}>1 - 最高（遗体告别）</option>
                    <option value={2}>2 - 普通</option>
                    <option value={3}>3 - 较低</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">预计出席人数</label>
                  <input
                    type="number"
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: Number(e.target.value) })}
                    min={1}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">附加服务</label>
                <div className="flex gap-3">
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    editingAppointment ? 'bg-slate-900 cursor-not-allowed opacity-60' : 'bg-slate-800 cursor-pointer hover:bg-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.needsEmcee}
                      onChange={(e) => !editingAppointment && setFormData({ ...formData, needsEmcee: e.target.checked })}
                      disabled={!!editingAppointment}
                      className="rounded text-amber-500 focus:ring-amber-500 bg-slate-700 border-slate-600 disabled:cursor-not-allowed"
                    />
                    <Mic className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300">司仪</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    editingAppointment ? 'bg-slate-900 cursor-not-allowed opacity-60' : 'bg-slate-800 cursor-pointer hover:bg-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.needsBand}
                      onChange={(e) => !editingAppointment && setFormData({ ...formData, needsBand: e.target.checked })}
                      disabled={!!editingAppointment}
                      className="rounded text-amber-500 focus:ring-amber-500 bg-slate-700 border-slate-600 disabled:cursor-not-allowed"
                    />
                    <Music className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-slate-300">乐队</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    editingAppointment ? 'bg-slate-900 cursor-not-allowed opacity-60' : 'bg-slate-800 cursor-pointer hover:bg-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.needsVehicle}
                      onChange={(e) => !editingAppointment && setFormData({ ...formData, needsVehicle: e.target.checked })}
                      disabled={!!editingAppointment}
                      className="rounded text-amber-500 focus:ring-amber-500 bg-slate-700 border-slate-600 disabled:cursor-not-allowed"
                    />
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-slate-300">灵车</span>
                  </label>
                </div>
                {editingAppointment && (
                  <p className="text-xs text-slate-500 mt-1">附加服务在调整模式下不可修改</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.familyName.trim()}
                className="flex-1 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg shadow-amber-900/30 font-medium"
              >
                {editingAppointment ? '重新分配厅室' : '智能分配'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
