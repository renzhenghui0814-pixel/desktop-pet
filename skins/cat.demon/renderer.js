// desktop-pet/skins/cat.demon/renderer.js
/**
 * 暗影恶兽渲染器 — 四足伏地掠食者。
 * 低伏修长身体 + 脊骨外凸 + 不对称多眼 + 弯角 + 倒刺尾 + 暗影粒子。
 */
import { COLORS } from '../../src/constants.js';
import { r } from '../../src/utils/Colors.js';

export class CatDemon {
  draw(ctx, st, options) {
    const a = st.action;
    const sleeping = a === 'sleeping';

    ctx.save();

    // 暗影光环
    ctx.fillStyle = sleeping ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(120, sleeping ? 164 : 158, 56, 6, 0, 0, Math.PI * 2); ctx.fill();

    // 暗影粒子（后层）
    if (!sleeping) this._drawParticles(ctx, st.phase);

    // 尾巴 + 倒刺（后层）
    if (!sleeping) this._drawTail(ctx, st.tailPhase);

    // 后腿（后层）
    if (!sleeping) this._drawLegs(ctx, st, false);

    // 身体 + 脊骨
    this._drawBody(ctx, st, sleeping);

    // 前腿（前层）
    if (!sleeping) this._drawLegs(ctx, st, true);

    // 头部
    this._drawHead(ctx, st, sleeping);

    if (sleeping) this._drawZzz(ctx, st.tailPhase);
    ctx.restore();
  }

  // ===== 四足伏地身体 + 脊骨外凸 =====
  _drawBody(ctx, st, sleeping) {
    const cx = 120, cy = sleeping ? 134 : 116;

    if (sleeping) {
      const bg = ctx.createRadialGradient(cx, cy, 2, cx, cy, 40);
      bg.addColorStop(0, r(COLORS.bodyMain, 0.9));
      bg.addColorStop(1, r(COLORS.bodyDark, 0.95));
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.ellipse(cx + 6, cy, 44, 12, 0.03, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.3); ctx.lineWidth = 2; ctx.stroke();
      return;
    }

    // 低伏修长身体
    const bg = ctx.createLinearGradient(0, cy - 18, 0, cy + 22);
    bg.addColorStop(0, r(COLORS.bodyLight, 0.9));
    bg.addColorStop(0.3, r(COLORS.bodyMain, 1));
    bg.addColorStop(0.7, r(COLORS.bodyMain, 0.85));
    bg.addColorStop(1, r(COLORS.bodyDark, 0.95));
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(cx + 28, cy - 10);
    ctx.bezierCurveTo(cx + 26, cy + 14, cx + 16, cy + 22, cx - 20, cy + 20);
    ctx.bezierCurveTo(cx - 32, cy + 16, cx - 36, cy - 4, cx - 24, cy - 12);
    ctx.bezierCurveTo(cx - 6, cy - 22, cx + 12, cy - 18, cx + 28, cy - 10);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = r(COLORS.outline, 0.35); ctx.lineWidth = 2; ctx.stroke();

    // 熔岩裂痕纹
    ctx.strokeStyle = 'rgba(255,80,20,0.15)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const sx = cx - 15 + i * 18;
      ctx.beginPath();
      ctx.moveTo(sx, cy - 4);
      ctx.quadraticCurveTo(sx + 2 + i * 2, cy + 4, sx - 2, cy + 16);
      ctx.stroke();
    }

