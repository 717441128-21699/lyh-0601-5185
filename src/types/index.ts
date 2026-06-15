export type HallStatus = 'available' | 'in_use' | 'reserved' | 'maintenance';
export type FurnaceStatus = 'running' | 'idle' | 'maintenance' | 'warning' | 'error';
export type SlotStatus = 'occupied' | 'available' | 'expiring' | 'expired' | 'locked';
export type StaffRole = '司仪' | '乐队' | '灵车司机';
export type ScheduleStatus = 'pending' | 'confirmed' | 'completed' | 'escalated';
export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed';
export type AllocationStatus = 'success' | 'conflict' | 'no_available';

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
  needsEmcee?: boolean;
  needsBand?: boolean;
  needsVehicle?: boolean;
}

export interface AllocationResult {
  status: AllocationStatus;
  assignedHallId?: string;
  assignedHallName?: string;
  conflicts: Array<{
    appointmentId: string;
    familyName: string;
    oldHallId: string;
    oldHallName: string;
    newHallId?: string;
    newHallName?: string;
    adjusted: boolean;
  }>;
  message: string;
}

export interface MaintenanceWorkOrder {
  id: string;
  furnaceId: string;
  furnaceName: string;
  type: 'routine' | 'temperature' | 'repair';
  description: string;
  status: WorkOrderStatus;
  createdAt: Date;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
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
  workOrders: MaintenanceWorkOrder[];
  maintenanceWorkOrderGenerated?: boolean;
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
  confirmDeadline: Date;
  appointmentId?: string;
}

export interface DailyStats {
  date: string;
  cremationCount: number;
  hallUsage: number;
  hallTotal: number;
  avgSatisfaction: number;
  serviceCount: number;
}

export interface NewAppointmentRequest {
  familyName: string;
  startTime: Date;
  durationMinutes: number;
  spec: '标准' | '豪华' | 'VIP';
  priority: number;
  attendees: number;
  needsEmcee: boolean;
  needsBand: boolean;
  needsVehicle: boolean;
}

export interface UpdateAppointmentRequest {
  appointmentId: string;
  startTime?: Date;
  durationMinutes?: number;
  spec?: '标准' | '豪华' | 'VIP';
  priority?: number;
  attendees?: number;
  skipSchedules?: boolean;
}

export interface ResourceOption {
  id: string;
  name: string;
  conflictReason?: string;
}

export interface ScheduleConflict {
  scheduleId: string;
  type: string;
  currentStaffId?: string;
  currentStaffName?: string;
  currentVehicleId?: string;
  currentVehiclePlate?: string;
  availableStaffOptions?: ResourceOption[];
  availableVehicleOptions?: ResourceOption[];
}

export interface AllocationResult {
  status: AllocationStatus;
  assignedHallId?: string;
  assignedHallName?: string;
  conflicts: Array<{
    appointmentId: string;
    familyName: string;
    oldHallId: string;
    oldHallName: string;
    newHallId?: string;
    newHallName?: string;
    adjusted: boolean;
  }>;
  scheduleConflicts?: ScheduleConflict[];
  message: string;
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  time: Date;
  resolved: boolean;
  source?: string;
  relatedId?: string;
  navigateTo?: {
    page: 'overview' | 'farewell' | 'cremation' | 'services' | 'columbarium';
    highlightId?: string;
    highlightDate?: string;
  };
}
