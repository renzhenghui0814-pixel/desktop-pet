// desktop-pet/skins/cat.realistic/renderer.js
/**
 * 写实猫渲染器 — 流线型躯干 + 杏仁竖瞳 + 虎斑纹 + 长尾
 * 独立于骨架，完全自主的身体结构定义。
 */
import { COLORS } from '../../src/constants.js';
import { r } from '../../src/utils/Colors.js';

export class CatRealistic {

  /** @param {CanvasRenderingContext2D} ctx */
  /** @param {AnimationState} st */
  draw(ctx, st, options) {
    const a = st.action;
    const sleeping = a === 'sleeping';
    const sitting = a === 'sitting';

    ctx.save();

    // ---- 底面阴影 ----
    ctx.fillStyle = sleeping ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.05)';
    ctx.beginPath();
    ctx.ellipse(120, sleeping ? 168 : 158, sleeping ? 60 : 48, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // ---- 尾巴（后层，长尾 S 弯） ----
    if (!sleeping) this._drawTail(ctx, st.tailPhase);

    // ---- 后腿（后层） ----
    if (!sleeping) this._drawLegs(ctx, st, false);

    // ---- 流线型身体 ----
    this._drawBody(ctx, st, sleeping, sitting);

    // ---- 前腿（前层） ----
    if (!sleeping) this._drawLegs(ctx, st, true);

    // ---- 头部 + 面部 ----
    this._drawHead(ctx, st, sleeping);

    if (sleeping) this._drawZzz(ctx, st.tailPhase);

    ctx.restore();
  }

  // ========= 流线型身体 =========
  _drawBody(ctx, st, sleeping, sitting) {
    const cx = 120, cy = sitting ? 108 : 100;
    const bodyLen = sleeping ? 72 : 58;
    const bodyH = sleeping ? 16 : 30;

    if (sleeping) {
      const bg = ctx.createRadialGradient(cx, cy, 2, cx, cy, bodyLen);
      bg.addColorStop(0, r(COLORS.bodyLight, 0.95));
      bg.addColorStop(0.5, r(COLORS.bodyMain, 0.9));
      bg.addColorStop(1, r(COLORS.bodyDark, 0.85));
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(cx + 10, cy + 2, bodyLen, bodyH + 4, 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.12); ctx.lineWidth = 1.5; ctx.stroke();
      return;
    }

    const bg = ctx.createLinearGradient(0, cy - bodyH, 0, cy + bodyH);
    bg.addColorStop(0, r(COLORS.bodyLight, 1));
    bg.addColorStop(0.3, r(COLORS.bodyMain, 0.95));
    bg.addColorStop(0.7, r(COLORS.bodyMain, 0.85));
    bg.addColorStop(1, r(COLORS.bodyDark, 0.9));
    ctx.fillStyle = bg;

    ctx.beginPath();
    ctx.moveTo(cx + 32, cy - 12);
    ctx.bezierCurveTo(cx + 34, cy + 8, cx + 28, cy + bodyH + 4, cx - 14, cy + bodyH);
    ctx.bezierCurveTo(cx - 38, cy + bodyH - 2, cx - 42, cy - 2, cx - 26, cy - bodyH + 4);
    ctx.bezierCurveTo(cx - 8, cy - bodyH - 4, cx + 14, cy - bodyH + 2, cx + 32, cy - 12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = r(COLORS.outline, 0.08); ctx.lineWidth = 1.5; ctx.stroke();

    // 虎斑纹
    ctx.strokeStyle = r(COLORS.stripe, 0.15); ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const sx = cx - 5 + i * 12;
      ctx.beginPath();
      ctx.moveTo(sx, cy - bodyH + 6);
      ctx.quadraticCurveTo(sx - 2, cy - 4 + i * 3, sx + 1, cy + 2);
      ctx.stroke();
    }

    // 肚皮浅色区域
    ctx.fillStyle = r(COLORS.belly, 0.4);
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 4, bodyLen * 0.35, bodyH * 0.55, 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========= 头部（圆中带尖 + 杏仁眼 + 竖瞳） =========
  _drawHead(ctx, st, sleeping) {
    const cx = 148, cy = sleeping ? 110 : 62;

    if (sleeping) {
      ctx.fillStyle = r(COLORS.bodyMain, 0.9);
      ctx.beginPath(); ctx.ellipse(cx, cy, 28, 14, 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.12); ctx.lineWidth = 1.5; ctx.stroke();
      for (const side of [-1, 1]) {
        ctx.strokeStyle = r(COLORS.eyeOutline, 0.4); ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx + side * 8, cy + 1, 6, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
      }
      return;
    }

    const hr = 26;
    const hg = ctx.createRadialGradient(cx - 3, cy - 4, 2, cx, cy, hr);
    hg.addColorStop(0, r(COLORS.bodyLight, 1));
    hg.addColorStop(0.4, r(COLORS.bodyMain, 0.95));
    hg.addColorStop(1, r(COLORS.bodyDark, 0.85));
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy, hr, hr + 3, 0.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = r(COLORS.outline, 0.08); ctx.lineWidth = 1.5; ctx.stroke();

    // M 额纹
    ctx.strokeStyle = r(COLORS.stripe, 0.2); ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - hr + 6); ctx.lineTo(cx - 7, cy - hr + 14);
    ctx.moveTo(cx + 2, cy - hr + 4); ctx.lineTo(cx + 2, cy - hr + 13);
    ctx.moveTo(cx + 6, cy - hr + 6); ctx.lineTo(cx + 11, cy - hr + 14);
    ctx.stroke();

    // 尖耳 + 绒毛内衬
    for (let side = -1; side <= 1; side += 2) {
      const bx = cx + side * hr * 0.6, by = cy - hr * 0.7;
      const tx = cx + side * (hr + 10), ty = cy - hr * 1.6;
      ctx.fillStyle = r(COLORS.bodyDark, 1);
      ctx.beginPath();
      ctx.moveTo(bx - side * 4, by + 6);
      ctx.bezierCurveTo(tx - side * 6, ty + 4, tx - side * 2, ty, tx, ty);
      ctx.bezierCurveTo(tx + side * 2, ty, tx + side * 6, ty + 4, bx + side * 4, by + 6);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.08); ctx.lineWidth = 1.2; ctx.stroke();
      // 耳内绒毛
      ctx.fillStyle = r(COLORS.innerEar, 0.6);
      ctx.beginPath();
      ctx.moveTo(bx - side * 2, by + 7);
      ctx.bezierCurveTo(tx - side * 4, ty + 6, tx - side * 1, ty + 4, tx - 3 * side, ty + 5);
      ctx.bezierCurveTo(tx + side, ty + 4, bx + side * 1, by + 7, bx + side * 2, by + 8);
      ctx.closePath(); ctx.fill();
    }

