/**
 * 暗影深渊龙 — 纯龙形 + 修长吻部 + 裂瞳 + 锯齿牙 + 翼膜
 */
import { COLORS } from '../../constants.js';
import { r } from '../../utils/Colors.js';

export class CatDemon {
  draw(ctx, s, st, blinking, tailPhase, meowOpen, lookDir, walkPhase) {
    const sleeping = st === 'sleeping';
    ctx.save();

    // 暗影
    ctx.fillStyle = sleeping ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(s.bodyX, sleeping ? 160 : 155, 52, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 翅膀（在身体后面）
    if (!sleeping) this._wings(ctx, s, tailPhase);

    // 尾巴
    if (!sleeping) this._tail(ctx, s, tailPhase);

    // 身体
    this._body(ctx, s, st, sleeping);

    // 腿部
    if (!sleeping) this._legs(ctx, s, st, walkPhase);

    // 头部
    this._head(ctx, s, st, sleeping, blinking, meowOpen, lookDir);

    if (sleeping) this._zzz(ctx, s, tailPhase);
    ctx.restore();
  }

  // ── 龙身 ──
  _body(ctx, s, st, sleeping) {
    const cx = s.bodyX, cy = s.bodyY, rx = s.bodyRX, ry = s.bodyRY;

    const bodyGrad = ctx.createRadialGradient(cx - rx * 0.2, cy - ry * 0.35, rx * 0.08, cx, cy, rx);
    bodyGrad.addColorStop(0, r(COLORS.bodyLight, 1));
    bodyGrad.addColorStop(0.3, r(COLORS.bodyMain, 1));
    bodyGrad.addColorStop(0.7, r(COLORS.bodyMain, 0.9));
    bodyGrad.addColorStop(1, r(COLORS.bodyDark, 1));

    if (sleeping) {
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx + 14, ry - 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.3); ctx.lineWidth = 2; ctx.stroke();
      return;
    }

    // 龙身：修长的椭圆
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.7, cy - ry * 0.8);
    ctx.bezierCurveTo(cx - rx - 3, cy - ry * 0.3, cx - rx - 3, cy + ry * 0.6, cx - rx * 0.6, cy + ry);
    ctx.bezierCurveTo(cx - rx * 0.15, cy + ry * 1.05, cx + rx * 0.15, cy + ry * 1.05, cx + rx * 0.6, cy + ry);
    ctx.bezierCurveTo(cx + rx + 3, cy + ry * 0.6, cx + rx + 3, cy - ry * 0.3, cx + rx * 0.7, cy - ry * 0.8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = r(COLORS.outline, 0.3); ctx.lineWidth = 2.5; ctx.stroke();

    // 腹甲（深色鳞片纹）
    ctx.fillStyle = r(COLORS.bellyShade, 0.5);
    ctx.beginPath(); ctx.ellipse(cx, cy + ry * 0.25, rx * 0.5, ry * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    // 腹甲中线
    ctx.strokeStyle = r(COLORS.outline, 0.2); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy - ry * 0.2); ctx.lineTo(cx, cy + ry * 0.7); ctx.stroke();
    // 腹甲横纹
    for (let i = 0; i < 3; i++) {
      const yy = cy + ry * 0.05 + i * ry * 0.2;
      ctx.beginPath(); ctx.moveTo(cx - rx * 0.2, yy); ctx.lineTo(cx + rx * 0.2, yy + ry * 0.05); ctx.stroke();
    }

    // 背棘（沿背部一排尖刺）
    ctx.fillStyle = r(COLORS.bodyDark, 0.9);
    for (let i = 0; i < 5; i++) {
      const sx = cx - rx * 0.45 + i * rx * 0.22;
      const sy = cy - ry * 0.78;
      ctx.beginPath();
      ctx.moveTo(sx - 2, sy + 6);
      ctx.lineTo(sx + 2, sy - 8 - i * 2);
      ctx.lineTo(sx + 6, sy + 6);
      ctx.closePath(); ctx.fill();
    }
  }

