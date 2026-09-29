/* Q 版果子 3D 建模：齐刘海黑棕发 + 黑框眼镜 + 双马尾 + 打歌服 + 手麦 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { createFaceTexture, type Expr } from './FaceTexture';

const SKIN = '#FFDFC9';
const HAIR = '#2E2430';
const OUTFIT = '#FFF3F6';
const PINK = '#FF6FA5';
const HOTPINK = '#FF4D8D';
const VIOLET = '#8B7CFF';
const FRAME = '#1C1B20';

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

interface Props {
  reducedMotion: boolean;
  onCheer?: (x: number, y: number) => void;
  x?: number;
}

export function GuoziCharacter({ reducedMotion, onCheer, x = 0 }: Props) {
  const root = useRef<THREE.Group>(null!);
  const sway = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const tailL = useRef<THREE.Group>(null!);
  const tailR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const spinAngle = useRef(0);
  const flourish = useRef(0);
  const pauseSpinUntil = useRef(0);

  const face = useMemo(() => createFaceTexture(), []);
  const baseExpr = useRef<Expr>('smile');

  /* 开发调试：__guoziPose(0) 定格到正面，__guoziExpr('wink') 试表情（生产构建会被裁剪） */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as Record<string, unknown>;
    w.__guoziPose = (a = 0) => {
      spinAngle.current = a;
      if (root.current) root.current.rotation.y = a;
      pauseSpinUntil.current = performance.now() + 60000;
    };
    w.__guoziExpr = (e: Expr) => {
      baseExpr.current = e;
      face.draw(e);
    };
  }, [face]);

  const frameGeo = useMemo(() => {
    const outer = roundedRect(0.3, 0.235, 0.085);
    outer.holes.push(roundedRect(0.234, 0.168, 0.06));
    const g = new THREE.ExtrudeGeometry(outer, { depth: 0.026, bevelEnabled: false });
    g.center();
    return g;
  }, []);
  const lensGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(0.234, 0.168, 0.06)), []);

  /* 表情调度：日常眨眼 + 随机特殊表情 */
  useEffect(() => {
    if (reducedMotion) return;
    let alive = true;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    const blinkLoop = () => {
      if (!alive) return;
      later(() => {
        face.draw('blink');
        later(() => {
          face.draw(baseExpr.current);
          blinkLoop();
        }, 150);
      }, 2200 + Math.random() * 2400);
    };
    const specialLoop = () => {
      if (!alive) return;
      later(() => {
        const specials: Expr[] = ['happy', 'wink', 'sparkle', 'sing'];
        const pick = specials[Math.floor(Math.random() * specials.length)];
        baseExpr.current = pick;
        face.draw(pick);
        later(() => {
          baseExpr.current = 'smile';
          face.draw('smile');
          specialLoop();
        }, 1600 + Math.random() * 800);
      }, 6000 + Math.random() * 5000);
    };
    blinkLoop();
    specialLoop();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [face, reducedMotion]);

  /* 舞台动作循环：自转 + 弹跳 + 挥手 + 双马尾摆动 */
  useFrame((state, dt) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    flourish.current = Math.max(0, flourish.current - dt * 3.2);
    if (performance.now() > pauseSpinUntil.current) {
      spinAngle.current += dt * (0.16 + flourish.current);
    }
    root.current.rotation.y = spinAngle.current;
    sway.current.position.y = Math.sin(t * 2.3) * 0.035;
    sway.current.rotation.z = Math.sin(t * 1.05) * 0.03;
    head.current.rotation.z = Math.sin(t * 1.05 + 0.4) * 0.05;
    head.current.rotation.x = Math.sin(t * 1.7) * 0.035;
    armR.current.rotation.z = -2.35 + Math.sin(t * 2.9) * 0.3;
    armL.current.rotation.z = 0.35 + Math.sin(t * 2.9 + Math.PI) * 0.12;
    tailL.current.rotation.x = Math.sin(t * 2.3 + 0.6) * 0.1;
    tailL.current.rotation.z = -0.1 + Math.sin(t * 2.3) * 0.07;
    tailR.current.rotation.x = Math.sin(t * 2.3 + 1.1) * 0.1;
    tailR.current.rotation.z = 0.1 - Math.sin(t * 2.3) * 0.07;
  });

  const handleDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    flourish.current = 6.5;
    baseExpr.current = 'happy';
    face.draw('happy');
    window.setTimeout(() => {
      baseExpr.current = 'smile';
      face.draw('smile');
    }, 1600);
    onCheer?.(e.nativeEvent.clientX, e.nativeEvent.clientY);
  };

  const skinMat = <meshStandardMaterial color={SKIN} roughness={0.62} />;
  const hairMat = <meshStandardMaterial color={HAIR} roughness={0.5} />;

  return (
    <group position={[x, 0.18, 0]}>
      <group ref={root}>
        <group
          ref={sway}
          onPointerDown={handleDown}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = '')}
        >
          {/* ===== 下半身 ===== */}
          {[-0.13, 0.13].map((lx) => (
            <group key={lx}>
              <mesh position={[lx, 0.26, 0]}>
                <capsuleGeometry args={[0.075, 0.2, 6, 16]} />
                {skinMat}
              </mesh>
              {/* 袜子 */}
              <mesh position={[lx, 0.115, 0]}>
                <capsuleGeometry args={[0.082, 0.09, 6, 16]} />
                <meshStandardMaterial color={OUTFIT} roughness={0.7} />
              </mesh>
              {/* 小皮鞋 */}
              <mesh position={[lx, 0.062, 0.03]} scale={[1.05, 0.62, 1.4]}>
                <sphereGeometry args={[0.11, 24, 16]} />
                <meshStandardMaterial color={HOTPINK} roughness={0.35} />
              </mesh>
            </group>
          ))}
          {/* 百褶裙 */}
          <mesh position={[0, 0.39, 0]}>
            <cylinderGeometry args={[0.32, 0.58, 0.34, 14, 1, true]} />
            <meshStandardMaterial color={VIOLET} roughness={0.7} flatShading side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.225, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.58, 0.025, 10, 40]} />
            <meshStandardMaterial color={OUTFIT} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.555, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.325, 0.035, 10, 40]} />
            <meshStandardMaterial color={HOTPINK} roughness={0.5} />
          </mesh>

          {/* ===== 上身 ===== */}
          <mesh position={[0, 0.62, 0]} scale={[1, 0.85, 0.82]}>
            <sphereGeometry args={[0.32, 48, 32]} />
            <meshStandardMaterial color={OUTFIT} roughness={0.7} />
          </mesh>
          {/* 水手领 */}
          <mesh position={[0, 0.77, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 0.12, 32, 1, true]} />
            <meshStandardMaterial color={PINK} roughness={0.65} side={THREE.DoubleSide} />
          </mesh>
          {/* 胸前蝴蝶结 */}
          <mesh position={[0, 0.70, 0.285]}>
            <sphereGeometry args={[0.05, 20, 14]} />
            <meshStandardMaterial color={HOTPINK} roughness={0.5} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.095, 0.705, 0.28]} rotation={[0, 0, s * -0.5]} scale={[1.7, 0.75, 0.5]}>
              <sphereGeometry args={[0.07, 20, 14]} />
              <meshStandardMaterial color={HOTPINK} roughness={0.5} />
            </mesh>
          ))}
          {/* 泡泡袖 */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.32, 0.76, 0]}>
              <sphereGeometry args={[0.145, 24, 16]} />
              <meshStandardMaterial color={OUTFIT} roughness={0.7} />
            </mesh>
          ))}
          {/* 左臂自然摆动 */}
          <group ref={armL} position={[-0.34, 0.74, 0]}>
            <mesh position={[0, -0.19, 0]}>
              <capsuleGeometry args={[0.065, 0.3, 6, 16]} />
              {skinMat}
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <sphereGeometry args={[0.085, 24, 16]} />
              {skinMat}
            </mesh>
          </group>
          {/* 右臂举麦挥舞 */}
          <group ref={armR} position={[0.34, 0.74, 0]}>
            <mesh position={[0, -0.19, 0]}>
              <capsuleGeometry args={[0.065, 0.3, 6, 16]} />
              {skinMat}
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <sphereGeometry args={[0.085, 24, 16]} />
              {skinMat}
            </mesh>
            {/* 手麦 */}
            <group position={[0, -0.46, 0.03]}>
              <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.032, 0.036, 0.16, 16]} />
                <meshStandardMaterial color="#2A2A33" roughness={0.4} />
              </mesh>
              <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.048, 0.012, 8, 24]} />
                <meshStandardMaterial color={HOTPINK} roughness={0.4} />
              </mesh>
              <mesh position={[0, -0.115, 0]}>
                <sphereGeometry args={[0.078, 24, 16]} />
                <meshStandardMaterial color="#E6E6F0" metalness={0.85} roughness={0.28} />
              </mesh>
            </group>
          </group>

          {/* ===== 头部 ===== */}
          <group ref={head} position={[0, 1.24, 0]} scale={[1, 0.96, 0.97]}>
            {/* 脸（皮肤底） */}
            <mesh>
              <sphereGeometry args={[0.62, 64, 48]} />
              {skinMat}
            </mesh>
            {/* 耳朵 */}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.6, 0.02, 0.02]}>
                <sphereGeometry args={[0.085, 20, 14]} />
                {skinMat}
              </mesh>
            ))}
            {/* 五官表情贴图 */}
            <mesh>
              <sphereGeometry args={[0.625, 48, 32, Math.PI / 2 - 0.62, 1.24, Math.PI * 0.3, Math.PI * 0.5]} />
              <meshBasicMaterial map={face.texture} transparent toneMapped={false} />
            </mesh>
            {/* 后脑头发 */}
            <mesh position={[0, 0, -0.02]}>
              <sphereGeometry args={[0.655, 64, 48, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, Math.PI * 0.62]} />
              {hairMat}
            </mesh>
            {/* 齐刘海 */}
            <mesh>
              <sphereGeometry args={[0.668, 48, 24, Math.PI / 2 - 0.98, 1.96, Math.PI * 0.2, Math.PI * 0.26]} />
              <meshStandardMaterial color={HAIR} roughness={0.5} side={THREE.DoubleSide} />
            </mesh>
            {/* 呆毛 */}
            <mesh position={[0.02, 0.66, 0]} rotation={[-0.35, 0, 0.5]}>
              <torusGeometry args={[0.11, 0.017, 8, 24, Math.PI * 0.95]} />
              {hairMat}
            </mesh>
            {/* 鬓角碎发 */}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.52, -0.14, 0.3]} rotation={[0.06, 0, s * -0.1]}>
                <capsuleGeometry args={[0.052, 0.38, 6, 14]} />
                {hairMat}
              </mesh>
            ))}
            {/* 双马尾（泡泡辫） */}
            {([-1, 1] as const).map((s) => (
              <group key={s} ref={s < 0 ? tailL : tailR} position={[s * 0.58, 0.24, -0.12]}>
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <torusGeometry args={[0.085, 0.028, 10, 24]} />
                  <meshStandardMaterial color={HOTPINK} roughness={0.45} />
                </mesh>
                {[
                  [0.02, -0.1, 0, 0.17],
                  [0.1, -0.3, 0, 0.155],
                  [0.17, -0.48, 0, 0.13],
                  [0.22, -0.63, 0, 0.1],
                ].map(([tx, ty, tz, r], i) => (
                  <mesh key={i} position={[s * (tx as number), ty as number, tz as number]}>
                    <sphereGeometry args={[r as number, 24, 16]} />
                    {hairMat}
                  </mesh>
                ))}
              </group>
            ))}
            {/* 黑框眼镜 */}
            <group position={[0, 0, 0]}>
              {([-1, 1] as const).map((s) => (
                <group key={s}>
                  <mesh geometry={frameGeo} position={[s * 0.165, 0, 0.635]} rotation={[0, s * -0.1, 0]}>
                    <meshStandardMaterial color={FRAME} roughness={0.4} />
                  </mesh>
                  <mesh geometry={lensGeo} position={[s * 0.165, 0, 0.628]}>
                    <meshBasicMaterial color="#FFFFFF" transparent opacity={0.1} depthWrite={false} />
                  </mesh>
                  {/* 镜腿 */}
                  <mesh position={[s * 0.325, 0.005, 0.47]} rotation={[0, s * -0.24, 0]}>
                    <boxGeometry args={[0.016, 0.02, 0.3]} />
                    <meshStandardMaterial color={FRAME} roughness={0.4} />
                  </mesh>
                </group>
              ))}
              {/* 鼻梁 */}
              <mesh position={[0, 0.01, 0.645]}>
                <boxGeometry args={[0.075, 0.022, 0.024]} />
                <meshStandardMaterial color={FRAME} roughness={0.4} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