    // 脊骨外凸（沿背部的三角形骨刺）
    ctx.fillStyle = r(COLORS.bodyDark, 0.85);
    for (let i = 0; i < 6; i++) {
      const sx = cx - 22 + i * 10;
      const sy = cy - 14 + (i % 2) * 4;
      ctx.beginPath();
      ctx.moveTo(sx - 3, sy + 4);
      ctx.lineTo(sx, sy - 6 - i * 1.5);
      ctx.lineTo(sx + 3, sy + 4);
      ctx.closePath(); ctx.fill();
    }
  }

  // ===== 宽大头部 + 不对称多眼 + 弯角 + 裂口 =====
  _drawHead(ctx, st, sleeping) {
    const cx = 148, cy = sleeping ? 120 : 70;

    if (sleeping) {
      ctx.fillStyle = r(COLORS.bodyMain, 0.9);
      ctx.beginPath(); ctx.ellipse(cx + 4, cy, 24, 14, 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.3); ctx.lineWidth = 2; ctx.stroke();
      for (const side of [-1, 1]) {
        ctx.strokeStyle = r(COLORS.outline, 0.4); ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx + side * 6, cy + 3, 4, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
      }
      return;
    }

    // 头型：宽大、前方略尖
    const hg = ctx.createRadialGradient(cx - 4, cy - 4, 3, cx, cy, 28);
    hg.addColorStop(0, r(COLORS.bodyLight, 1));
    hg.addColorStop(0.4, r(COLORS.bodyMain, 1));
    hg.addColorStop(1, r(COLORS.bodyDark, 1));
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy - 16);
    ctx.bezierCurveTo(cx + 6, cy - 26, cx + 32, cy - 14, cx + 40, cy - 2);
    ctx.bezierCurveTo(cx + 36, cy + 16, cx + 14, cy + 24, cx - 2, cy + 24);
    ctx.bezierCurveTo(cx - 14, cy + 22, cx - 24, cy + 8, cx - 22, cy - 4);
    ctx.bezierCurveTo(cx - 22, cy - 10, cx - 18, cy - 16, cx - 18, cy - 16);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = r(COLORS.outline, 0.4); ctx.lineWidth = 2.5; ctx.stroke();

    // 多眼：左眼 2 只 + 右眼 1 只（不对称）
    const eyes = [
      { x: cx + 4, y: cy - 4, size: 7 },   // 右眼（正常位置）
      { x: cx - 8, y: cy - 6, size: 8 },   // 左主眼（较大）
      { x: cx - 14, y: cy - 2, size: 4.5 }, // 左副眼（较小，偏移）
    ];

    if (st.blink) {
      for (const eye of eyes) {
        ctx.strokeStyle = r(COLORS.outline, 0.5); ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(eye.x - eye.size, eye.y); ctx.lineTo(eye.x + eye.size, eye.y); ctx.stroke();
      }
    } else {
      for (const eye of eyes) {
        const ex = eye.x + st.lookDir.x * 2, ey = eye.y + st.lookDir.y;
        ctx.fillStyle = r(COLORS.eyeWhite, 1);
        ctx.beginPath(); ctx.ellipse(ex, ey, eye.size, eye.size * 1.1, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = r(COLORS.outline, 0.4); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(ex, ey, eye.size, eye.size * 1.1, 0, 0, Math.PI * 2); ctx.stroke();
        const ig = ctx.createRadialGradient(ex, ey - 1, eye.size * 0.1, ex, ey, eye.size * 0.8);
        ig.addColorStop(0, r(COLORS.irisInner, 1));
        ig.addColorStop(0.7, r(COLORS.irisOuter, 1));
        ig.addColorStop(1, 'rgba(40,5,5,0.8)');
        ctx.fillStyle = ig;
        ctx.beginPath(); ctx.ellipse(ex, ey, eye.size * 0.7, eye.size * 0.85, 0, 0, Math.PI * 2); ctx.fill();
        // 竖裂瞳
        ctx.fillStyle = r(COLORS.pupil, 1);
        ctx.beginPath();
        ctx.moveTo(ex, ey - eye.size * 0.55);
        ctx.lineTo(ex + 1.5, ey); ctx.lineTo(ex, ey + eye.size * 0.55);
        ctx.lineTo(ex - 1.5, ey); ctx.closePath(); ctx.fill();
        // 高光
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(ex - eye.size * 0.3, ey - eye.size * 0.35, 2, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      }
    }

    // 弯角（羊角/恶魔角）
    for (let side = -1; side <= 1; side += 2) {
      const hx = cx + side * 8, hy = cy - 14;
      ctx.fillStyle = r(COLORS.bodyDark, 0.95);
      ctx.beginPath();
      ctx.moveTo(hx - 4 * side, hy + 4);
      ctx.quadraticCurveTo(hx + side * 16, hy - 24, hx + side * 2, hy - 40);
      ctx.quadraticCurveTo(hx - side * 6, hy - 20, hx + 4 * side, hy);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.3); ctx.lineWidth = 1.5; ctx.stroke();
    }

    // 大口裂 + 尖牙
    if (st.meowOpen > 0.3) {
      const open = st.meowOpen * 10;
      ctx.fillStyle = 'rgb(20,5,5)';
      ctx.beginPath(); ctx.ellipse(cx + 22, cy + 12 + open / 2, 15, 5 + open, 0.05, 0, Math.PI * 2); ctx.fill();
      // 上牙
      ctx.fillStyle = '#F0E8D8';
      for (let i = 0; i < 5; i++) {
        const tx = cx + 14 + i * 5;
        ctx.beginPath();
        ctx.moveTo(tx - 1.5, cy + 10);
        ctx.lineTo(tx, cy + 16 + open * 0.4);
        ctx.lineTo(tx + 1.5, cy + 10);
        ctx.closePath(); ctx.fill();
      }
      // 下牙（交错）
      for (let i = 0; i < 4; i++) {
        const tx = cx + 17 + i * 5;
        ctx.beginPath();
        ctx.moveTo(tx - 1, cy + 14 + open * 0.3);
        ctx.lineTo(tx, cy + 18 + open * 0.5);
        ctx.lineTo(tx + 1, cy + 14 + open * 0.3);
        ctx.closePath(); ctx.fill();
      }
    } else {
      ctx.strokeStyle = r(COLORS.outline, 0.4); ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + 16, cy + 14);
      ctx.quadraticCurveTo(cx + 26, cy + 18, cx + 32, cy + 12);
      ctx.stroke();
    }

    // 鼻孔
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath(); ctx.ellipse(cx + 34, cy - 3, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 34, cy + 3, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
  }

  // ===== 四足利爪腿 =====
  _drawLegs(ctx, st, front) {
    const cx = 120, cy = 116;
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const swing = Math.sin(st.walkPhase + i * Math.PI + (front ? 0 : Math.PI)) * 4;
      const hx = front ? cx + side * 8 + 16 : cx + side * 20;
      const hy = cy + 12;
      const px = hx + side * 6 + swing;
      const py = 156;

      // 腿（粗壮暗色）
      ctx.strokeStyle = r(COLORS.bodyDark, 0.8); ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(px, py); ctx.stroke();
      ctx.strokeStyle = r(COLORS.bodyMain, 0.9); ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(px, py); ctx.stroke();

      // 三趾利爪
      ctx.fillStyle = 'rgba(230,225,210,0.5)';
      for (let j = -1; j <= 1; j++) {
        ctx.beginPath();
        ctx.moveTo(px + j * 3, py);
        ctx.lineTo(px + j * 4, py + 6);
        ctx.lineTo(px + j * 2, py + 6);
        ctx.closePath(); ctx.fill();
      }
      // 趾基
      ctx.fillStyle = r(COLORS.outline, 0.5);
      for (let j = -1; j <= 1; j++) {
        ctx.beginPath();
        ctx.ellipse(px + j * 4, py + 1, 3, 4, 0.15 * j, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // ===== 倒刺恶魔尾 =====
  _drawTail(ctx, phase) {
    const bx = 88, by = 122;
    const sw = Math.sin(phase * 1.1) * 6;

    ctx.save();
    ctx.strokeStyle = r(COLORS.tailDark, 0.6); ctx.lineWidth = 13; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx - 18, by + 12 + sw, bx - 32, by - 2 + sw);
    ctx.quadraticCurveTo(bx - 42, by - 16 + sw * 0.5, bx - 28, by - 40 + sw);
    ctx.stroke();

    ctx.strokeStyle = r(COLORS.tail, 1); ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx - 18, by + 12 + sw, bx - 32, by - 2 + sw);
    ctx.quadraticCurveTo(bx - 42, by - 16 + sw * 0.5, bx - 28, by - 40 + sw);
    ctx.stroke();

    // 倒刺
    ctx.fillStyle = r(COLORS.bodyDark, 0.8);
    for (let i = 0; i < 5; i++) {
      const t = (i + 1) / 6;
      const stx = bx - 14 * t - 30 * t * t + sw * t;
      const sty = by + 4 * t - 24 * t * t;
      ctx.beginPath();
      ctx.moveTo(stx - 2, sty - 1);
      ctx.lineTo(stx - 5, sty - 7 + (i % 2) * 3);
      ctx.lineTo(stx + 2, sty - 1);
      ctx.closePath(); ctx.fill();
    }

    // 尾尖箭头
    const tx = bx - 28, ty = by - 40 + sw;
    ctx.fillStyle = r(COLORS.bodyDark, 0.9);
    ctx.beginPath();
    ctx.moveTo(tx, ty - 10);
    ctx.lineTo(tx + 7, ty + 2);
    ctx.lineTo(tx - 7, ty + 2);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ===== 暗影粒子 =====
  _drawParticles(ctx, phase) {
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const px = 40 + Math.sin(phase * 0.7 + i) * 30 + i * 16;
      const py = 40 + Math.cos(phase * 0.9 + i * 0.8) * 20 + i * 8;
      const a = 0.1 + Math.sin(phase * 1.5 + i) * 0.08;
      ctx.fillStyle = `rgba(255,60,20,${Math.max(0.05, a)})`;
      ctx.beginPath();
      ctx.ellipse(px, py, 1.5 + i * 0.2, 1.5 + i * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawZzz(ctx, phase) {
    const x = 172, y = 46;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const oy = -i * 14 + Math.sin(phase * 2 + i) * 6;
      ctx.fillStyle = `rgba(200,60,30,${0.25 + i * 0.2})`;
      ctx.font = `${12 + i * 4}px "Microsoft YaHei",sans-serif`;
      ctx.fillText('z', x + i * 6, y + oy);
    }
    ctx.restore();
  }

  getBounds() { return { w: 180, h: 150 }; }
}