  // ── 龙头 ──
  _head(ctx, s, st, sleeping, blinking, meowOpen, lookDir) {
    const cx = s.headX, cy = s.headY;
    const hr = 24;

    if (sleeping) {
      // 蜷缩龙头
      ctx.fillStyle = r(COLORS.bodyMain, 0.9);
      ctx.beginPath(); ctx.ellipse(cx + 5, cy + 4, 22, 12, 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.25); ctx.lineWidth = 2; ctx.stroke();
      // 闭眼
      for (const side of [-1, 1]) {
        ctx.strokeStyle = r(COLORS.outline, 0.5); ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx + side * 8, cy + 3, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      }
      return;
    }

    ctx.save();

    // 龙头主体：修长的吻部
    const headGrad = ctx.createRadialGradient(cx - 2, cy - 4, 3, cx, cy, hr + 4);
    headGrad.addColorStop(0, r(COLORS.bodyLight, 1));
    headGrad.addColorStop(0.4, r(COLORS.bodyMain, 1));
    headGrad.addColorStop(1, r(COLORS.bodyDark, 1));
    ctx.fillStyle = headGrad;

    // 龙头轮廓：前方伸出吻部
    ctx.beginPath();
    // 额头
    ctx.moveTo(cx - 15, cy - 18);
    // 右侧到吻部尖端
    ctx.bezierCurveTo(cx + 8, cy - 22, cx + 32, cy - 10, cx + 38, cy - 2);
    // 下颌
    ctx.bezierCurveTo(cx + 36, cy + 14, cx + 16, cy + 22, cx + 2, cy + 22);
    // 左侧回额头
    ctx.bezierCurveTo(cx - 10, cy + 20, cx - 22, cy + 6, cx - 20, cy - 8);
    ctx.bezierCurveTo(cx - 20, cy - 15, cx - 15, cy - 18, cx - 15, cy - 18);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = r(COLORS.outline, 0.35); ctx.lineWidth = 2; ctx.stroke();

    // 鼻孔（两个小椭圆在吻部前端）
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath(); ctx.ellipse(cx + 32, cy - 4, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 32, cy + 2, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();

    // 眼睛（竖直裂瞳）
    for (const side of [-1, 1]) {
      const ex = cx + side * 10, ey = cy - 5;
      if (blinking) {
        ctx.strokeStyle = r(COLORS.outline, 0.6); ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ex - 6, ey); ctx.lineTo(ex + 6, ey); ctx.stroke();
      } else {
        // 眼白（微黄）
        ctx.fillStyle = r(COLORS.eyeWhite, 1);
        ctx.beginPath(); ctx.ellipse(ex, ey, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = r(COLORS.outline, 0.5); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(ex, ey, 8, 9, 0, 0, Math.PI * 2); ctx.stroke();

        // 虹膜（金色/琥珀径向渐变）
        const irisGrad = ctx.createRadialGradient(ex - 1, ey - 1, 1, ex, ey, 6);
        irisGrad.addColorStop(0, r(COLORS.irisInner, 1));
        irisGrad.addColorStop(0.6, r(COLORS.irisOuter, 1));
        irisGrad.addColorStop(1, 'rgba(30,5,5,0.8)');
        ctx.fillStyle = irisGrad;
        ctx.beginPath(); ctx.ellipse(ex, ey, 6, 7.5, 0, 0, Math.PI * 2); ctx.fill();

        // 竖直裂瞳（细长菱形）
        ctx.fillStyle = r(COLORS.pupil, 1);
        ctx.beginPath();
        ctx.moveTo(ex + lookDir.x, ey - 4.5 + lookDir.y);
        ctx.lineTo(ex + 2 + lookDir.x, ey + lookDir.y);
        ctx.lineTo(ex + lookDir.x, ey + 4.5 + lookDir.y);
        ctx.lineTo(ex - 2 + lookDir.x, ey + lookDir.y);
        ctx.closePath(); ctx.fill();

        // 高光
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(ex - 3, ey - 3.5, 2.5, 3, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.ellipse(ex + 2, ey + 2.5, 1, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      }
    }

    // 眉脊（两道骨突）
    for (const side of [-1, 1]) {
      ctx.fillStyle = r(COLORS.bodyDark, 0.7);
      ctx.beginPath();
      const bx = cx + side * 9;
      ctx.moveTo(bx - 6, cy - 11);
      ctx.quadraticCurveTo(bx, cy - 15, bx + 6, cy - 11);
      ctx.quadraticCurveTo(bx, cy - 9, bx - 6, cy - 11);
      ctx.fill();
    }

    // 锯齿牙
    if (meowOpen > 0.3) {
      const openM = meowOpen * 8;
      ctx.fillStyle = 'rgb(25,5,5)';
      ctx.beginPath(); ctx.ellipse(cx + 20, cy + 12 + openM / 2, 14, 5 + openM, 0.1, 0, Math.PI * 2); ctx.fill();
      // 上牙
      ctx.fillStyle = '#f8f0e8';
      for (let i = 0; i < 4; i++) {
        const tx = cx + 14 + i * 5;
        ctx.beginPath();
        ctx.moveTo(tx - 1.5, cy + 8);
        ctx.lineTo(tx, cy + 13 + openM * 0.6);
        ctx.lineTo(tx + 1.5, cy + 8);
        ctx.closePath(); ctx.fill();
      }
      // 下牙
      for (let i = 0; i < 3; i++) {
        const tx = cx + 17 + i * 5;
        ctx.beginPath();
        ctx.moveTo(tx - 1, cy + 11 + openM * 0.3);
        ctx.lineTo(tx, cy + 13 + openM * 0.8);
        ctx.lineTo(tx + 1, cy + 11 + openM * 0.3);
        ctx.closePath(); ctx.fill();
      }
    } else {
      // 闭合嘴线（锯齿隐藏）
      ctx.strokeStyle = r(COLORS.outline, 0.3); ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + 14, cy + 12);
      ctx.quadraticCurveTo(cx + 22, cy + 14, cx + 28, cy + 10);
      ctx.stroke();
    }

    // 龙角（两对：主角 + 副角）
    for (const side of [-1, 1]) {
      // 主角
      const hbx = cx + side * 4, hby = cy - 14;
      ctx.fillStyle = r(COLORS.bodyDark, 0.9);
      ctx.beginPath();
      ctx.moveTo(hbx - 4 * side, hby + 2);
      ctx.quadraticCurveTo(hbx + side * 14, hby - 18, hbx + side * 5, hby - 36);
      ctx.quadraticCurveTo(hbx - side * 4, hby - 16, hbx + 4 * side, hby);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.3); ctx.lineWidth = 1.5; ctx.stroke();

      // 副角
      const sbx = cx + side * 6, sby = cy - 12;
      ctx.beginPath();
      ctx.moveTo(sbx - 2 * side, sby + 2);
      ctx.quadraticCurveTo(sbx + side * 8, sby - 10, sbx + side * 3, sby - 20);
      ctx.quadraticCurveTo(sbx - side * 2, sby - 8, sbx + 3 * side, sby);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.25); ctx.lineWidth = 1; ctx.stroke();
    }

    ctx.restore();
  }

