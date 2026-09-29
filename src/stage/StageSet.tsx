/* 舞台布景：镜面地板、圆形舞台、霓虹灯环、背景灯柱、假体积光束 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshReflectorMaterial } from '@react-three/drei';

const PINK = '#FF6FA5';
const HOTPINK = '#FF4D8D';
const VIOLET = '#8B7CFF';
const AMBER = '#FFC95E';

/** 径向渐变光晕纹理 */
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.28)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** 居中环境：地板 + 背景灯柱 + 光束 + 光晕 */
export function StageEnvironment({ reducedMotion }: { reducedMotion: boolean }) {
  const glow = useGlowTexture();
  const barsRef = useRef<THREE.Group>(null!);
  const coneL = useRef<THREE.Mesh>(null!);
  const coneR = useRef<THREE.Mesh>(null!);
  const spotL = useRef<THREE.SpotLight>(null!);
  const spotR = useRef<THREE.SpotLight>(null!);

  const bars = useMemo(() => {
    const list: { x: number; z: number; h: number; color: string }[] = [];
    const colors = [PINK, VIOLET, AMBER, VIOLET];
    for (let i = 0; i < 11; i++) {
      const a = THREE.MathUtils.degToRad(-65 + i * 13);
      list.push({
        x: Math.sin(a) * 4.4,
        z: -Math.cos(a) * 4.4 - 0.4,
        h: 1.7 + (i % 3) * 0.5,
        color: colors[i % colors.length],
      });
    }
    return list;
  }, []);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    // 灯柱呼吸
    barsRef.current?.children.forEach((bar, i) => {
      const m = (bar as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.55 + Math.sin(t * 2.2 + i * 0.9) * 0.35;
    });
    // 光束摇摆
    coneL.current.rotation.z = 0.34 + Math.sin(t * 0.9) * 0.12;
    coneR.current.rotation.z = -0.34 - Math.sin(t * 0.9 + 1.4) * 0.12;
    // 射灯强度脉动
    spotL.current.intensity = 26 + Math.sin(t * 2.1) * 8;
    spotR.current.intensity = 26 + Math.sin(t * 2.1 + Math.PI) * 8;
  });

  const beamMat = (color: string) => (
    <meshBasicMaterial
      color={color}
      transparent
      opacity={0.09}
      side={THREE.DoubleSide}
      depthWrite={false}
      blending={THREE.AdditiveBlending}
    />
  );

  return (
    <group>
      {/* 镜面地板 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[10, 64]} />
        <MeshReflectorMaterial
          blur={[280, 60]}
          resolution={1024}
          mixBlur={1}
          mixStrength={14}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0B0B13"
          metalness={0.5}
          mirror={0.55}
        />
      </mesh>

      {/* 背景灯柱 */}
      <group ref={barsRef}>
        {bars.map((b, i) => (
          <mesh key={i} position={[b.x, b.h / 2, b.z]}>
            <boxGeometry args={[0.13, b.h, 0.08]} />
            <meshBasicMaterial color={b.color} transparent opacity={0.7} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* 背幕光晕 */}
      <sprite position={[0, 2.3, -4.8]} scale={[9, 5.5, 1]}>
        <spriteMaterial map={glow} color={HOTPINK} transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite position={[-2.8, 2.8, -4.4]} scale={[5, 4, 1]}>
        <spriteMaterial map={glow} color={VIOLET} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite position={[2.8, 2.8, -4.4]} scale={[5, 4, 1]}>
        <spriteMaterial map={glow} color={AMBER} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>

      {/* 假体积光束（锥顶朝上对准光源，开口洒向舞台） */}
      <mesh ref={coneL} position={[-2.6, 3.4, -1.2]} rotation={[0.12, 0, 0.34]}>
        <coneGeometry args={[1.15, 6.6, 32, 1, true]} />
        {beamMat(PINK)}
      </mesh>
      <mesh ref={coneR} position={[2.6, 3.4, -1.2]} rotation={[0.12, 0, -0.34]}>
        <coneGeometry args={[1.15, 6.6, 32, 1, true]} />
        {beamMat(VIOLET)}
      </mesh>
      <mesh position={[0, 3.8, -2.2]} rotation={[0.28, 0, 0]}>
        <coneGeometry args={[1.3, 7, 32, 1, true]} />
        {beamMat(AMBER)}
      </mesh>

      {/* 灯光 */}
      <ambientLight intensity={0.55} />
      <spotLight ref={spotL} position={[-4.5, 6, 2.5]} angle={0.55} penumbra={0.6} intensity={26} decay={0} color={PINK} />
      <spotLight ref={spotR} position={[4.5, 6, 2.5]} angle={0.55} penumbra={0.6} intensity={26} decay={0} color={VIOLET} />
      <spotLight position={[0, 5.5, -4]} angle={0.6} penumbra={0.8} intensity={14} decay={0} color={AMBER} />
      <pointLight position={[0, 2.4, 4.6]} intensity={0.45} decay={0} color="#FFE8D6" />
    </group>
  );
}

/** 随角色一起偏移的圆形舞台台体 */
export function Platform({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[2.3, 2.5, 0.18, 48]} />
        <meshStandardMaterial color="#15151F" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* 台面霓虹灯环 */}
      <mesh position={[0, 0.185, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.3, 0.04, 10, 72]} />
        <meshBasicMaterial color={HOTPINK} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.185, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.85, 0.025, 10, 72]} />
        <meshBasicMaterial color={VIOLET} toneMapped={false} />
      </mesh>
      {/* 角色脚下假阴影 */}
      <mesh position={[0, 0.186, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 40]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}
