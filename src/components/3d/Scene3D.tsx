import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import FarewellHall3D from './FarewellHall3D';
import CremationFurnace3D from './CremationFurnace3D';
import Columbarium3D from './Columbarium3D';
import Vehicle3D from './Vehicle3D';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  view: 'overview' | 'farewell' | 'cremation' | 'columbarium';
}

export default function Scene3D({ view }: Props) {
  const halls = useAppStore((s) => s.halls);
  const furnaces = useAppStore((s) => s.furnaces);
  const slots = useAppStore((s) => s.slots);
  const vehicles = useAppStore((s) => s.vehicles);
  const updateProgress = useAppStore((s) => s.updateProgress);
  const updateTemperatures = useAppStore((s) => s.updateTemperatures);

  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const t1 = setInterval(updateProgress, 1000);
    const t2 = setInterval(updateTemperatures, 2000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, [updateProgress, updateTemperatures]);

  const cameraPos =
    view === 'farewell'
      ? ([0, 5, 8] as [number, number, number])
      : view === 'cremation'
        ? ([0, 5, 12] as [number, number, number])
        : view === 'columbarium'
          ? ([0, 4, 6] as [number, number, number])
          : ([0, 12, 18] as [number, number, number]);

  return (
    <Canvas
      shadows
      camera={{ position: cameraPos, fov: 50 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#0b1220']} />
      <fog attach="fog" args={['#0b1220', 20, 40]} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 3, 0]} intensity={0.5} color="#fbbf24" />
      <pointLight position={[5, 3, 6]} intensity={0.5} color="#60a5fa" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 3]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>

      <gridHelper args={[40, 40, '#334155', '#1e293b']} position={[0, 0.01, 3]} />

      {(view === 'overview' || view === 'farewell') && (
        <group position={[0, 1.25, 0]}>
          {halls.map((h) => (
            <FarewellHall3D
              key={h.id}
              hall={h}
              selected={selected === h.id}
              onSelect={(id) => setSelected(id === selected ? null : id)}
            />
          ))}
        </group>
      )}

      {(view === 'overview' || view === 'cremation') && (
        <group position={[0, 1.5, 0]}>
          {furnaces.map((f) => (
            <CremationFurnace3D
              key={f.id}
              furnace={f}
              selected={selected === f.id}
              onSelect={(id) => setSelected(id === selected ? null : id)}
            />
          ))}
        </group>
      )}

      {(view === 'overview' || view === 'columbarium') && (
        <group position={[0, 1.5, -5]}>
          {slots.map((s) => (
            <Columbarium3D
              key={s.id}
              slot={s}
              selected={selected === s.id}
              onSelect={(id) => setSelected(id === selected ? null : id)}
            />
          ))}
        </group>
      )}

      {(view === 'overview') && (
        <group>
          {vehicles.map((v) => (
            <Vehicle3D key={v.id} vehicle={v} />
          ))}
        </group>
      )}

      <ContactShadows position={[0, 0, 3]} opacity={0.5} scale={40} blur={2} far={10} />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={30}
        target={[0, 1, 3]}
      />

      <EffectComposer>
        <Bloom intensity={0.4} luminanceThreshold={0.7} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
