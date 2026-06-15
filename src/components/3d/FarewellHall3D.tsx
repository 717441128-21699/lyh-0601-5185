import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type * as THREE from 'three';
import type { FarewellHall as HallType } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Users, Clock, Calendar, Crown, Circle } from 'lucide-react';

interface Props {
  hall: HallType;
  selected: boolean;
  onSelect: (id: string) => void;
}

export default function FarewellHall3D({ hall, selected, onSelect }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const appointments = useAppStore((s) => s.appointments);
  const currentApt = appointments.find(
    (a) => a.hallId === hall.id && (a.status === 'in_progress' || a.status === 'scheduled'),
  );

  const colorMap: Record<HallType['status'], string> = {
    available: '#22c55e',
    in_use: '#3b82f6',
    reserved: '#f59e0b',
    maintenance: '#6b7280',
  };

  const remainingMinutes = useMemo(() => {
    if (!currentApt || currentApt.status !== 'in_progress') return null;
    return Math.max(0, Math.round((currentApt.endTime.getTime() - Date.now()) / 60000));
  }, [currentApt]);

  const SpecIcon = hall.spec === 'VIP' ? Crown : hall.spec === '豪华' ? Crown : Circle;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = selected ? 1.05 : hover ? 1.02 : 1;
    meshRef.current.scale.lerp({ x: target, y: target, z: target } as any, delta * 5);
  });

  return (
    <group position={hall.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onClick={() => onSelect(hall.id)}
        castShadow
      >
        <boxGeometry args={[3.5, 2.5, 3]} />
        <meshStandardMaterial
          color={colorMap[hall.status]}
          transparent
          opacity={0.7}
          emissive={selected || currentApt?.status === 'in_progress' ? colorMap[hall.status] : '#000'}
          emissiveIntensity={selected ? 0.4 : currentApt?.status === 'in_progress' ? 0.2 : 0}
        />
      </mesh>
      <mesh position={[0, 1.26, 0]}>
        <boxGeometry args={[3.6, 0.02, 3.1]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
      </mesh>

      {currentApt?.status === 'in_progress' && (
        <>
          <mesh position={[0, 2.8, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#22c55e">
              <color attach="color" args={['#22c55e']} />
            </meshBasicMaterial>
          </mesh>
          <Html position={[0, 3.2, 0]} center distanceFactor={6}>
            <div className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg animate-pulse">
              仪式进行中
            </div>
          </Html>
        </>
      )}

      {currentApt?.status === 'scheduled' && (
        <Html position={[0, 3.2, 0]} center distanceFactor={6}>
          <div className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
            已预约
          </div>
        </Html>
      )}

      <Html position={[0, -0.8, 1.6]} center distanceFactor={7}>
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-600 rounded-xl px-4 py-3 text-white text-xs shadow-2xl min-w-[220px]">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700">
            <div
              className="font-bold text-amber-400 text-sm flex items-center gap-1.5"
              style={{ fontFamily: 'Noto Serif SC, serif' }}
            >
              {hall.name}
              <span className="flex items-center gap-0.5 text-xs text-slate-400 font-normal">
                <SpecIcon className="w-3 h-3" />
                {hall.spec}
              </span>
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                hall.status === 'in_use'
                  ? 'bg-green-500 animate-pulse'
                  : hall.status === 'reserved'
                    ? 'bg-amber-500'
                    : hall.status === 'available'
                      ? 'bg-green-500'
                      : 'bg-slate-500'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 text-slate-300 mb-2">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>容纳 {hall.capacity} 人</span>
          </div>

          {currentApt && (
            <div className="bg-slate-800/80 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  当前家属
                </span>
                <span className="text-blue-300 font-medium">{currentApt.familyName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  出席人数
                </span>
                <span className="text-slate-200">{currentApt.attendees} 人</span>
              </div>

              {currentApt.status === 'in_progress' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        仪式进度
                      </span>
                      <span className="text-amber-400 font-bold text-sm">
                        {currentApt.progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-amber-500 to-amber-400 transition-all duration-500 rounded-full"
                        style={{ width: `${currentApt.progress}%` }}
                      />
                    </div>
                  </div>

                  {remainingMinutes !== null && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-700">
                      <span className="text-slate-400 flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        剩余时长
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          remainingMinutes <= 10 ? 'text-red-400 animate-pulse' : remainingMinutes <= 30 ? 'text-orange-400' : 'text-green-400'
                        }`}
                      >
                        {remainingMinutes} 分钟
                      </span>
                    </div>
                  )}
                </>
              )}

              {currentApt.status === 'scheduled' && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-700">
                  <span className="text-slate-400 flex items-center gap-1 text-xs">
                    <Calendar className="w-3 h-3" />
                    预约时间
                  </span>
                  <span className="text-amber-300 text-sm">
                    {currentApt.startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {(currentApt.needsEmcee || currentApt.needsBand || currentApt.needsVehicle) && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-700 flex-wrap">
                  <span className="text-slate-500 text-xs">服务：</span>
                  {currentApt.needsEmcee && (
                    <span className="bg-blue-900/50 text-blue-300 text-xs px-1.5 py-0.5 rounded">司仪</span>
                  )}
                  {currentApt.needsBand && (
                    <span className="bg-purple-900/50 text-purple-300 text-xs px-1.5 py-0.5 rounded">乐队</span>
                  )}
                  {currentApt.needsVehicle && (
                    <span className="bg-emerald-900/50 text-emerald-300 text-xs px-1.5 py-0.5 rounded">灵车</span>
                  )}
                </div>
              )}
            </div>
          )}

          {!currentApt && (
            <div className="text-center py-3 text-slate-500">
              {hall.status === 'available' ? '当前空闲可预约' : '维护中'}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
