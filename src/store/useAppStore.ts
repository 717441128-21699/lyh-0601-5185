import { create } from 'zustand';
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
  NewAppointmentRequest,
  AllocationResult,
  MaintenanceWorkOrder,
  StaffRole,
} from '../types';
import {
  mockHalls,
  mockAppointments,
  mockFurnaces,
  mockSlots,
  mockStaff,
  mockVehicles,
  mockSchedules,
  mockDailyStats,
  mockAlerts,
} from '../utils/mockData';

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function timesOverlap(
  s1: Date, e1: Date,
  s2: Date, e2: Date,
): boolean {
  return s1 < e2 && s2 < e1;
}

function findConflictingAppointments(
  appointments: Appointment[],
  hallId: string,
  startTime: Date,
  endTime: Date,
  excludeId?: string,
): Appointment[] {
  return appointments.filter(
    (a) =>
      a.hallId === hallId &&
      a.id !== excludeId &&
      a.status !== 'completed' &&
      timesOverlap(a.startTime, a.endTime, startTime, endTime),
  );
}

function findAvailableHall(
  halls: FarewellHall[],
  appointments: Appointment[],
  spec: '标准' | '豪华' | 'VIP',
  startTime: Date,
  endTime: Date,
  excludeHallId?: string,
): FarewellHall | null {
  const matchingHalls = halls
    .filter((h) => h.spec === spec && h.status !== 'maintenance' && h.id !== excludeHallId)
    .sort((a, b) => {
      const aInUse = a.status === 'in_use' ? 1 : 0;
      const bInUse = b.status === 'in_use' ? 1 : 0;
      return aInUse - bInUse;
    });

  for (const hall of matchingHalls) {
    const conflicts = findConflictingAppointments(appointments, hall.id, startTime, endTime);
    if (conflicts.length === 0) {
      return hall;
    }
  }
  return null;
}

function findAvailableStaff(
  staff: ServiceStaff[],
  schedules: ServiceSchedule[],
  role: StaffRole,
  startTime: Date,
  endTime: Date,
): ServiceStaff | null {
  const matching = staff.filter((s) => s.role === role && s.status !== '休息');
  for (const s of matching) {
    const hasConflict = schedules.some(
      (sch) =>
        sch.staffId === s.id &&
        sch.status !== 'completed' &&
        timesOverlap(sch.startTime, sch.endTime, startTime, endTime),
    );
    if (!hasConflict) return s;
  }
  return null;
}

function findAvailableVehicle(
  vehicles: Vehicle[],
  schedules: ServiceSchedule[],
  startTime: Date,
  endTime: Date,
): Vehicle | null {
  for (const v of vehicles) {
    if (v.status === '维护中') continue;
    const hasConflict = schedules.some(
      (sch) =>
        sch.vehicleId === v.id &&
        sch.status !== 'completed' &&
        timesOverlap(sch.startTime, sch.endTime, startTime, endTime),
    );
    if (!hasConflict) return v;
  }
  return null;
}

interface AppState {
  halls: FarewellHall[];
  appointments: Appointment[];
  furnaces: CremationFurnace[];
  slots: ColumbariumSlot[];
  staff: ServiceStaff[];
  vehicles: Vehicle[];
  schedules: ServiceSchedule[];
  dailyStats: DailyStats[];
  alerts: AlertItem[];
  currentTime: Date;
  lastAllocationResult: AllocationResult | null;
  updateProgress: () => void;
  updateTemperatures: () => void;
  confirmSchedule: (id: string) => void;
  resolveAlert: (id: string) => void;
  unlockSlot: (id: string) => void;
  createAppointment: (req: NewAppointmentRequest) => AllocationResult;
  updateWorkOrderStatus: (furnaceId: string, workOrderId: string, status: 'pending' | 'in_progress' | 'completed') => void;
  escalateOverdueSchedules: () => void;
  clearAllocationResult: () => void;
  getHallUsageRate: () => number;
  getFurnaceUsageRate: () => number;
  getSlotUsageRate: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  halls: mockHalls,
  appointments: mockAppointments,
  furnaces: mockFurnaces,
  slots: mockSlots,
  staff: mockStaff,
  vehicles: mockVehicles,
  schedules: mockSchedules,
  dailyStats: mockDailyStats,
  alerts: mockAlerts,
  currentTime: new Date(),
  lastAllocationResult: null,

