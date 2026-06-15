import type {
  FarewellHall,
  Appointment,
  CremationFurnace,
  ColumbariumSlot,
  ServiceStaff,
  Vehicle,
  ServiceSchedule,
  DailyStats,
  AlertItem,
} from '../types';

const now = new Date();

export const mockHalls: FarewellHall[] = [
  {
    id: 'hall-1',
    name: '告别厅一号',
    spec: '标准',
    status: 'in_use',
    capacity: 80,
    position: [-8, 0, 0],
  },
  {
    id: 'hall-2',
    name: '告别厅二号',
    spec: '豪华',
    status: 'in_use',
    capacity: 120,
    position: [-3, 0, 0],
  },
  {
    id: 'hall-3',
    name: '告别厅三号',
    spec: 'VIP',
    status: 'reserved',
    capacity: 50,
    position: [2, 0, 0],
  },
  {
    id: 'hall-4',
    name: '告别厅四号',
    spec: '标准',
    status: 'available',
    capacity: 80,
    position: [7, 0, 0],
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    hallId: 'hall-1',
    familyName: '张氏家属',
    startTime: new Date(now.getTime() - 30 * 60000),
    endTime: new Date(now.getTime() + 30 * 60000),
    progress: 50,
    priority: 1,
    status: 'in_progress',
    attendees: 45,
  },
  {
    id: 'apt-2',
    hallId: 'hall-2',
    familyName: '李氏家属',
    startTime: new Date(now.getTime() - 15 * 60000),
    endTime: new Date(now.getTime() + 45 * 60000),
    progress: 25,
    priority: 2,
    status: 'in_progress',
    attendees: 78,
  },
  {
    id: 'apt-3',
    hallId: 'hall-3',
    familyName: '王氏家属',
    startTime: new Date(now.getTime() + 60 * 60000),
    endTime: new Date(now.getTime() + 120 * 60000),
    progress: 0,
    priority: 1,
    status: 'scheduled',
    attendees: 32,
  },
];

export const mockFurnaces: CremationFurnace[] = [
  {
    id: 'furnace-1',
    name: '一号火化炉',
    temperature: 850,
    usageCount: 487,
    lastMaintenance: new Date(now.getTime() - 20 * 24 * 3600000),
    maintenanceThreshold: 500,
    status: 'running',
    currentFamily: '张氏家属',
    position: [-6, 0, 6],
  },
  {
    id: 'furnace-2',
    name: '二号火化炉',
    temperature: 920,
    usageCount: 495,
    lastMaintenance: new Date(now.getTime() - 25 * 24 * 3600000),
    maintenanceThreshold: 500,
    status: 'warning',
    currentFamily: '李氏家属',
    position: [-2, 0, 6],
  },
  {
    id: 'furnace-3',
    name: '三号火化炉',
    temperature: 0,
    usageCount: 312,
    lastMaintenance: new Date(now.getTime() - 5 * 24 * 3600000),
    maintenanceThreshold: 500,
    status: 'idle',
    position: [2, 0, 6],
  },
  {
    id: 'furnace-4',
    name: '四号火化炉',
    temperature: 0,
    usageCount: 498,
    lastMaintenance: new Date(now.getTime() - 30 * 24 * 3600000),
    maintenanceThreshold: 500,
    status: 'maintenance',
    position: [6, 0, 6],
  },
];

function generateSlots(): ColumbariumSlot[] {
  const slots: ColumbariumSlot[] = [];
  const rows = 5;
  const cols = 8;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const isOccupied = Math.random() > 0.3;
      let status: ColumbariumSlot['status'] = 'available';
      let leaseEndDate: Date | null = null;
      let lesseeName: string | null = null;
      let locked = false;

      if (isOccupied) {
        const daysAhead = Math.floor(Math.random() * 90) - 10;
        leaseEndDate = new Date(now.getTime() + daysAhead * 24 * 3600000);
        lesseeName = ['陈氏', '赵氏', '刘氏', '周氏', '吴氏'][idx % 5] + '家属';
        if (daysAhead < 0) {
          status = 'expired';
          locked = true;
        } else if (daysAhead <= 30) {
          status = 'expiring';
        } else {
          status = 'occupied';
        }
      }

      slots.push({
        id: `slot-${r}-${c}`,
        location: `${r + 1}排${c + 1}号`,
        status,
        leaseEndDate,
        lesseeName,
        locked,
        position: [(c - cols / 2) * 0.8, r * 0.8, 0],
      });
    }
  }
  return slots;
}

