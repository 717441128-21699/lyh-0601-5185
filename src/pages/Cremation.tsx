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
  Clock,
  User,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import type { MaintenanceWorkOrder } from '../types';

export default function Cremation() {
  const furnaces = useAppStore((s) => s.furnaces);
  const updateWorkOrderStatus = useAppStore((s) => s.updateWorkOrderStatus);

  const statusConfig = {
    running: { label: '运行中', icon: Flame, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-700' },
    idle: { label: '空闲', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-900/30 border-green-700' },
    maintenance: { label: '维护中', icon: Wrench, color: 'text-slate-400', bg: 'bg-slate-800/50 border-slate-600' },
    warning: { label: '预警', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-700' },
    error: { label: '故障', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/30 border-red-700' },
  };

  const workOrderStatusConfig = {
    pending: { label: '待处理', icon: PauseCircle, color: 'text-amber-400', bg: 'bg-amber-900/30', btn: '开始' },
    in_progress: { label: '进行中', icon: PlayCircle, color: 'text-blue-400', bg: 'bg-blue-900/30', btn: '完成' },
    completed: { label: '已完成', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/30', btn: '' },
  };

  const allWorkOrders = furnaces.flatMap((f) =>
    f.workOrders.map((wo) => ({ ...wo, furnaceId: f.id, furnaceName: f.name })),
  );

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
              <Flame className="w-6 h-6 text-orange-400" />
              火化车间监控 · 维护管理
            </h2>
            <p className="text-slate-400 text-sm mt-1">炉温监控、保养预警、维护工单全链路管理</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">待处理工单：</span>
            <span className="px-3 py-1 bg-amber-900/50 text-amber-300 rounded-full font-medium border border-amber-700">
              {allWorkOrders.filter((wo) => wo.status === 'pending').length}
            </span>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <Scene3D view="cremation" />
            </div>

            <div className="border-t border-slate-700 p-4 bg-slate-900/50">
              <h4 className="text-sm text-slate-300 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                维护工单列表
              </h4>
              {allWorkOrders.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-600" />
                  <p className="text-sm">暂无维护工单</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {allWorkOrders.map((wo) => {
                    const status = workOrderStatusConfig[wo.status];
                    const StatusIcon = status.icon;
                    const nextStatus = wo.status === 'pending' ? 'in_progress' : wo.status === 'in_progress' ? 'completed' : null;

                    return (
                      <div
                        key={wo.id}
                        className={`${status.bg} border border-slate-700 rounded-xl p-4 transition-all`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
                              <Wrench className={`w-5 h-5 ${status.color}`} />
                            </div>
                            <div>
                              <h4 className="text-white font-medium text-sm">{wo.furnaceName}</h4>
                              <div className="flex items-center gap-1 text-xs text-slate-400">
                                <span
                                  className={`px-1.5 py-0.5 rounded ${
                                    wo.priority === 'high'
                                      ? 'bg-red-900/50 text-red-400'
                                      : wo.priority === 'medium'
                                        ? 'bg-amber-900/50 text-amber-400'
                                        : 'bg-blue-900/50 text-blue-400'
                                  }`}
                                >
                                  {wo.priority === 'high' ? '高优' : wo.priority === 'medium' ? '中优' : '低优'}
                                </span>
                                <span>
                                  {wo.type === 'routine' ? '常规保养' : wo.type === 'temperature' ? '温度异常' : '维修'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 ${status.color} text-xs px-2 py-1 rounded-full bg-slate-900/50`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 mb-3 bg-slate-900/50 rounded-lg p-2.5">
                          {wo.description}
                        </p>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 text-slate-400">
                            {wo.assignedTo && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {wo.assignedTo}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {wo.createdAt.toLocaleString('zh-CN', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {nextStatus && (
                            <button
                              onClick={() => updateWorkOrderStatus(wo.furnaceId, wo.id, nextStatus)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs rounded-md transition-all shadow-lg shadow-amber-900/20"
                            >
                              {status.btn}
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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

                    {f.workOrders.length > 0 && (
                      <div className="pt-2 border-t border-slate-700">
                        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                          <Wrench className="w-3 h-3" />
                          工单 ({f.workOrders.filter((wo) => wo.status !== 'completed').length} 待处理)
                        </p>
                        <div className="space-y-1.5">
                          {f.workOrders.slice(0, 2).map((wo) => (
                            <div
                              key={wo.id}
                              className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-800/50 rounded"
                            >
                              <span className="text-slate-300 truncate">{wo.description.slice(0, 20)}...</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-xs ${
                                  workOrderStatusConfig[wo.status].bg
                                } ${workOrderStatusConfig[wo.status].color}`}
                              >
                                {workOrderStatusConfig[wo.status].label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {f.currentFamily && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700">
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
