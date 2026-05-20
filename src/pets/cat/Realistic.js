/**
 * 水彩绘本猫 — 有机统一轮廓 + 大眼睛 + 肉球爪 + 蓬松尾
 */
import { COLORS } from '../../constants.js';
import { r } from '../../utils/Colors.js';

export class CatRealistic {
  draw(ctx, s, st, blinking, tailPhase, meowOpen, lookDir, walkPhase) {
    const sleeping = st === 'sleeping';
    ctx.save();

    // 柔和的底面阴影
    ctx.fillStyle = sleeping ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.ellipse(s.bodyX, sleeping ? 162 : 156, sleeping ? 50 : 42, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 尾巴（在身体后面）
    if (!sleeping) this._tail(ctx, s, tailPhase);

    // 后腿（在身体后面）
    if (!sleeping) this._backLegs(ctx, s, st, walkPhase);

    // 统一轮廓：身体→脖子→头 一条连续曲线
    this._silhouette(ctx, s, st);

    // 前腿（在身体前面）
    this._frontLegs(ctx, s, st, walkPhase);

    // 面部细节
    this._face(ctx, s, st, blinking, meowOpen, lookDir);

    // 皮毛纹理
    this._fur(ctx, s, tailPhase);

    if (sleeping) this._zzz(ctx, s, tailPhase);
    ctx.restore();
  }

  // ── 统一轮廓 ──
  _silhouette(ctx, s, st) {
    const bx = s.bodyX, by = s.bodyY, rx = s.bodyRX, ry = s.bodyRY;
    const hx = s.headX, hy = s.headY, sleeping = st === 'sleeping', hr = 28;

    const bodyGrad = ctx.createRadialGradient(bx - rx * 0.2, by - ry * 0.3, rx * 0.08, bx, by, rx);
    bodyGrad.addColorStop(0, r(COLORS.bodyLight, 1));
    bodyGrad.addColorStop(0.3, r(COLORS.bodyMain, 0.95));
    bodyGrad.addColorStop(0.7, r(COLORS.bodyMain, 0.85));
    bodyGrad.addColorStop(1, r(COLORS.bodyDark, 0.9));

    if (sleeping) {
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.ellipse(bx, by, rx + 14, ry - 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.12); ctx.lineWidth = 1.5; ctx.stroke();
    } else {
      // 梨形身体
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(bx - rx * 0.85, by - ry * 0.7);
      ctx.bezierCurveTo(bx - rx - 2, by - ry * 0.15, bx - rx - 2, by + ry * 0.7, bx - rx * 0.7, by + ry);
      ctx.bezierCurveTo(bx - rx * 0.15, by + ry * 1.1, bx + rx * 0.15, by + ry * 1.1, bx + rx * 0.7, by + ry);
      ctx.bezierCurveTo(bx + rx + 2, by + ry * 0.7, bx + rx + 2, by - ry * 0.15, bx + rx * 0.85, by - ry * 0.7);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.1); ctx.lineWidth = 2; ctx.stroke();

      // 肚皮
      ctx.fillStyle = r(COLORS.belly, 0.5);
      ctx.beginPath(); ctx.ellipse(bx + 2, by + ry * 0.15, rx * 0.48, ry * 0.58, -0.02, 0, Math.PI * 2); ctx.fill();

      // 虎斑纹
      ctx.strokeStyle = r(COLORS.stripe, 0.18); ctx.lineWidth = 3.5; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const sx = bx - rx * 0.4 + i * rx * 0.4, sy = by - ry * 0.55;
        ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx - 3, by - ry * 0.05 + i * 5, sx + 2, by + ry * 0.1); ctx.stroke();
      }