  getHallUsageRate: () => {
    const state = get();
    const active = state.appointments.filter(
      (a) => a.status === 'in_progress' || a.status === 'scheduled',
    ).length;
    return state.halls.length > 0 ? (active / state.halls.length) * 100 : 0;
  },

  getFurnaceUsageRate: () => {
    const state = get();
    const active = state.furnaces.filter(
      (f) => f.status === 'running' || f.status === 'warning',
    ).length;
    return state.furnaces.length > 0 ? (active / state.furnaces.length) * 100 : 0;
  },

  getSlotUsageRate: () => {
    const state = get();
    const occupied = state.slots.filter(
      (s) => s.status === 'occupied' || s.status === 'expiring' || s.status === 'expired' || s.status === 'locked',
    ).length;
    return state.slots.length > 0 ? (occupied / state.slots.length) * 100 : 0;
  },

  clearAllocationResult: () => set({ lastAllocationResult: null }),

  updateProgress: () =>
    set((state) => {
      const now = new Date();
      return {
        currentTime: now,
        appointments: state.appointments.map((a) => {
          if (a.status !== 'in_progress') return a;
          const total = a.endTime.getTime() - a.startTime.getTime();
          const elapsed = now.getTime() - a.startTime.getTime();
          const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
          const newStatus = progress >= 100 ? 'completed' : a.status;
          return { ...a, progress, status: newStatus };
        }),
        vehicles: state.vehicles.map((v) => {
          if (v.status !== '出车中') return v;
          const t = (now.getTime() % 10000) / 10000;
          return {
            ...v,
            position: [
              v.position[0] + Math.sin(t * Math.PI * 2) * 0.1,
              v.position[1],
              v.position[2] + Math.cos(t * Math.PI * 2) * 0.1,
            ],
          };
        }),
      };
    }),

  updateTemperatures: () =>
    set((state) => {
      const newAlerts: AlertItem[] = [];
      const newFurnaces = state.furnaces.map((f) => {
        if (f.status !== 'running' && f.status !== 'warning') return f;
        const delta = (Math.random() - 0.5) * 20;
        const newTemp = Math.max(700, Math.min(1000, f.temperature + delta));
        let newStatus = f.status;
        const tempNormal = newTemp >= 750 && newTemp <= 950;
        if (!tempNormal && f.status !== 'warning') {
          newStatus = 'warning';
          newAlerts.push({
            id: generateId('alert'),
            type: 'error',
            message: `${f.name} 温度异常！当前温度 ${Math.round(newTemp)}℃，已超出正常范围(750-950℃)`,
            time: new Date(),
            resolved: false,
            source: 'cremation',
            relatedId: f.id,
          });
        } else if (tempNormal && f.status === 'warning') {
          newStatus = 'running';
        }

        const maintenanceProgress = f.usageCount / f.maintenanceThreshold;
        let updatedF = { ...f, temperature: Math.round(newTemp), status: newStatus };

        if (maintenanceProgress >= 0.95 && !f.maintenanceWorkOrderGenerated) {
          const workOrder: MaintenanceWorkOrder = {
            id: generateId('wo'),
            furnaceId: f.id,
            furnaceName: f.name,
            type: 'routine',
            description: `累计使用 ${f.usageCount} 次，已达到保养阈值 ${f.maintenanceThreshold} 次的 95%，请尽快安排维护`,
            status: 'pending',
            createdAt: new Date(),
            priority: maintenanceProgress >= 1 ? 'high' : 'medium',
            assignedTo: '运维组',
          };
          updatedF = {
            ...updatedF,
            workOrders: [...f.workOrders, workOrder],
            maintenanceWorkOrderGenerated: true,
          };
          newAlerts.push({
            id: generateId('alert'),
            type: 'warning',
            message: `${f.name} 累计使用 ${f.usageCount} 次，接近保养阈值，已生成维护工单 ${workOrder.id}`,
            time: new Date(),
            resolved: false,
            source: 'cremation',
            relatedId: f.id,
          });
        }

        return updatedF;
      });

      return {
        furnaces: newFurnaces,
        alerts: newAlerts.length > 0 ? [...state.alerts, ...newAlerts] : state.alerts,
      };
    }),

