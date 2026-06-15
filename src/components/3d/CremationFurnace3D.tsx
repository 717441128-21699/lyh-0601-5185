import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type * as THREE from 'three';
import type { CremationFurnace } from '../../types';

interface Props {
  furnace: CremationFurnace;
  selected: boolean;
  onSelect: (id: string) => void;
}

export default function CremationFurnace3D({ furnace, selected, onSelect }: Props) {
  const ref = useRef<THREE.Group>(null);
  const fireRef = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);

  const borderColor =
    furnace.usageCount >= furnace.maintenanceThreshold * 0.95
      ? '#f97316'
      : furnace.status === 'warning'
        ? '#ef4444'
        : furnace.status === 'running'
          ? '#3b82f6'
          : '#6b7280';

  const maintenanceProgress = (furnace.usageCount / furnace.maintenanceThreshold) * 100;
  const needsMaintenance = maintenanceProgress >= 90;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    if (needsMaintenance || furnace.status === 'warning') {
      ref.current.position.y = furnace.position[1] + Math.sin(t * 4) * 0.03;
    }
    if (fireRef.current && (furnace.status === 'running' || furnace.status === 'warning')) {
      const s = 0.8 + Math.sin(t * 8) * 0.2;
      fireRef.current.scale.set(s, s * (0.5 + Math.random() * 0.3), s);
    }
  });

  return (
    <group ref={ref} position={furnace.position}>
      <mesh
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onClick={() => onSelect(furnace.id)}
        castShadow
      >
        <cylinderGeometry args={[1, 1.2, 3, 16]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.7}
          roughness={0.3}
          emissive={borderColor}
          emissiveIntensity={selected || hover ? 0.4 : needsMaintenance ? 0.2 : 0.05}
        />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <torusGeometry args={[1.25, 0.08, 8, 32]} />
        <meshStandardMaterial
          color={borderColor}
          emissive={borderColor}
          emissiveIntensity={needsMaintenance ? 0.8 : 0.4}
        />
      </mesh>
      {(furnace.status === 'running' || furnace.status === 'warning') && (
        <mesh ref={fireRef} position={[0, -0.5, 0]}>
          <coneGeometry args={[0.6, 1.5, 8]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.7} />
        </mesh>
      )}
      <Html position={[0, 3.5, 0]} center distanceFactor={10}>
        <div
          className={`bg-slate-900/95 backdrop-blur-sm border rounded-lg px-3 py-2 text-white text-xs whitespace-nowrap shadow-xl ${
            needsMaintenance ? 'border-orange-500' : 'border-slate-700'
          }`}
        >
          <div className="font-bold text-amber-400 mb-1" style={{ fontFamily: 'Noto Serif SC, serif' }}>
            {furnace.name}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300">炉温:</span>
            <span
              className={`font-bold ${
                furnace.temperature > 950 || furnace.temperature < 750 ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {furnace.temperature}℃
            </span>
          </div>
          <div className="text-slate-300 mt-0.5">累计: {furnace.usageCount}/{furnace.maintenanceThreshold}次</div>
          <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden w-32">
            <div
              className={`h-full transition-all ${
                maintenanceProgress >= 95 ? 'bg-red-500' : maintenanceProgress >= 90 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, maintenanceProgress)}%` }}
            />
          </div>
          {furnace.currentFamily && <div className="text-blue-300 mt-1">当前: {furnace.currentFamily}</div>}
        </div>
      </Html>
    </group>
  );
}
