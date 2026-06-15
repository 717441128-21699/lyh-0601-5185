import { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type * as THREE from 'three';
import type { FarewellHall as HallType, Appointment } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  hall: HallType;
  selected: boolean;
  onSelect: (id: string) => void;
}

export default function FarewellHall3D({ hall, selected, onSelect }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const appointments = useAppStore((s) => s.appointments);
  const currentApt = appointments.find((a) => a.hallId === hall.id && a.status === 'in_progress');

  const colorMap: Record<HallType['status'], string> = {
    available: '#22c55e',
    in_use: '#3b82f6',
    reserved: '#f59e0b',
    maintenance: '#6b7280',
  };

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
          emissive={selected ? colorMap[hall.status] : '#000'}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>
      <mesh position={[0, 1.26, 0]}>
        <boxGeometry args={[3.6, 0.02, 3.1]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
      </mesh>
      <Html position={[0, -0.8, 1.6]} center distanceFactor={8}>
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-white text-xs whitespace-nowrap shadow-xl">
          <div className="font-bold text-amber-400 mb-1" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            {hall.name}
          </div>
          <div className="text-slate-300">规格：{hall.spec} | 容纳：{hall.capacity}人</div>
          {currentApt && (
            <>
              <div className="text-blue-300 mt-1">{currentApt.familyName}</div>
              <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden w-32">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-amber-500 transition-all"
                  style={{ width: `${currentApt.progress}%` }}
                />
              </div>
              <div className="text-slate-400 mt-0.5">进度 {currentApt.progress.toFixed(0)}%</div>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}