  createAppointment: (req: NewAppointmentRequest) => {
    const state = get();
    const endTime = new Date(req.startTime.getTime() + req.durationMinutes * 60000);
    const conflicts: AllocationResult['conflicts'] = [];
    let adjustedAppointments: Appointment[] = [...state.appointments];

    let targetHall = findAvailableHall(state.halls, adjustedAppointments, req.spec, req.startTime, endTime);

    if (!targetHall) {
      const sameSpecHalls = state.halls.filter((h) => h.spec === req.spec && h.status !== 'maintenance');
      let bestHall: FarewellHall | null = null;
      let bestAdjustments: Appointment[] = [];

      for (const hall of sameSpecHalls) {
        const hallConflicts = findConflictingAppointments(
          adjustedAppointments,
          hall.id,
          req.startTime,
          endTime,
        );

        const lowerPriorityConflicts = hallConflicts.filter((c) => c.priority > req.priority);
        const allAdjustable = lowerPriorityConflicts.length === hallConflicts.length;

        if (allAdjustable && lowerPriorityConflicts.length > 0) {
          const tempAdjusted = [...adjustedAppointments];
          let canAdjustAll = true;
          const adjustments: AllocationResult['conflicts'] = [];

          for (const conflict of lowerPriorityConflicts) {
            const newHall = findAvailableHall(
              state.halls,
              tempAdjusted.filter((a) => a.id !== conflict.id),
              conflict.hallId.startsWith('hall') ? req.spec : (state.halls.find(h => h.id === conflict.hallId)?.spec || '标准'),
              conflict.startTime,
              conflict.endTime,
              conflict.hallId,
            );

            if (newHall) {
              const idx = tempAdjusted.findIndex((a) => a.id === conflict.id);
              if (idx !== -1) {
                tempAdjusted[idx] = { ...tempAdjusted[idx], hallId: newHall.id };
              }
              adjustments.push({
                appointmentId: conflict.id,
                familyName: conflict.familyName,
                oldHallId: conflict.hallId,
                oldHallName: state.halls.find((h) => h.id === conflict.hallId)?.name || '未知',
                newHallId: newHall.id,
                newHallName: newHall.name,
                adjusted: true,
              });
            } else {
              canAdjustAll = false;
              break;
            }
          }

          if (canAdjustAll) {
            bestHall = hall;
            bestAdjustments = tempAdjusted;
            conflicts.push(...adjustments);
            break;
          }
        }
      }

      if (!bestHall) {
        const result: AllocationResult = {
          status: 'no_available',
          conflicts: [],
          message: `无法找到${req.spec}规格的可用告别厅，请调整时间或规格`,
        };
        set({ lastAllocationResult: result });
        return result;
      }

      targetHall = bestHall;
      adjustedAppointments = bestAdjustments;
    }

    const newAppointment: Appointment = {
      id: generateId('apt'),
      hallId: targetHall.id,
      familyName: req.familyName,
      startTime: req.startTime,
      endTime,
      progress: 0,
      priority: req.priority,
      status: 'scheduled',
      attendees: req.attendees,
      needsEmcee: req.needsEmcee,
      needsBand: req.needsBand,
      needsVehicle: req.needsVehicle,
    };

    const newSchedules: ServiceSchedule[] = [...state.schedules];
    const scheduleAlerts: AlertItem[] = [];

    if (req.needsEmcee) {
      const emcee = findAvailableStaff(state.staff, newSchedules, '司仪', req.startTime, endTime);
      if (emcee) {
        const sch: ServiceSchedule = {
          id: generateId('sch'),
          staffId: emcee.id,
          type: '司仪',
          startTime: req.startTime,
          endTime,
          status: 'pending',
          confirmed: false,
          familyName: req.familyName,
          escalated: false,
          confirmDeadline: new Date(req.startTime.getTime() - 30 * 60000),
          appointmentId: newAppointment.id,
        };
        newSchedules.push(sch);
      } else {
        scheduleAlerts.push({
          id: generateId('alert'),
          type: 'warning',
          message: `${req.familyName} 预约司仪，但当前时段无可用司仪资源`,
          time: new Date(),
          resolved: false,
          source: 'services',
          relatedId: newAppointment.id,
        });
      }
    }

    if (req.needsBand) {
      const band = findAvailableStaff(state.staff, newSchedules, '乐队', req.startTime, endTime);
      if (band) {
        const sch: ServiceSchedule = {
          id: generateId('sch'),
          staffId: band.id,
          type: '乐队',
          startTime: req.startTime,
          endTime,
          status: 'pending',
          confirmed: false,
          familyName: req.familyName,
          escalated: false,
          confirmDeadline: new Date(req.startTime.getTime() - 30 * 60000),
          appointmentId: newAppointment.id,
        };
        newSchedules.push(sch);
      } else {
        scheduleAlerts.push({
          id: generateId('alert'),
          type: 'warning',
          message: `${req.familyName} 预约乐队，但当前时段无可用乐队资源`,
          time: new Date(),
          resolved: false,
          source: 'services',
          relatedId: newAppointment.id,
        });
      }
    }

    if (req.needsVehicle) {
      const vehicle = findAvailableVehicle(state.vehicles, newSchedules, req.startTime, endTime);
      if (vehicle) {
        const sch: ServiceSchedule = {
          id: generateId('sch'),
          vehicleId: vehicle.id,
          type: '车辆调度',
          startTime: new Date(req.startTime.getTime() - 30 * 60000),
          endTime: new Date(endTime.getTime() + 30 * 60000),
          status: 'pending',
          confirmed: false,
          familyName: req.familyName,
          escalated: false,
          confirmDeadline: new Date(req.startTime.getTime() - 60 * 60000),
          appointmentId: newAppointment.id,
        };
        newSchedules.push(sch);
      } else {
        scheduleAlerts.push({
          id: generateId('alert'),
          type: 'warning',
          message: `${req.familyName} 预约灵车，但当前时段无可用车辆`,
          time: new Date(),
          resolved: false,
          source: 'services',
          relatedId: newAppointment.id,
        });
      }
    }

    const result: AllocationResult = {
      status: conflicts.length > 0 ? 'conflict' : 'success',
      assignedHallId: targetHall.id,
      assignedHallName: targetHall.name,
      conflicts,
      message: conflicts.length > 0
        ? `已分配 ${targetHall.name}，但有 ${conflicts.length} 个预约被调整`
        : `成功分配 ${targetHall.name}`,
    };

    set((state) => ({
      appointments: [...adjustedAppointments, newAppointment],
      schedules: newSchedules,
      alerts: [...state.alerts, ...scheduleAlerts],
      lastAllocationResult: result,
    }));

    return result;
  },