export const mockSlots: ColumbariumSlot[] = generateSlots();

export const mockStaff: ServiceStaff[] = [
  { id: 'staff-1', name: '张司仪', role: '司仪', status: '服务中', phone: '138****1001' },
  { id: 'staff-2', name: '李司仪', role: '司仪', status: '空闲', phone: '138****1002' },
  { id: 'staff-3', name: '王乐队', role: '乐队', status: '服务中', phone: '138****1003' },
  { id: 'staff-4', name: '赵乐队', role: '乐队', status: '空闲', phone: '138****1004' },
  { id: 'staff-5', name: '陈司机', role: '灵车司机', status: '出车中', phone: '138****1005' },
  { id: 'staff-6', name: '刘司机', role: '灵车司机', status: '空闲', phone: '138****1006' },
];

export const mockVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    plateNumber: '京A·88888',
    type: '灵车',
    status: '出车中',
    position: [10, 0.5, -2],
    currentTask: '接运赵氏家属',
  },
  {
    id: 'veh-2',
    plateNumber: '京A·66666',
    type: '灵车',
    status: '空闲',
    position: [10, 0.5, 2],
  },
  {
    id: 'veh-3',
    plateNumber: '京A·99999',
    type: '商务车',
    status: '维护中',
    position: [10, 0.5, 6],
  },
];

export const mockSchedules: ServiceSchedule[] = [
  {
    id: 'sch-1',
    staffId: 'staff-1',
    type: '司仪',
    startTime: new Date(now.getTime() - 30 * 60000),
    endTime: new Date(now.getTime() + 30 * 60000),
    status: 'confirmed',
    confirmed: true,
    familyName: '张氏家属',
  },
  {
    id: 'sch-2',
    staffId: 'staff-3',
    type: '乐队',
    startTime: new Date(now.getTime() - 15 * 60000),
    endTime: new Date(now.getTime() + 45 * 60000),
    status: 'confirmed',
    confirmed: true,
    familyName: '李氏家属',
  },
  {
    id: 'sch-3',
    vehicleId: 'veh-1',
    type: '车辆调度',
    startTime: new Date(now.getTime() + 60 * 60000),
    endTime: new Date(now.getTime() + 120 * 60000),
    status: 'pending',
    confirmed: false,
    familyName: '王氏家属',
    escalated: false,
  },
  {
    id: 'sch-4',
    staffId: 'staff-2',
    type: '司仪',
    startTime: new Date(now.getTime() + 90 * 60000),
    endTime: new Date(now.getTime() + 150 * 60000),
    status: 'pending',
    confirmed: false,
    familyName: '赵氏家属',
    escalated: true,
  },
];

export const mockDailyStats: DailyStats[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(now.getTime() - (6 - i) * 24 * 3600000);
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    cremationCount: Math.floor(Math.random() * 10) + 15,
    hallUsage: Math.floor(Math.random() * 4) + 2,
    hallTotal: 4,
    avgSatisfaction: Math.floor(Math.random() * 20) + 80,
    serviceCount: Math.floor(Math.random() * 15) + 20,
  };
});

export const mockAlerts: AlertItem[] = [
  {
    id: 'alert-1',
    type: 'warning',
    message: '二号火化炉累计使用495次，接近保养阈值500次',
    time: new Date(now.getTime() - 10 * 60000),
    resolved: false,
  },
  {
    id: 'alert-2',
    type: 'warning',
    message: '司仪排班 sch-4 超时未确认，已升级主管',
    time: new Date(now.getTime() - 5 * 60000),
    resolved: false,
  },
  {
    id: 'alert-3',
    type: 'info',
    message: '格口 3排5号 租赁将在15天后到期',
    time: new Date(now.getTime() - 30 * 60000),
    resolved: false,
  },
  {
    id: 'alert-4',
    type: 'error',
    message: '格口 1排2号 已超期10天，自动上锁',
    time: new Date(now.getTime() - 60 * 60000),
    resolved: false,
  },
];