      // 天鹅颈
      const neckTop = hy + hr - 6, neckBot = by - ry * 0.4;
      ctx.strokeStyle = r(COLORS.bodyMain, 0.7); ctx.lineWidth = 20; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx - 4, neckBot);
      ctx.quadraticCurveTo(bx - 14, (neckTop + neckBot) / 2, hx - 2, neckTop); ctx.stroke();
      ctx.strokeStyle = r(COLORS.bodyLight, 0.4); ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(bx - 2, neckBot);
      ctx.quadraticCurveTo(bx - 10, (neckTop + neckBot) / 2, hx, neckTop); ctx.stroke();

      // 圆头
      const headGrad = ctx.createRadialGradient(hx - hr * 0.15, hy - hr * 0.2, hr * 0.06, hx, hy, hr);
      headGrad.addColorStop(0, r(COLORS.bodyLight, 1));
      headGrad.addColorStop(0.35, r(COLORS.bodyMain, 0.95));
      headGrad.addColorStop(0.75, r(COLORS.bodyMain, 0.85));
      headGrad.addColorStop(1, r(COLORS.bodyDark, 0.9));
      ctx.fillStyle = headGrad;
      ctx.beginPath(); ctx.ellipse(hx, hy, hr, hr + 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.1); ctx.lineWidth = 1.5; ctx.stroke();

      // 额头浅色 + M 纹
      ctx.fillStyle = r(COLORS.bodyLight, 0.25);
      ctx.beginPath(); ctx.ellipse(hx, hy - 6, hr * 0.5, hr * 0.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.stripe, 0.22); ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hx - 3, hy - hr + 6); ctx.lineTo(hx - 8, hy - hr + 15);
      ctx.moveTo(hx + 1, hy - hr + 4); ctx.lineTo(hx + 1, hy - hr + 14);
      ctx.moveTo(hx + 5, hy - hr + 6); ctx.lineTo(hx + 10, hy - hr + 15);
      ctx.stroke();

      // 耳朵
      this._ears(ctx, hx, hy, hr);
    }
  }

  _ears(ctx, cx, cy, hr) {
    for (let side = -1; side <= 1; side += 2) {
      const bx = cx + side * hr * 0.55, by = cy - hr * 0.55;
      const tx = cx + side * (hr + 8), ty = cy - hr * 1.55;
      ctx.fillStyle = r(COLORS.bodyDark, 1);
      ctx.beginPath();
      ctx.moveTo(bx - side * 6, by + 6);
      ctx.bezierCurveTo(tx - side * 5, ty + 5, tx - side * 2, ty + 2, tx, ty);
      ctx.bezierCurveTo(tx + side * 2, ty + 2, tx + side * 5, ty + 5, bx + side * 6, by + 6);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.08); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = r(COLORS.innerEar, 0.75);
      ctx.beginPath();
      ctx.moveTo(bx - side * 3, by + 8);
      ctx.bezierCurveTo(tx - side * 4, ty + 7, tx - side * 2, ty + 5, tx - 4 * side, ty + 6);
      ctx.bezierCurveTo(tx + side, ty + 5, bx + side * 2, by + 8, bx + side * 3, by + 9);
      ctx.closePath(); ctx.fill();
    }
  }

  // ── 面部 ──
  _face(ctx, s, st, blinking, meowOpen, lookDir) {
    const cx = s.headX, cy = s.headY, sleeping = st === 'sleeping';
    this._eyes(ctx, cx, cy, sleeping, blinking, lookDir);
    this._noseMouth(ctx, cx, cy, sleeping, meowOpen);
    if (!sleeping) this._whiskers(ctx, cx, cy);
    ctx.fillStyle = r(COLORS.blush, 0.18);
    ctx.beginPath(); ctx.ellipse(cx - 17, cy + 5, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 17, cy + 5, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
  }

  _eyes(ctx, cx, cy, sleeping, blinking, lookDir) {
    if (sleeping) {
      for (const side of [-1, 1]) {
        ctx.strokeStyle = r(COLORS.eyeOutline, 0.5); ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx + side * 10, cy - 1, 7, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      }
      return;
    }
    if (blinking) {
      for (const side of [-1, 1]) {
        ctx.strokeStyle = r(COLORS.eyeOutline, 0.6); ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx + side * 10 - 8, cy - 2); ctx.lineTo(cx + side * 10 + 8, cy - 2); ctx.stroke();
      }
      return;
    }
    for (const side of [-1, 1]) {
      const ex = cx + side * 10 + lookDir.x * 2.5, ey = cy - 2 + lookDir.y;
      ctx.save(); ctx.translate(ex, ey);
      ctx.fillStyle = '#fffefc';
      ctx.beginPath(); ctx.ellipse(0, 1, 11, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.eyeOutline, 0.35); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(0, 1, 11, 10, 0, 0, Math.PI * 2); ctx.stroke();
      const iris = ctx.createRadialGradient(-1, -1, 1, 0, 0, 7);
      iris.addColorStop(0, r(COLORS.irisInner, 1));
      iris.addColorStop(0.5, r(COLORS.irisInner, 0.9));
      iris.addColorStop(0.85, r(COLORS.irisOuter, 1));
      iris.addColorStop(1, r(COLORS.eyeOutline, 0.6));
      ctx.fillStyle = iris;
      ctx.beginPath(); ctx.ellipse(0, 1, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = r(COLORS.pupil, 1);
      ctx.beginPath(); ctx.ellipse(0, 1, 2.5, 5.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(-3.5, -3, 3.5, 4, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(3, 3.5, 1.5, 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.ellipse(-5, -1, 1, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  _noseMouth(ctx, cx, cy, sleeping, meowOpen) {
    const nx = cx, ny = cy + 7;
    ctx.fillStyle = r(COLORS.noseOut, 0.55);
    ctx.beginPath(); ctx.moveTo(nx - 5, ny - 1); ctx.lineTo(nx + 5, ny - 1); ctx.lineTo(nx, ny + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = r(COLORS.nose, 1);
    ctx.beginPath(); ctx.moveTo(nx - 4, ny); ctx.lineTo(nx + 4, ny); ctx.lineTo(nx, ny + 3.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.ellipse(nx - 1, ny, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    if (sleeping) {
      ctx.strokeStyle = r(COLORS.mouth, 0.4); ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(nx, ny + 2, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    } else if (meowOpen > 0.3) {
      const o = meowOpen * 10;
      ctx.fillStyle = 'rgb(65,30,25)';
      ctx.beginPath(); ctx.ellipse(nx + 2, ny + 4 + o / 2, 7, 4.5 + o, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgb(190,85,95)';
      ctx.beginPath(); ctx.ellipse(nx + 2, ny + 5 + o, 3.5, 2.5 + o * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = r(COLORS.mouth, 0.35); ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(nx, ny + 2); ctx.quadraticCurveTo(nx - 4, ny + 7, nx - 8, ny + 6);
      ctx.moveTo(nx, ny + 2); ctx.quadraticCurveTo(nx + 4, ny + 7, nx + 8, ny + 6);
      ctx.stroke();
    }
  }

  _whiskers(ctx, cx, cy) {
    for (const side of [-1, 1]) {
      const bx = cx + side * 8;
      for (let i = 0; i < 3; i++) {
        const dy = i * 5 - 5;
        ctx.strokeStyle = r(COLORS.whisker, 0.25 + i * 0.05); ctx.lineWidth = 0.7 + i * 0.1;
        ctx.beginPath();
        ctx.moveTo(bx, cy + 9 + dy);
        ctx.quadraticCurveTo(bx + side * 14, cy + 9 + dy + side, bx + side * 28, cy + 9 + dy + side * 2);
        ctx.stroke();
      }
    }
  }

  // ── 蓬松短尾 ──
  _tail(ctx, s, phase) {
    const bx = s.bodyX - s.bodyRX * 0.75, by = s.bodyY - 2, sw = Math.sin(phase * 1.2) * 6;
    const mx = bx - 10 + sw * 0.5, my = by - 8 + sw;
    const tx = bx - 18 + sw, ty = by - 16 + sw * 1.5;
    ctx.save();
    ctx.strokeStyle = r(COLORS.tailDark, 0.5); ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(mx, my, tx, ty); ctx.stroke();
    ctx.strokeStyle = r(COLORS.tail, 1); ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(mx, my, tx, ty); ctx.stroke();
    ctx.strokeStyle = r(COLORS.bodyLight, 0.3); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(bx + 1, by + 1); ctx.quadraticCurveTo(mx + 1, my + 1, tx + 1, ty + 1); ctx.stroke();
    ctx.fillStyle = r(COLORS.tailDark, 0.7);
    ctx.beginPath(); ctx.ellipse(tx, ty, 5, 4, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ── 后腿 ──
  _backLegs(ctx, s, st, phase) {
    const bx = s.bodyX, by = s.bodyY, rx = s.bodyRX, ry = s.bodyRY;
    if (st === 'sleeping') return;
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const swing = Math.sin(phase + i * Math.PI) * 5;
      const hx = bx + side * rx * 0.5, hy = by + ry * 0.55;
      const px = bx + side * rx * 0.55 + swing, py = 150;
      ctx.strokeStyle = r(COLORS.bodyDark, 0.7); ctx.lineWidth = 13; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(px + side * 2, (hy + py) / 2, px, py); ctx.stroke();
      ctx.strokeStyle = r(COLORS.bodyMain, 1); ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(px + side * 2, (hy + py) / 2, px, py); ctx.stroke();
      ctx.fillStyle = r(COLORS.paw, 0.9);
      ctx.beginPath(); ctx.ellipse(px, py, 8, 5.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.12); ctx.lineWidth = 1; ctx.stroke();
    }
  }

  // ── 前腿 + 肉球 ──
  _frontLegs(ctx, s, st, phase) {
    const bx = s.bodyX, by = s.bodyY, rx = s.bodyRX, ry = s.bodyRY;
    if (st === 'sleeping') {
      ctx.fillStyle = r(COLORS.bodyMain, 0.85);
      ctx.beginPath(); ctx.ellipse(bx + 30, by + 4, 10, 7, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = r(COLORS.paw, 0.75);
      ctx.beginPath(); ctx.ellipse(bx + 35, by + 6, 8, 5, -0.1, 0, Math.PI * 2); ctx.fill();
      return;
    }
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const swing = Math.sin(phase + i * Math.PI + Math.PI) * 5;
      const hx = bx + side * rx * 0.25 + rx * 0.3, hy = by + ry * 0.42;
      const px = bx + side * rx * 0.3 + rx * 0.35 + swing, py = 150;
      ctx.strokeStyle = r(COLORS.bodyDark, 0.6); ctx.lineWidth = 13; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(px, (hy + py) / 2, px, py); ctx.stroke();
      ctx.strokeStyle = r(COLORS.bodyLight, 1); ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(px, (hy + py) / 2, px, py); ctx.stroke();
      ctx.fillStyle = r(COLORS.paw, 0.9);
      ctx.beginPath(); ctx.ellipse(px, py, 8.5, 5.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.1); ctx.lineWidth = 1; ctx.stroke();
      // 三颗肉球
      const bc = r(COLORS.innerEar, 0.8), bx2 = px - 2, by2 = py - 1;
      ctx.fillStyle = bc;
      ctx.beginPath(); ctx.ellipse(bx2 - 3, by2, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(bx2 + 3, by2, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = r(COLORS.innerEar, 0.9);
      ctx.beginPath(); ctx.ellipse(bx2, by2 + 2.5, 3.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── 皮毛纹理 ──
  _fur(ctx, s, phase) {
    const bx = s.bodyX, by = s.bodyY, rx = s.bodyRX, ry = s.bodyRY;
    const hx = s.headX, hy = s.headY;
    ctx.save();
    ctx.strokeStyle = r(COLORS.bodyDark, 0.08); ctx.lineWidth = 0.6;
    for (let i = 0; i < 80; i++) {
      const a = (i / 80) * Math.PI * 2;
      const cx = bx + Math.cos(a) * rx * 0.9, cy = by + Math.sin(a) * ry * 0.9;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * (3 + (i % 4)), cy + Math.sin(a) * (3 + (i % 4)));
      ctx.stroke();
    }
    for (let i = 0; i < 30; i++) {
      const a = -Math.PI * 0.8 + (i / 30) * Math.PI * 0.6;
      const cx = hx + Math.cos(a) * 26, cy = hy + Math.sin(a) * 28;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * 3, cy + Math.sin(a) * 3 - 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  _zzz(ctx, s, phase) {
    const x = s.headX + 24, y = s.headY - 20;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const oy = -i * 14 + Math.sin(phase * 2 + i) * 6;
      const a = 0.3 + i * 0.2 + Math.sin(phase + i) * 0.1;
      ctx.fillStyle = `rgba(140,160,220,${Math.min(1, a)})`;
      ctx.font = `${12 + i * 4}px "Microsoft YaHei",sans-serif`;
      ctx.fillText('z', x + i * 6, y + oy);
    }
    ctx.restore();
  }
}