  confirmSchedule: (id: string) =>
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, confirmed: true, status: 'confirmed', escalated: false } : s,
      ),
    })),

  resolveAlert: (id: string) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)),
    })),

  unlockSlot: (id: string) =>
    set((state) => ({
      slots: state.slots.map((s) =>
        s.id === id ? { ...s, locked: false, status: 'occupied' } : s,
      ),
    })),

  updateWorkOrderStatus: (furnaceId: string, workOrderId: string, status: 'pending' | 'in_progress' | 'completed') =>
    set((state) => ({
      furnaces: state.furnaces.map((f) => {
        if (f.id !== furnaceId) return f;
        const updatedOrders = f.workOrders.map((wo) =>
          wo.id === workOrderId ? { ...wo, status } : wo,
        );
        const allCompleted = updatedOrders.length > 0 && updatedOrders.every((wo) => wo.status === 'completed');
        return {
          ...f,
          workOrders: updatedOrders,
          status: status === 'completed' && allCompleted ? 'idle' : f.status,
          maintenanceWorkOrderGenerated: allCompleted ? false : f.maintenanceWorkOrderGenerated,
        };
      }),
    })),

  escalateOverdueSchedules: () =>
    set((state) => {
      const now = new Date();
      const newAlerts: AlertItem[] = [];
      const updatedSchedules = state.schedules.map((s) => {
        if (s.confirmed || s.status === 'completed' || s.escalated) return s;
        if (now > s.confirmDeadline) {
          newAlerts.push({
            id: generateId('alert'),
            type: 'warning',
            message: `排班 ${s.id.slice(-8)} ${s.familyName} ${s.type} 超时未确认，已升级主管处理`,
            time: new Date(),
            resolved: false,
            source: 'services',
            relatedId: s.id,
          });
          return { ...s, escalated: true, status: 'escalated' as const };
        }
        return s;
      });
      return {
        schedules: updatedSchedules,
        alerts: newAlerts.length > 0 ? [...state.alerts, ...newAlerts] : state.alerts,
      };
    }),
}));