  // ── 双翼 ──
  _wings(ctx, s, phase) {
    const cx = s.bodyX, cy = s.bodyY, rx = s.bodyRX, ry = s.bodyRY;
    const flap = Math.sin(phase * 0.5) * 4;

    ctx.save();
    for (let side = -1; side <= 1; side += 2) {
      const wx = cx + side * rx * 0.75;
      const wy = cy - ry * 0.4;

      // 翼膜
      const wingGrad = ctx.createLinearGradient(wx, wy, wx + side * 30, wy - 30 + flap);
      wingGrad.addColorStop(0, r(COLORS.bodyDark, 0.8));
      wingGrad.addColorStop(0.5, r(COLORS.bodyMain, 0.4));
      wingGrad.addColorStop(1, r(COLORS.bodyDark, 0.15));
      ctx.fillStyle = wingGrad;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      // 翼尖
      ctx.quadraticCurveTo(wx + side * 28, wy - 30 + flap, wx + side * 20, wy - 24 + flap);
      // 翼膜后缘
      ctx.quadraticCurveTo(wx + side * 14, wy - 10 + flap, wx, wy + 8);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = r(COLORS.outline, 0.2); ctx.lineWidth = 1.5; ctx.stroke();

      // 翼骨（2-3条骨架线）
      ctx.strokeStyle = r(COLORS.outline, 0.25); ctx.lineWidth = 1; ctx.lineCap = 'round';
      for (let i = 0; i < 2; i++) {
        const t = (i + 1) / 3;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + side * (12 + 8 * t), wy - (16 + 12 * t) + flap * t);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ── 龙尾 ──
  _tail(ctx, s, phase) {
    const bx = s.bodyX - s.bodyRX + 2, by = s.bodyY + 8;
    const sw = Math.sin(phase * 1.3) * 7;

    ctx.save();

    // 粗尾根 → 细尾尖的贝塞尔曲线
    ctx.strokeStyle = r(COLORS.tailDark, 0.7); ctx.lineWidth = 15; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx - 14, by + sw, bx - 28, by - 8 + sw);
    ctx.quadraticCurveTo(bx - 38, by - 20, bx - 22, by - 42 + sw * 1.5);
    ctx.stroke();

    ctx.strokeStyle = r(COLORS.tail, 1); ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx - 14, by + sw, bx - 28, by - 8 + sw);
    ctx.quadraticCurveTo(bx - 38, by - 20, bx - 22, by - 42 + sw * 1.5);
    ctx.stroke();

    // 尾脊刺（沿尾部的三角刺）
    ctx.fillStyle = r(COLORS.bodyDark, 0.8);
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const sx = bx - 10 * t - 24 * t * t + sw * t;
      const sy = by + sw * t - 20 * t * t;
      ctx.beginPath();
      ctx.moveTo(sx - 2, sy);
      ctx.lineTo(sx - 4, sy - 8);
      ctx.lineTo(sx + 4, sy - 2);
      ctx.closePath(); ctx.fill();
    }

