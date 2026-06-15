import * as XLSX from 'xlsx';
import type { DailyStats, FarewellHall, CremationFurnace } from '../types';

export function exportDailyReport(
  stats: DailyStats[],
  halls: FarewellHall[],
  furnaces: CremationFurnace[],
) {
  const wb = XLSX.utils.book_new();

  const statsData = stats.map((s) => ({
    日期: s.date,
    火化量: s.cremationCount,
    厅室使用数: s.hallUsage,
    厅室总数: s.hallTotal,
    厅室使用率: `${((s.hallUsage / s.hallTotal) * 100).toFixed(1)}%`,
    平均满意度: `${s.avgSatisfaction}%`,
    服务次数: s.serviceCount,
  }));
  const ws1 = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, ws1, '每日统计');

  const hallData = halls.map((h) => ({
    厅室名称: h.name,
    规格: h.spec,
    容纳人数: h.capacity,
    当前状态:
      h.status === 'available'
        ? '空闲'
        : h.status === 'in_use'
          ? '使用中'
          : h.status === 'reserved'
            ? '已预约'
            : '维护中',
  }));
  const ws2 = XLSX.utils.json_to_sheet(hallData);
  XLSX.utils.book_append_sheet(wb, ws2, '告别厅状态');

  const furnaceData = furnaces.map((f) => ({
    炉体名称: f.name,
    当前温度: `${f.temperature}℃`,
    累计使用: f.usageCount,
    保养阈值: f.maintenanceThreshold,
    状态:
      f.status === 'running'
        ? '运行中'
        : f.status === 'idle'
          ? '空闲'
          : f.status === 'maintenance'
            ? '维护中'
            : f.status === 'warning'
              ? '预警'
              : '故障',
  }));
  const ws3 = XLSX.utils.json_to_sheet(furnaceData);
  XLSX.utils.book_append_sheet(wb, ws3, '火化车间状态');

  XLSX.writeFile(wb, `殡仪馆运营日报_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