    // 杏仁眼 + 竖瞳
    if (st.blink) {
      for (const side of [-1, 1]) {
        ctx.strokeStyle = r(COLORS.eyeOutline, 0.5); ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx + side * 10 - 8, cy - 1); ctx.lineTo(cx + side * 10 + 8, cy - 1); ctx.stroke();
      }
    } else {
      for (const side of [-1, 1]) {
        const ex = cx + side * 10 + st.lookDir.x * 2, ey = cy - 1 + st.lookDir.y;
        ctx.fillStyle = '#fffefc';
        ctx.beginPath(); ctx.ellipse(ex, ey, 10, 9, 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = r(COLORS.eyeOutline, 0.3); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(ex, ey, 10, 9, 0.05, 0, Math.PI * 2); ctx.stroke();
        const iris = ctx.createRadialGradient(ex - 1, ey - 1, 1, ex, ey, 6.5);
        iris.addColorStop(0, r(COLORS.irisInner, 1));
        iris.addColorStop(0.7, r(COLORS.irisOuter, 1));
        iris.addColorStop(1, r(COLORS.eyeOutline, 0.5));
        ctx.fillStyle = iris;
        ctx.beginPath(); ctx.ellipse(ex, ey, 6.5, 7.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = r(COLORS.pupil, 1);
        ctx.beginPath(); ctx.ellipse(ex, ey, 2, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(ex - 3, ey - 3, 3, 3.5, -0.2, 0, Math.PI * 2); ctx.fill();
      }
    }

    // 鼻子
    const nx = cx + 4, ny = cy + 8;
    ctx.fillStyle = r(COLORS.noseOut, 0.5);
    ctx.beginPath(); ctx.moveTo(nx - 5, ny - 1); ctx.lineTo(nx + 5, ny - 1); ctx.lineTo(nx, ny + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = r(COLORS.nose, 0.9);
    ctx.beginPath(); ctx.moveTo(nx - 3.5, ny); ctx.lineTo(nx + 3.5, ny); ctx.lineTo(nx, ny + 3); ctx.closePath(); ctx.fill();

    // 嘴
    if (st.meowOpen > 0.3) {
      const o = st.meowOpen * 9;
      ctx.fillStyle = 'rgb(60,25,20)';
      ctx.beginPath(); ctx.ellipse(nx + 1, ny + 5 + o / 2, 6, 4 + o, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = r(COLORS.mouth, 0.3); ctx.lineWidth = 1; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(nx, ny + 2); ctx.quadraticCurveTo(nx - 4, ny + 8, nx - 7, ny + 6);
      ctx.moveTo(nx, ny + 2); ctx.quadraticCurveTo(nx + 4, ny + 8, nx + 7, ny + 6);
      ctx.stroke();
    }

    // 胡须
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const wy = cy + 8 + i * 5;
        ctx.strokeStyle = r(COLORS.whisker, 0.2 + i * 0.05); ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(cx + side * 8, wy);
        ctx.quadraticCurveTo(cx + side * 18, wy + side, cx + side * 30, wy + side * 2);
        ctx.stroke();
      }
    }
  }

  // ========= 纤细关节腿 =========
  _drawLegs(ctx, st, front) {
    const a = st.action;
    const cx = 120, cy = a === 'sitting' ? 108 : 100;
    const sleeping = a === 'sleeping';
    if (sleeping) return;

    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const swing = Math.sin(st.walkPhase + i * Math.PI + (front ? Math.PI : 0)) * 4;
      const hx = front ? cx + side * 12 + 18 : cx + side * 18;
      const hy = cy + (a === 'sitting' ? 18 : 24);
      const kx = hx + side * 4 + swing;
      const ky = hy + 16;
      const px = kx + swing * 1.5;
      const py = 156;

      ctx.strokeStyle = r(COLORS.bodyDark, 0.5); ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.stroke();
      ctx.strokeStyle = r(COLORS.bodyMain, 1); ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.stroke();

      ctx.strokeStyle = r(COLORS.bodyDark, 0.5); ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(px, py); ctx.stroke();
      ctx.strokeStyle = r(COLORS.bodyMain, 0.9); ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(px, py); ctx.stroke();

      ctx.fillStyle = r(COLORS.paw, 0.85);
      ctx.beginPath(); ctx.ellipse(px, py, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.08); ctx.lineWidth = 1; ctx.stroke();
    }
  }

  // ========= 长尾（S 弯 + 环纹） =========
  _drawTail(ctx, phase) {
    const bx = 86, by = 108;
    const sw = Math.sin(phase * 1.1) * 7;
    ctx.save();
    ctx.strokeStyle = r(COLORS.tailDark, 0.4); ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx - 22, by + 8 + sw, bx - 35, by - 4 + sw * 1.2);
    ctx.quadraticCurveTo(bx - 46, by - 22 + sw * 0.6, bx - 32, by - 46 + sw);
    ctx.stroke();

    ctx.strokeStyle = r(COLORS.tail, 1); ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx - 22, by + 8 + sw, bx - 35, by - 4 + sw * 1.2);
    ctx.quadraticCurveTo(bx - 46, by - 22 + sw * 0.6, bx - 32, by - 46 + sw);
    ctx.stroke();

    // 环纹
    ctx.strokeStyle = r(COLORS.stripe, 0.18); ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let t = 0.25; t <= 0.85; t += 0.2) {
      const rx = bx - 18 * t - 30 * t * t + sw * t;
      const ry = by + 2 * t - 20 * t * t;
      ctx.beginPath();
      ctx.moveTo(rx - 3, ry - 4); ctx.lineTo(rx + 3, ry + 4);
      ctx.stroke();
    }

    ctx.fillStyle = r(COLORS.tailDark, 0.7);
    ctx.beginPath(); ctx.ellipse(bx - 32, by - 46 + sw, 5, 3.5, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  _drawZzz(ctx, phase) {
    const x = 170, y = 30;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const oy = -i * 14 + Math.sin(phase * 2 + i) * 6;
      ctx.fillStyle = `rgba(140,160,220,${0.3 + i * 0.2})`;
      ctx.font = `${12 + i * 4}px "Microsoft YaHei",sans-serif`;
      ctx.fillText('z', x + i * 6, y + oy);
    }
    ctx.restore();
  }

  getBounds() { return { w: 180, h: 150 }; }
}
