import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Appointment, UpdateAppointmentRequest } from '../../types';
import {
  Clock,
  Crown,
  Circle,
  AlertTriangle,
  User,
  GripVertical,
  CheckCircle2,
} from 'lucide-react';

interface HallTimelineProps {
  highlightId?: string;
  onAppointmentClick?: (apt: Appointment) => void;
}

const HOUR_START = 7;
const HOUR_END = 20;
const TOTAL_HOURS = HOUR_END - HOUR_START;

export default function HallTimeline({ highlightId, onAppointmentClick }: HallTimelineProps) {
  const halls = useAppStore((s) => s.halls);
  const appointments = useAppStore((s) => s.appointments);
  const updateAppointment = useAppStore((s) => s.updateAppointment);
  const clearAllocationResult = useAppStore((s) => s.clearAllocationResult);
  const lastAllocationResult = useAppStore((s) => s.lastAllocationResult);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStartTime, setDragStartTime] = useState<Date | null>(null);

  const sortedHalls = useMemo(
    () => [...halls].sort((a, b) => a.spec.localeCompare(b.spec) || a.name.localeCompare(b.name)),
    [halls],
  );

  const filteredAppointments = useMemo(() => {
    const dateStr = selectedDate;
    return appointments.filter((a) => {
      const aptDate = a.startTime.toISOString().slice(0, 10);
      return aptDate === dateStr;
    });
  }, [appointments, selectedDate]);

  const appointmentsByHall = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const hall of halls) {
      map[hall.id] = [];
    }
    for (const apt of filteredAppointments) {
      if (map[apt.hallId]) {
        map[apt.hallId].push(apt);
      }
    }
    for (const key in map) {
      map[key].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }
    return map;
  }, [filteredAppointments, halls]);

  const conflicts = useMemo(() => {
    const conflictIds = new Set<string>();
    for (const hallId in appointmentsByHall) {
      const apts = appointmentsByHall[hallId];
      for (let i = 0; i < apts.length - 1; i++) {
        if (apts[i].endTime > apts[i + 1].startTime) {
          conflictIds.add(apts[i].id);
          conflictIds.add(apts[i + 1].id);
        }
      }
    }
    return conflictIds;
  }, [appointmentsByHall]);

  const getPosition = useCallback((time: Date) => {
    const hours = time.getHours() + time.getMinutes() / 60;
    const relative = Math.max(0, Math.min(TOTAL_HOURS, hours - HOUR_START));
    return (relative / TOTAL_HOURS) * 100;
  }, []);

  const getWidth = useCallback((start: Date, end: Date) => {
    const startPos = getPosition(start);
    const endPos = getPosition(end);
    return Math.max(2, endPos - startPos);
  }, [getPosition]);

  const hours = useMemo(() => {
    const arr = [];
    for (let h = HOUR_START; h <= HOUR_END; h++) {
      arr.push(h);
    }
    return arr;
  }, []);

  const handleDragStart = (e: React.MouseEvent, apt: Appointment) => {
    e.preventDefault();
    setDraggingId(apt.id);
    setDragStartTime(apt.startTime);
  };

  const handleDragEnd = (e: React.MouseEvent, apt: Appointment, hallId: string) => {
    if (!draggingId || draggingId !== apt.id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const hour = HOUR_START + percentage * TOTAL_HOURS;
    const hoursInt = Math.floor(hour);
    const minutes = Math.round((hour - hoursInt) * 60 / 15) * 15;

    const newStartTime = new Date(apt.startTime);
    newStartTime.setHours(hoursInt, minutes, 0, 0);
    const duration = apt.endTime.getTime() - apt.startTime.getTime();
    const newEndTime = new Date(newStartTime.getTime() + duration);

    const req: UpdateAppointmentRequest = {
      appointmentId: apt.id,
      startTime: newStartTime,
    };

    updateAppointment(req);
    setDraggingId(null);
    setDragStartTime(null);

    setTimeout(() => clearAllocationResult(), 5000);
  };

  const getStatusColor = (apt: Appointment, isConflict: boolean) => {
    if (isConflict) return 'bg-red-500/80 border-red-400';
    switch (apt.status) {
      case 'in_progress':
        return 'bg-green-500/80 border-green-400';
      case 'scheduled':
        return 'bg-amber-500/80 border-amber-400';
      case 'completed':
        return 'bg-slate-500/60 border-slate-400';
      default:
        return 'bg-slate-500/80 border-slate-400';
    }
  };

  const getSpecIcon = (spec: string) => {
    if (spec === 'VIP') return <Crown className="w-3 h-3" />;
    if (spec === '豪华') return <Crown className="w-3 h-3 text-amber-300" />;
    return <Circle className="w-3 h-3" />;
  };

  const adjustedIds = useMemo(() => {
    const ids = new Set<string>();
    if (lastAllocationResult) {
      for (const c of lastAllocationResult.conflicts) {
        if (c.adjusted) ids.add(c.appointmentId);
      }
    }
    return ids;
  }, [lastAllocationResult]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            告别厅日程时间轴
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500/60"></span> 进行中
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-500/60"></span> 已预约
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500/60"></span> 冲突
            </span>
            <span className="flex items-center gap-1">
              <GripVertical className="w-3 h-3" /> 可拖动
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().slice(0, 10));
            }}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
          >
            前一天
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().slice(0, 10));
            }}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
          >
            后一天
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="flex border-b border-slate-600 mb-1">
            <div className="w-32 flex-shrink-0 pr-3 py-2 text-sm text-slate-400 font-medium border-r border-slate-600">
              厅室 / 时间
            </div>
            {hours.map((h) => (
              <div
                key={h}
                className="flex-1 py-2 text-center text-xs text-slate-400 border-l border-slate-700"
              >
                {h.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {sortedHalls.map((hall) => {
            const hallSpec = hall.spec === 'VIP' ? 'text-amber-400' : hall.spec === '豪华' ? 'text-purple-400' : 'text-slate-300';
            const hallApts = appointmentsByHall[hall.id] || [];

            return (
              <div key={hall.id} className="flex border-b border-slate-700/50 min-h-[56px]">
                <div className="w-32 flex-shrink-0 pr-3 py-2 border-r border-slate-600">
                  <div className={`text-sm font-medium ${hallSpec} flex items-center gap-1`}>
                    {getSpecIcon(hall.spec)}
                    {hall.name}
                  </div>
                  <div className="text-xs text-slate-500">{hall.spec} · {hall.capacity}人</div>
                </div>

                <div
                  className="flex-1 relative py-1"
                  onMouseUp={(e) => {
                    if (draggingId) {
                      const apt = filteredAppointments.find((a) => a.id === draggingId);
                      if (apt) {
                        handleDragEnd(e, apt, hall.id);
                      }
                    }
                  }}
                >
                  <div className="absolute inset-0 flex pointer-events-none">
                    {hours.map((h, idx) => (
                      <div key={h} className="flex-1 border-l border-slate-700/30" />
                    ))}
                  </div>

                  {hallApts.map((apt) => {
                    const isConflict = conflicts.has(apt.id);
                    const isHighlighted = highlightId === apt.id || adjustedIds.has(apt.id);
                    const left = getPosition(apt.startTime);
                    const width = getWidth(apt.startTime, apt.endTime);
                    const spec = halls.find(h => h.id === apt.hallId)?.spec || '标准';

                    return (
                      <div
                        key={apt.id}
                        className={`absolute top-1 bottom-1 rounded-lg border-2 cursor-grab active:cursor-grabbing flex flex-col justify-center px-2 overflow-hidden transition-all duration-300 ${
                          getStatusColor(apt, isConflict)
                        } ${isHighlighted ? 'ring-2 ring-white/50 ring-offset-1 ring-offset-slate-900 z-10' : ''} ${
                          draggingId === apt.id ? 'opacity-50 z-20' : ''
                        }`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        onMouseDown={(e) => handleDragStart(e, apt)}
                        onClick={() => onAppointmentClick?.(apt)}
                      >
                        <div className="flex items-center gap-1 text-white text-xs font-medium truncate">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{apt.familyName}</span>
                          {isConflict && <AlertTriangle className="w-3 h-3 flex-shrink-0 text-white" />}
                          {adjustedIds.has(apt.id) && <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-white" />}
                        </div>
                        <div className="text-[10px] text-white/80 flex items-center gap-1">
                          {getSpecIcon(spec)}
                          <span>
                            {apt.startTime.toTimeString().slice(0, 5)} - {apt.endTime.toTimeString().slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {conflicts.size > 0 && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
          <div className="flex items-center gap-2 text-red-300 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>检测到 {conflicts.size} 个时间冲突的预约，请调整时间或优先级</span>
          </div>
        </div>
      )}
    </div>
  );
}