    // 箭形尾尖
    const tx = bx - 22, ty = by - 42 + sw * 1.5;
    ctx.fillStyle = r(COLORS.bodyDark, 0.9);
    ctx.beginPath();
    ctx.moveTo(tx, ty - 10);
    ctx.lineTo(tx + 6, ty + 2);
    ctx.lineTo(tx - 6, ty + 2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = r(COLORS.outline, 0.3); ctx.lineWidth = 1; ctx.stroke();

    ctx.restore();
  }

  // ── 龙腿 ──
  _legs(ctx, s, st, phase) {
    const bx = s.bodyX, by = s.bodyY, rx = s.bodyRX, ry = s.bodyRY;
    if (st === 'sleeping') return;

    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const front = i === 0;
      const swing = Math.sin(phase + i * Math.PI + (front ? Math.PI : 0)) * 5;
      const hx = front ? bx + side * rx * 0.25 + rx * 0.3 : bx + side * rx * 0.45;
      const hy = by + ry * 0.55;
      const fx = hx + side * 4 + swing;
      const fy = 152;

      ctx.save();
      // 腿（粗壮）
      ctx.strokeStyle = r(COLORS.bodyDark, 0.8); ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.strokeStyle = r(COLORS.bodyMain, 1); ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(fx, fy); ctx.stroke();

      // 龙爪（三趾）
      ctx.fillStyle = r(COLORS.outline, 0.6);
      for (let j = -1; j <= 1; j++) {
        ctx.beginPath();
        ctx.ellipse(fx + j * 4, fy + 3, 3.5, 5, 0.15 * j, 0, Math.PI * 2); ctx.fill();
      }
      // 趾尖
      ctx.fillStyle = 'rgba(240,235,225,0.5)';
      for (let j = -1; j <= 1; j++) {
        ctx.beginPath();
        ctx.ellipse(fx + j * 4, fy + j * 0.5, 1.5, 2, 0, 0, Math.PI * 2); ctx.fill();
      }

      ctx.restore();
    }
  }

  _zzz(ctx, s, phase) {
    const x = s.headX + 30, y = s.headY - 20;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const oy = -i * 14 + Math.sin(phase * 2 + i) * 6;
      const a = 0.25 + i * 0.2 + Math.sin(phase + i) * 0.1;
      ctx.fillStyle = `rgba(200,60,30,${Math.min(1, a)})`;
      ctx.font = `${12 + i * 4}px "Microsoft YaHei",sans-serif`;
      ctx.fillText('z', x + i * 6, y + oy);
    }
    ctx.restore();
  }
}
