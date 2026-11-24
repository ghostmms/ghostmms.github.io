'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, ContactShadows, Html, OrbitControls } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { TZ_ISLANDS, TZ_LAKES, TZ_OUTLINE } from '@/lib/geo';
import type { MapPoint } from '../map/TanzaniaMap';

const S = 0.55;
const xy = (lat: number, lon: number) => [(lon - 34.9) * S, (lat + 6.3) * S] as const;
function shapeOf(pts: [number, number][]) {
  const s = new THREE.Shape();
  pts.forEach(([la, lo], i) => { const [x, y] = xy(la, lo); if (i === 0) s.moveTo(x, y); else s.lineTo(x, y); });
  s.closePath();
  return s;
}

function Pin({ p, selected, onSelect }: { p: MapPoint; selected: boolean; onSelect: (id: string) => void }) {
  const [x, y] = xy(p.lat, p.lon);
  const [hover, setHover] = useState(false);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const target = selected || hover ? 1.35 : 1;
    ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x, target, 8, dt));
  });
  return (
    <group ref={ref} position={[x, y, 0.22]}
      onClick={(e) => { e.stopPropagation(); onSelect(p.id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = ''; }}>
      <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.44, 8]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh position={[0, 0, 0.48]}>
        <sphereGeometry args={[0.11, 24, 24]} />
        <meshStandardMaterial color={p.color ?? '#0F4D32'} roughness={0.35} metalness={0.1} />
      </mesh>
      {(hover || selected) && (
        <Html position={[0, 0, 0.75]} center distanceFactor={7} zIndexRange={[20, 0]}>
          <div className="whitespace-nowrap rounded-md bg-white px-2.5 py-1.5 text-[12px] font-semibold text-ink shadow-card">{p.label}</div>
        </Html>
      )}
    </group>
  );
}

function Scene({ points, selected, onSelect, still }: { points: MapPoint[]; selected?: string | null; onSelect: (id: string | null) => void; still: boolean }) {
  const land = useMemo(() => new THREE.ExtrudeGeometry(shapeOf(TZ_OUTLINE), { depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }), []);
  const islands = useMemo(() => TZ_ISLANDS.map((i) => new THREE.ExtrudeGeometry(shapeOf(i), { depth: 0.16, bevelEnabled: false })), []);
  const lakes = useMemo(() => TZ_LAKES.map((l) => new THREE.ShapeGeometry(shapeOf(l))), []);
  const group = useRef<THREE.Group>(null);
  const spin = useRef(still ? 0 : 0.35);
  useFrame((_, dt) => {
    if (!group.current) return;
    // gentle settling turn on entry, then still
    spin.current = THREE.MathUtils.damp(spin.current, 0, 1.6, dt);
    group.current.rotation.z = spin.current;
  });
  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[4, -3, 8]} intensity={1.4} castShadow />
      <directionalLight position={[-5, 4, 3]} intensity={0.35} color="#cfe6ff" />
      <Bounds fit clip observe margin={1.08}>
      <group rotation={[-0.75, 0, 0]}>
      <group ref={group} onPointerMissed={() => onSelect(null)}>
        <mesh geometry={land} castShadow receiveShadow>
          <meshStandardMaterial attach="material-0" color="#EEF3EA" roughness={0.85} emissive="#E6EBE3" emissiveIntensity={0.25} />
          <meshStandardMaterial attach="material-1" color="#0F4D32" roughness={0.6} />
        </mesh>
        {islands.map((g, i) => (
          <mesh key={i} geometry={g}><meshStandardMaterial attach="material-0" color="#EEF0E8" /><meshStandardMaterial attach="material-1" color="#0F4D32" /></mesh>
        ))}
        {(() => { const [kx, ky] = xy(-3.07, 37.35); return (
          <group position={[kx, ky, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh position={[0, 0.16, 0]}><coneGeometry args={[0.32, 0.32, 40]} /><meshStandardMaterial color="#5E6B5A" roughness={0.9} /></mesh>
            <mesh position={[0, 0.27, 0]}><coneGeometry args={[0.12, 0.1, 40]} /><meshStandardMaterial color="#ffffff" roughness={0.6} /></mesh>
          </group>
        ); })()}
        {lakes.map((g, i) => <mesh key={i} geometry={g} position={[0, 0, 0.01]}><meshStandardMaterial color="#8CC3DA" roughness={0.3} /></mesh>)}
        {points.map((p) => <Pin key={p.id} p={p} selected={p.id === selected} onSelect={(id) => onSelect(id === selected ? null : id)} />)}
      </group>
      </group>
      </Bounds>
      <ContactShadows position={[0, -2.2, -0.6]} opacity={0.35} scale={12} blur={2.4} far={4} />
      <OrbitControls makeDefault enablePan={false} minDistance={3} maxDistance={16} minPolarAngle={0.15} maxPolarAngle={1.4} />
    </>
  );
}

export default function Tanzania3D({ points, selected, onSelect, still = false }: { points: MapPoint[]; selected?: string | null; onSelect: (id: string | null) => void; still?: boolean }) {
  return (
    <Canvas dpr={[1, 1.75]} shadows camera={{ position: [0, -1.2, 8.2], fov: 38 }} gl={{ antialias: true, alpha: true }} aria-label="3D model of Tanzania with initiative locations">
      <Scene points={points} selected={selected} onSelect={onSelect} still={still} />
    </Canvas>
  );
}
