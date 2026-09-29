/* 3D 舞台容器：Canvas + 鼠标视差 + WebGL 失败兜底 */
import { Component, Suspense, useMemo, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { GuoziCharacter } from './GuoziCharacter';
import { StageEnvironment, Platform } from './StageSet';
import { usePrefersReducedMotion } from '../hooks/useReveal';

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

class GLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** 桌面端鼠标视差 + 注视点；窄屏拉远相机防止角色糊脸 */
function CameraRig({ reduced, focusX }: { reduced: boolean; focusX: number }) {
  const size = useThree((s) => s.size);
  const baseZ = size.width < 640 ? 9.2 : size.width < 1024 ? 6.9 : 5.6;
  const baseY = size.width < 640 ? 1.9 : 1.55;
  const lookY = size.width < 640 ? 0.75 : 1.15;
  useFrame(({ camera, pointer }) => {
    const tx = reduced ? 0 : pointer.x * 0.5;
    const ty = baseY + (reduced ? 0 : pointer.y * 0.22);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.045);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.045);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseZ, 0.06);
    camera.lookAt(focusX * 0.55, lookY, 0);
  });
  return null;
}

/** 桌面端舞台右移，给左侧文案让位 */
function useStageX() {
  const width = useThree((s) => s.size.width);
  return width >= 1024 ? 1.15 : 0;
}

function Scene({ onCheer, reduced }: { onCheer?: (x: number, y: number) => void; reduced: boolean }) {
  const stageX = useStageX();
  return (
    <>
      <StageEnvironment reducedMotion={reduced} />
      <Platform x={stageX} />
      <GuoziCharacter x={stageX} reducedMotion={reduced} onCheer={onCheer} />
      <Sparkles count={reduced ? 0 : 55} scale={[9, 4.5, 5]} position={[0, 2.6, -0.6]} size={3.5} speed={reduced ? 0 : 0.32} opacity={0.7} color="#FF9FC0" />
      <Sparkles count={reduced ? 0 : 40} scale={[10, 5, 6]} position={[0, 2.2, -1]} size={2.5} speed={reduced ? 0 : 0.24} opacity={0.6} color="#B9AEFF" />
      <CameraRig reduced={reduced} focusX={stageX} />
    </>
  );
}

/** WebGL 不可用时的兜底视觉：照片 + 光晕 */
function FallbackVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute w-[70vw] h-[70vw] max-w-[560px] max-h-[560px] rounded-full bg-hotpink/20 blur-3xl" />
      <img
        src={`${import.meta.env.BASE_URL}photos/photo-03.jpg`}
        alt="主播果子"
        className="relative w-56 h-56 md:w-72 md:h-72 object-cover rounded-full border-4 border-pink/60 shadow-[0_0_80px_rgba(255,111,165,0.4)]"
      />
    </div>
  );
}

export function GuoziStage({ onCheer }: { onCheer?: (x: number, y: number) => void }) {
  const reduced = usePrefersReducedMotion();
  const ok = useMemo(webglOK, []);
  const [fallback, setFallback] = useState(false);
  if (!ok || fallback) return <FallbackVisual />;
  const initialZ = typeof window !== 'undefined' && window.innerWidth < 640 ? 8.6 : 5.6;
  return (
    <GLBoundary fallback={<FallbackVisual />}>
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 1.55, initialZ], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={(s) => s.camera.lookAt(0, 1.15, 0)}
        onError={() => setFallback(true)}
      >
        <Suspense fallback={null}>
          <Scene onCheer={onCheer} reduced={reduced} />
        </Suspense>
      </Canvas>
    </GLBoundary>
  );
}
