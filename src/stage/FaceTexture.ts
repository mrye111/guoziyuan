/* 果子脸部表情：Canvas 纹理绘制，贴在头部球体的正面扇区上 */
import * as THREE from 'three';

export type Expr = 'smile' | 'blink' | 'happy' | 'wink' | 'sparkle' | 'sing';

const W = 1024;
const EYE_Y = 415;
const EYE_L = 315;
const EYE_R = 709;
const MOUTH_Y = 645;
const INK = '#3A2620';
const LASH = '#241712';

function star4(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.18, y - r * 0.18, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.18, y + r * 0.18, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.18, y + r * 0.18, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.18, y - r * 0.18, x, y - r);
  ctx.fill();
}

export function createFaceTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = W;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  function blush() {
    for (const bx of [210, 814]) {
      const g = ctx.createRadialGradient(bx, 598, 8, bx, 598, 86);
      g.addColorStop(0, 'rgba(255,148,174,0.66)');
      g.addColorStop(1, 'rgba(255,148,174,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, 598, 86, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function openEye(cx: number, cy: number, sparkle: boolean) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, 100, 128, 0, 0, Math.PI * 2);
    ctx.clip();
    const g = ctx.createLinearGradient(0, cy - 128, 0, cy + 128);
    g.addColorStop(0, '#3E2A22');
    g.addColorStop(0.5, '#66422F');
    g.addColorStop(1, '#B5836A');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 100, cy - 128, 200, 256);
    ctx.restore();
    // 上睫毛
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, 104, 122, 0, Math.PI * 1.06, Math.PI * 1.94);
    ctx.strokeStyle = LASH;
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.stroke();
    // 高光
    if (sparkle) {
      star4(ctx, cx - 30, cy - 46, 36, '#FFFFFF');
      star4(ctx, cx + 34, cy + 36, 17, '#FFE9F2');
      star4(ctx, cx + 62, cy - 74, 12, '#FFFFFF');
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx - 32, cy - 46, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 34, cy + 40, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** happy=true 画 ∩（开心闭眼），false 画 ∪（普通眨眼） */
  function closedEye(cx: number, cy: number, happy: boolean) {
    ctx.strokeStyle = INK;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (happy) {
      ctx.lineWidth = 24;
      ctx.arc(cx, cy + 30, 84, Math.PI * 1.12, Math.PI * 1.88);
    } else {
      ctx.lineWidth = 19;
      ctx.arc(cx, cy - 26, 86, Math.PI * 0.14, Math.PI * 0.86);
    }
    ctx.stroke();
  }

  function mouth(expr: Expr) {
    ctx.lineCap = 'round';
    switch (expr) {
      case 'happy':
      case 'sparkle':
      case 'wink':
        ctx.beginPath();
        ctx.arc(512, MOUTH_Y - 20, 44, 0.08 * Math.PI, 0.92 * Math.PI);
        ctx.fillStyle = '#B04A56';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(512, MOUTH_Y + 4, 25, 13, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#EE93A0';
        ctx.fill();
        break;
      case 'sing':
        ctx.beginPath();
        ctx.ellipse(512, MOUTH_Y - 4, 33, 46, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#B04A56';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(512, MOUTH_Y + 16, 20, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#EE93A0';
        ctx.fill();
        break;
      default:
        // 猫咪嘴 ω
        ctx.strokeStyle = '#C26A72';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.arc(512 - 26, MOUTH_Y - 10, 26, 0.12 * Math.PI, 0.88 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(512 + 26, MOUTH_Y - 10, 26, 0.12 * Math.PI, 0.88 * Math.PI);
        ctx.stroke();
    }
  }

  function draw(expr: Expr) {
    ctx.clearRect(0, 0, W, W);
    blush();
    switch (expr) {
      case 'blink':
        closedEye(EYE_L, EYE_Y, false);
        closedEye(EYE_R, EYE_Y, false);
        mouth('smile');
        break;
      case 'happy':
        closedEye(EYE_L, EYE_Y, true);
        closedEye(EYE_R, EYE_Y, true);
        mouth('happy');
        break;
      case 'wink':
        closedEye(EYE_L, EYE_Y, true);
        openEye(EYE_R, EYE_Y, false);
        mouth('wink');
        break;
      case 'sparkle':
        openEye(EYE_L, EYE_Y, true);
        openEye(EYE_R, EYE_Y, true);
        mouth('sparkle');
        break;
      case 'sing':
        closedEye(EYE_L, EYE_Y, true);
        closedEye(EYE_R, EYE_Y, true);
        mouth('sing');
        break;
      default:
        openEye(EYE_L, EYE_Y, false);
        openEye(EYE_R, EYE_Y, false);
        mouth('smile');
    }
    texture.needsUpdate = true;
  }

  draw('smile');
  return { texture, draw };
}
