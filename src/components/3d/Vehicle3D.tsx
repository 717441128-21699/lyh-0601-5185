import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type * as THREE from 'three';
import type { Vehicle } from '../../types';

interface Props {
  vehicle: Vehicle;
}

export default function Vehicle3D({ vehicle }: Props) {
  const ref = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Mesh[]>([]);

  const color =
    vehicle.status === '出车中' ? '#1e40af' : vehicle.status === '空闲' ? '#374151' : '#7f1d1d';

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.set(...vehicle.position as [number, number, number]);
    if (vehicle.status === '出车中') {
      wheelRefs.current.forEach((w) => {
        if (w) w.rotation.x += delta * 3;
      });
    }
  });

  return (
    <group ref={ref}>
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.8, 0.5, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[-0.3, 0.7, 0]}>
        <boxGeometry args={[0.9, 0.45, 0.75]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.15, 0.7, 0]}>
        <boxGeometry args={[0.02, 0.35, 0.7]} />
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.5} />
      </mesh>
      {[[-0.6, 0.15, 0.45], [-0.6, 0.15, -0.45], [0.6, 0.15, 0.45], [0.6, 0.15, -0.45]].map(
        (pos, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) wheelRefs.current[i] = el;
            }}
            position={pos as [number, number, number]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.15, 0.15, 0.12, 12]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        ),
      )}
      <Html position={[0, 1.3, 0]} center distanceFactor={8}>
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded px-2 py-1 text-white text-xs whitespace-nowrap shadow-lg">
          <div className="font-bold text-amber-400">{vehicle.plateNumber}</div>
          <div
            className={`text-center ${
              vehicle.status === '出车中'
                ? 'text-blue-400'
                : vehicle.status === '空闲'
                  ? 'text-green-400'
                  : 'text-red-400'
            }`}
          >
            {vehicle.status}
          </div>
          {vehicle.currentTask && <div className="text-slate-300">{vehicle.currentTask}</div>}
        </div>
      </Html>
    </group>
  );
}
