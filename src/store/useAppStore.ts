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
  updateProgress: () => void;
  updateTemperatures: () => void;
  confirmSchedule: (id: string) => void;
  resolveAlert: (id: string) => void;
  unlockSlot: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
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
          return { ...a, progress };
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
    set((state) => ({
      furnaces: state.furnaces.map((f) => {
        if (f.status !== 'running' && f.status !== 'warning') return f;
        const delta = (Math.random() - 0.5) * 20;
        const newTemp = Math.max(700, Math.min(1000, f.temperature + delta));
        let status = f.status;
        if (newTemp > 950 || newTemp < 750) status = 'warning';
        else if (f.status === 'warning') status = 'running';
        return { ...f, temperature: Math.round(newTemp), status };
      }),
    })),

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
}));
