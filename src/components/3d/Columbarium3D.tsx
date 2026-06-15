import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type * as THREE from 'three';
import type { ColumbariumSlot } from '../../types';

interface Props {
  slot: ColumbariumSlot;
  selected: boolean;
  onSelect: (id: string) => void;
}

export default function Columbarium3D({ slot, selected, onSelect }: Props) {
  const ref = useRef<THREE.Mesh>(null);

  const colorMap: Record<ColumbariumSlot['status'], string> = {
    available: '#1e293b',
    occupied: '#3b82f6',
    expiring: '#f59e0b',
    expired: '#ef4444',
    locked: '#6b7280',
  };

  useFrame((state) => {
    if (!ref.current) return;
    if (slot.status === 'expiring') {
      const t = (Math.sin(state.clock.elapsedTime * 4) + 1) / 2;
      (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.5 + t * 0.5;
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + t * 0.5;
    }
    if (selected) {
      (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
    }
  });

  const daysLeft = slot.leaseEndDate
    ? Math.ceil((slot.leaseEndDate.getTime() - Date.now()) / (24 * 3600000))
    : null;

  return (
    <group position={slot.position}>
      <mesh
        ref={ref}
        onClick={() => onSelect(slot.id)}
        castShadow
      >
        <boxGeometry args={[0.7, 0.7, 0.5]} />
        <meshStandardMaterial
          color={colorMap[slot.status]}
          transparent
          opacity={0.9}
          emissive={colorMap[slot.status]}
          emissiveIntensity={0.1}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[0, 0, 0.26]}>
        <boxGeometry args={[0.6, 0.6, 0.02]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      {slot.locked && (
        <Html position={[0, 0, 0.4]} center distanceFactor={3}>
          <div className="text-red-500 text-lg">🔒</div>
        </Html>
      )}
      {(selected || slot.status === 'expiring' || slot.status === 'expired') && (
        <Html position={[0, -0.6, 0]} center distanceFactor={6}>
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded px-2 py-1 text-white text-xs whitespace-nowrap shadow-lg">
            <div className="font-bold text-amber-400">{slot.location}</div>
            {slot.lesseeName && <div className="text-slate-300">{slot.lesseeName}</div>}
            {daysLeft !== null && (
              <div className={daysLeft < 0 ? 'text-red-400' : daysLeft <= 30 ? 'text-orange-400' : 'text-green-400'}>
                {daysLeft < 0 ? `超期${-daysLeft}天` : `剩余${daysLeft}天`}
              </div>
            )}
            {slot.locked && <div className="text-red-400">已上锁</div>}
          </div>
        </Html>
      )}
    </group>
  );
}
