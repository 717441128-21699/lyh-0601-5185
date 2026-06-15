import { useAppStore } from '../store/useAppStore';
import { exportDailyReport } from '../utils/excelExport';
import {
  BarChart3,
  Download,
  Flame,
  Users,
  Heart,
  CalendarDays,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function Reports() {
  const dailyStats = useAppStore((s) => s.dailyStats);
  const halls = useAppStore((s) => s.halls);
  const furnaces = useAppStore((s) => s.furnaces);

  const totalCremation = dailyStats.reduce((sum, d) => sum + d.cremationCount, 0);
  const avgSatisfaction = dailyStats.reduce((sum, d) => sum + d.avgSatisfaction, 0) / dailyStats.length;
  const totalServices = dailyStats.reduce((sum, d) => sum + d.serviceCount, 0);
  const avgHallUsage = dailyStats.reduce((sum, d) => sum + d.hallUsage, 0) / dailyStats.length;

  const hallUsageData = halls.map((h) => ({
    name: h.name,
    使用率: h.status === 'in_use' || h.status === 'reserved' ? 80 : h.status === 'maintenance' ? 0 : 30,
  }));

  const pieData = [
    { name: '使用中', value: halls.filter((h) => h.status === 'in_use').length },
    { name: '已预约', value: halls.filter((h) => h.status === 'reserved').length },
    { name: '空闲', value: halls.filter((h) => h.status === 'available').length },
    { name: '维护中', value: halls.filter((h) => h.status === 'maintenance').length },
  ];

  const PIE_COLORS = ['#3b82f6', '#f59e0b', '#22c55e', '#6b7280'];

  const handleExport = () => {
    exportDailyReport(dailyStats, halls, furnaces);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            <BarChart3 className="w-6 h-6 text-amber-400" />
            数据统计与报表
          </h2>
          <p className="text-slate-400 text-sm mt-1">火化量、厅室使用率、满意度统计与导出</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-lg transition-all shadow-lg shadow-amber-900/30 font-medium"
        >
          <Download className="w-4 h-4" />
          导出Excel日报
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: '本周火化总量',
              value: totalCremation,
              unit: '具',
              icon: Flame,
              color: 'from-orange-600 to-red-700',
              trend: '+12%',
            },
            {
              label: '平均厅室使用',
              value: avgHallUsage.toFixed(1),
              unit: '间/日',
              icon: Users,
              color: 'from-blue-600 to-blue-800',
              trend: '+5%',
            },
            {
              label: '平均满意度',
              value: avgSatisfaction.toFixed(1),
              unit: '%',
              icon: Heart,
              color: 'from-rose-600 to-rose-800',
              trend: '+2%',
            },
            {
              label: '本周服务次数',
              value: totalServices,
              unit: '次',
              icon: CalendarDays,
              color: 'from-emerald-600 to-emerald-800',
              trend: '+8%',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">{card.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{card.value}</span>
                    <span className="text-slate-400 text-sm">{card.unit}</span>
                  </div>
                  <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    周环比 {card.trend}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}
                >
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              每日火化量趋势
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Line
                  type="monotone"
                  dataKey="cremationCount"
                  name="火化量"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              满意度与服务次数
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="serviceCount" name="服务次数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="avgSatisfaction" name="满意度%" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              各告别厅使用率对比
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hallUsageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="使用率" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                  {hallUsageData.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#f59e0b' : '#d97706'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              告别厅状态分布
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#64748b' }}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
