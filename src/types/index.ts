export type HallStatus = 'available' | 'in_use' | 'reserved' | 'maintenance';
export type FurnaceStatus = 'running' | 'idle' | 'maintenance' | 'warning' | 'error';
export type SlotStatus = 'occupied' | 'available' | 'expiring' | 'expired' | 'locked';
export type StaffRole = '司仪' | '乐队' | '灵车司机';
export type ScheduleStatus = 'pending' | 'confirmed' | 'completed' | 'escalated';

export interface FarewellHall {
  id: string;
  name: string;
  spec: '标准' | '豪华' | 'VIP';
  status: HallStatus;
  capacity: number;
  currentAppointment?: Appointment;
  position: [number, number, number];
}

export interface Appointment {
  id: string;
  hallId: string;
  familyName: string;
  startTime: Date;
  endTime: Date;
  progress: number;
  priority: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  attendees: number;
}

export interface CremationFurnace {
  id: string;
  name: string;
  temperature: number;
  usageCount: number;
  lastMaintenance: Date;
  maintenanceThreshold: number;
  status: FurnaceStatus;
  currentFamily?: string;
  position: [number, number, number];
}

export interface ColumbariumSlot {
  id: string;
  location: string;
  status: SlotStatus;
  leaseEndDate: Date | null;
  lesseeName: string | null;
  locked: boolean;
  position: [number, number, number];
}

export interface ServiceStaff {
  id: string;
  name: string;
  role: StaffRole;
  status: '空闲' | '服务中' | '出车中' | '休息';
  phone: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: '灵车' | '商务车';
  status: '空闲' | '出车中' | '维护中';
  position: [number, number, number];
  currentTask?: string;
}

export interface ServiceSchedule {
  id: string;
  staffId?: string;
  vehicleId?: string;
  type: StaffRole | '车辆调度';
  startTime: Date;
  endTime: Date;
  status: ScheduleStatus;
  confirmed: boolean;
  familyName: string;
  escalated?: boolean;
}

export interface DailyStats {
  date: string;
  cremationCount: number;
  hallUsage: number;
  hallTotal: number;
  avgSatisfaction: number;
  serviceCount: number;
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  time: Date;
  resolved: boolean;
}
