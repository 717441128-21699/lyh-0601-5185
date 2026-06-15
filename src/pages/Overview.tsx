import Scene3D from '../components/3d/Scene3D';
import DataPanel from '../components/layout/DataPanel';
import { useAppStore } from '../store/useAppStore';
import {
  Users,
  Flame,
  Archive,
  Car,
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function Overview() {
  const halls = useAppStore((s) => s.halls);
  const furnaces = useAppStore((s) => s.furnaces);
  const slots = useAppStore((s) => s.slots);
  const vehicles = useAppStore((s) => s.vehicles);
  const dailyStats = useAppStore((s) => s.dailyStats);

  const todayStat = dailyStats[dailyStats.length - 1];
  const activeHalls = halls.filter((h) => h.status === 'in_use').length;
  const runningFurnaces = furnaces.filter((f) => f.status === 'running' || f.status === 'warning').length;
  const occupiedSlots = slots.filter((s) => s.status === 'occupied' || s.status === 'expiring').length;
  const activeVehicles = vehicles.filter((v) => v.status === '出车中').length;

  const statCards = [
    {
      label: '告别厅使用中',
      value: `${activeHalls}/${halls.length}`,
      icon: Users,
      color: 'from-blue-600 to-blue-800',
      subtext: '使用率 50%',
    },
    {
      label: '火化炉运行',
      value: `${runningFurnaces}/${furnaces.length}`,
      icon: Flame,
      color: 'from-orange-600 to-orange-800',
      subtext: `今日火化 ${todayStat?.cremationCount || 0} 具`,
    },
    {
      label: '格口已占用',
      value: `${occupiedSlots}/${slots.length}`,
      icon: Archive,
      color: 'from-amber-600 to-amber-800',
      subtext: `占用率 ${((occupiedSlots / slots.length) * 100).toFixed(1)}%`,
    },
    {
      label: '车辆出车中',
      value: `${activeVehicles}/${vehicles.length}`,
      icon: Car,
      color: 'from-emerald-600 to-emerald-800',
      subtext: `今日服务 ${todayStat?.serviceCount || 0} 次`,
    },
  ];

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-4 gap-4 p-4">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-xs mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {card.subtext}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}
                >
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700">
            <p className="text-amber-400 text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              全景总览模式
            </p>
          </div>
          <Scene3D view="overview" />
        </div>
      </div>
      <DataPanel />
    </div>
  );
}
