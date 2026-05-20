/**
 * 赛博招财猫 — 瓷白外壳 + OLED面屏 + 金色关节 + 霓虹灯带
 */
import { COLORS } from '../../constants.js';

// 将 COLORS 键转为 CSS rgb() / rgba()，方便在渐变中使用
const cl = (k) => `rgb(${COLORS[k].join(',')})`;
const ca = (k, a = 1) => `rgba(${COLORS[k].join(',')},${a})`;
const clt = (k, amt) => {
  const [r_, g_, b_] = COLORS[k];
  const l = (v) => Math.min(255, Math.round(v + (255 - v) * amt));
  return `rgb(${l(r_)},${l(g_)},${l(b_)})`;
};
const cdk = (k, amt) => {
  const [r_, g_, b_] = COLORS[k];
  const d = (v) => Math.max(0, Math.round(v * (1 - amt)));
  return `rgb(${d(r_)},${d(g_)},${d(b_)})`;
};

export class CatRobot {
  draw(ctx, s, st, blinking, tailPhase, meowOpen, lookDir, walkPhase) {
    const sleeping = st === 'sleeping';
    ctx.save();

    // 底面阴影
    ctx.fillStyle = sleeping ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(s.bodyX, sleeping ? 158 : 152, 38, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 尾巴（后层）
    if (!sleeping) this._tail(ctx, s, tailPhase);

    // 后腿（后层）
    if (!sleeping) this._legs(ctx, s, st, walkPhase, false);

    // 身体
    this._body(ctx, s, st, sleeping);

    // 前腿（前层）
    if (!sleeping) this._legs(ctx, s, st, walkPhase, true);

    // 头部
    this._head(ctx, s, st, sleeping, blinking, meowOpen, lookDir);

    if (sleeping) this._zzz(ctx, s, tailPhase);
    ctx.restore();
  }

  // ── 瓷白机身 ──
  _body(ctx, s, st, sleeping) {
    const cx = s.bodyX, cy = s.bodyY, rx = s.bodyRX, ry = s.bodyRY;

    const outlineColor = ca('outline', 0.4);
    if (sleeping) {
      // 扁平睡姿
      const grad = ctx.createRadialGradient(cx, cy - ry * 0.3, rx * 0.05, cx, cy, rx);
      grad.addColorStop(0, clt('bodyLight', 0.2));
      grad.addColorStop(0.4, cl('bodyLight'));
      grad.addColorStop(1, cdk('bodyDark', 0.1));
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx + 10, ry - 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = outlineColor; ctx.lineWidth = 2; ctx.stroke();
      return;
    }

    // 梨形机身 + 光泽渐变（主题色）
    const bodyGrad = ctx.createRadialGradient(cx - rx * 0.25, cy - ry * 0.35, rx * 0.06, cx, cy, rx);
    bodyGrad.addColorStop(0, clt('bodyLight', 0.3));
    bodyGrad.addColorStop(0.25, cl('bodyLight'));
    bodyGrad.addColorStop(0.5, cl('bodyMain'));
    bodyGrad.addColorStop(0.8, cdk('bodyMain', 0.15));
    bodyGrad.addColorStop(1, cdk('bodyDark', 0.05));
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(cx - rx * 0.8, cy - ry * 0.7);
    ctx.bezierCurveTo(cx - rx - 2, cy - ry * 0.2, cx - rx - 2, cy + ry * 0.7, cx - rx * 0.65, cy + ry);
    ctx.bezierCurveTo(cx - rx * 0.12, cy + ry * 1.08, cx + rx * 0.12, cy + ry * 1.08, cx + rx * 0.65, cy + ry);
    ctx.bezierCurveTo(cx + rx + 2, cy + ry * 0.7, cx + rx + 2, cy - ry * 0.2, cx + rx * 0.8, cy - ry * 0.7);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = outlineColor; ctx.lineWidth = 2; ctx.stroke();

    // 高光弧
    ctx.strokeStyle = ca('bodyLight', 0.7); ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx - rx * 0.05, cy - ry * 0.15, rx * 0.65, -0.9, -0.15);
    ctx.stroke();

    // 肚皮面板（主题 belly 色）
    ctx.fillStyle = ca('belly', 0.8);
    ctx.beginPath(); ctx.ellipse(cx + 1, cy + ry * 0.12, rx * 0.55, ry * 0.62, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ca('bellyShade', 0.35); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(cx + 1, cy + ry * 0.12, rx * 0.55, ry * 0.62, 0, 0, Math.PI * 2); ctx.stroke();

    // 霓虹灯带 —— 环绕机身
    ctx.strokeStyle = 'rgba(0,230,255,0.4)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.3, rx * 0.7, ry * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
    // 发光外层
    ctx.strokeStyle = 'rgba(0,230,255,0.12)'; ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(cx, cy - ry * 0.3, rx * 0.7, ry * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 金色铃铛
    const bellX = cx - 10, bellY = cy - ry + 8;
    const bellGrad = ctx.createRadialGradient(bellX - 2, bellY - 3, 1, bellX, bellY, 12);
    bellGrad.addColorStop(0, '#ffe680');
    bellGrad.addColorStop(0.5, '#f0c040');
    bellGrad.addColorStop(1, '#b89020');
    ctx.fillStyle = bellGrad;
    ctx.beginPath(); ctx.ellipse(bellX, bellY, 11, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(150,110,30,0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(bellX, bellY, 11, 10, 0, 0, Math.PI * 2); ctx.stroke();
    // 铃铛高光
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.ellipse(bellX - 3, bellY - 4, 3, 3, -0.3, 0, Math.PI * 2); ctx.fill();
    // 铃铛缝隙
    ctx.strokeStyle = 'rgba(140,100,20,0.5)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(bellX, bellY + 10, 10, -1.2, 1.2); ctx.stroke();
    // 铃铛芯
    ctx.fillStyle = '#c09030';
    ctx.beginPath(); ctx.ellipse(bellX, bellY + 6, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();

    // 金色关节铆钉（两侧各一排）
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const jx = cx + side * rx * 0.85;
        const jy = cy - ry * 0.3 + i * ry * 0.3;
        ctx.fillStyle = '#f0c840';
        ctx.beginPath(); ctx.ellipse(jx, jy, 3, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.ellipse(jx - 1, jy - 1, 1, 1, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // ── OLED 面屏头部 ──
  _head(ctx, s, st, sleeping, blinking, meowOpen, lookDir) {
    const cx = s.headX, cy = s.headY, hr = 26;

    // 头壳（主题色）
    const headGrad = ctx.createRadialGradient(cx - hr * 0.2, cy - hr * 0.25, hr * 0.05, cx, cy, hr);
    headGrad.addColorStop(0, clt('bodyLight', 0.25));
    headGrad.addColorStop(0.4, cl('bodyLight'));
    headGrad.addColorStop(1, cdk('bodyDark', 0.05));
    ctx.fillStyle = headGrad;
    ctx.beginPath(); ctx.ellipse(cx, cy, hr, hr + 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ca('outline', 0.35); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(cx, cy, hr, hr + 2, 0, 0, Math.PI * 2); ctx.stroke();

    // OLED 屏幕面板
    const scrW = hr * 0.75, scrH = hr * 0.65;
    ctx.fillStyle = '#0a0c14';
    ctx.beginPath();
    this._roundRect(ctx, cx - scrW, cy - scrH, scrW * 2, scrH * 2, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,180,220,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath();
    this._roundRect(ctx, cx - scrW, cy - scrH, scrW * 2, scrH * 2, 8);
    ctx.stroke();

    // 数字眼睛
    if (sleeping) {
      // 睡眠模式：-- --
      for (const side of [-1, 1]) {
        const ex = cx + side * 10;
        ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ex - 6, cy); ctx.lineTo(ex + 6, cy); ctx.stroke();
      }
    } else if (blinking) {
      for (const side of [-1, 1]) {
        const ex = cx + side * 10;
        ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(ex - 7, cy); ctx.lineTo(ex + 7, cy); ctx.stroke();
      }
    } else {
      for (const side of [-1, 1]) {
        const ex = cx + side * 10, ey = cy - 1;
        // 数码眼白
        ctx.fillStyle = '#00e5ff';
        ctx.beginPath(); ctx.ellipse(ex, ey, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
        // 数码瞳孔
        ctx.fillStyle = '#0a0c14';
        ctx.beginPath(); ctx.ellipse(ex + lookDir.x * 2, ey + lookDir.y, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
        // 高光像素
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.ellipse(ex - 3, ey - 4, 2.5, 3, -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(ex + 2 + lookDir.x, ey + 3 + lookDir.y, 1, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      }
    }

    // 数字鼻子（小三角LED）
    ctx.fillStyle = '#ff4444';
    ctx.beginPath(); ctx.moveTo(cx - 3, cy + 9); ctx.lineTo(cx + 3, cy + 9); ctx.lineTo(cx, cy + 13); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,100,100,0.3)';
    ctx.beginPath(); ctx.ellipse(cx, cy + 11, 5, 3, 0, 0, Math.PI * 2); ctx.fill();

    // 数码嘴
    if (meowOpen > 0.3) {
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath(); ctx.ellipse(cx, cy + 18, 6, 4 + meowOpen * 6, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 16);
      ctx.lineTo(cx, cy + 18);
      ctx.lineTo(cx + 5, cy + 16);
      ctx.stroke();
    }

    // 机械胡须（细光线）
    for (const side of [-1, 1]) {
      for (let i = 0; i < 2; i++) {
        const wy = cy + 12 + i * 4;
        ctx.strokeStyle = `rgba(0,180,220,${0.4 + i * 0.15})`; ctx.lineWidth = 1; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + side * 8, wy);
        ctx.lineTo(cx + side * 26, wy + side * 3);
        ctx.stroke();
      }
    }

    // 猫耳（主题色外壳 + 霓虹内衬）
    for (let side = -1; side <= 1; side += 2) {
      const bx = cx + side * (hr - 3), by = cy - hr + 6;
      ctx.fillStyle = cl('bodyLight');
      ctx.beginPath();
      ctx.ellipse(bx, by, 11, 13, side * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ca('outline', 0.35); ctx.lineWidth = 1.5; ctx.stroke();
      // 耳内霓虹（主题 innerEar + 霓虹叠加）
      ctx.fillStyle = ca('innerEar', 0.18);
      ctx.beginPath();
      ctx.ellipse(bx - side * 1, by + 1, 6, 8, side * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── 分段机械尾巴 ──
  _tail(ctx, s, phase) {
    const bx = s.bodyX - s.bodyRX, by = s.bodyY;
    const sw = Math.sin(phase * 1.2) * 5;

    ctx.save();
    // 3段式机械尾
    const segs = [
      { x: bx - 6, y: by + 2 + sw * 0.3 },
      { x: bx - 18, y: by - 6 + sw * 0.7 },
      { x: bx - 26, y: by - 18 + sw },
    ];

    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      const r = 8 - i * 1.5;
      // 金属段（主题色）
      const segGrad = ctx.createRadialGradient(seg.x - 1, seg.y - 1, r * 0.1, seg.x, seg.y, r);
      segGrad.addColorStop(0, clt('bodyLight', 0.2));
      segGrad.addColorStop(0.5, cl('bodyMain'));
      segGrad.addColorStop(1, cdk('bodyDark', 0.05));
      ctx.fillStyle = segGrad;
      ctx.beginPath(); ctx.ellipse(seg.x, seg.y, r, r + 1, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ca('outline', 0.4); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(seg.x, seg.y, r, r + 1, 0, 0, Math.PI * 2); ctx.stroke();

      // 金色连接环
      if (i < segs.length - 1) {
        const mx = (seg.x + segs[i + 1].x) / 2;
        const my = (seg.y + segs[i + 1].y) / 2;
        ctx.strokeStyle = 'rgba(220,180,40,0.6)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(seg.x, seg.y); ctx.lineTo(mx, my); ctx.stroke();
      }
    }

    // 尾尖红色LED
    const tip = segs[segs.length - 1];
    ctx.fillStyle = '#ff3040';
    ctx.beginPath(); ctx.ellipse(tip.x, tip.y, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,48,64,0.3)';
    ctx.beginPath(); ctx.ellipse(tip.x, tip.y, 8, 8, 0, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // ── 机械腿 ──
  _legs(ctx, s, st, phase, front) {
    const bx = s.bodyX, by = s.bodyY, rx = s.bodyRX, ry = s.bodyRY;
    if (st === 'sleeping') return;

    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const swing = Math.sin(phase + i * Math.PI + (front ? Math.PI : 0)) * 5;
      const fx = (front ? bx + side * rx * 0.25 + rx * 0.3 : bx + side * rx * 0.5) + swing;
      const fy = 152;

      ctx.save();
      // 腿柱（主题色）
      const legGrad = ctx.createLinearGradient(fx - 5, fy - 8, fx + 5, fy);
      legGrad.addColorStop(0, cl('bodyLight'));
      legGrad.addColorStop(0.5, cl('bodyMain'));
      legGrad.addColorStop(1, cdk('bodyDark', 0.1));
      ctx.fillStyle = legGrad;
      this._roundRect(ctx, fx - 5, fy - 8, 10, 14, 5); ctx.fill();
      ctx.strokeStyle = ca('outline', 0.3); ctx.lineWidth = 1.5;
      ctx.beginPath(); this._roundRect(ctx, fx - 5, fy - 8, 10, 14, 5); ctx.stroke();

      // 金色关节
      ctx.fillStyle = '#f0c840';
      ctx.beginPath(); ctx.ellipse(fx, fy - 6, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();

      // 脚垫（主题色）
      ctx.fillStyle = cdk('bodyDark', 0.05);
      ctx.beginPath(); ctx.ellipse(fx, fy + 4, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = ca('outline', 0.3); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(fx, fy + 4, 8, 5, 0, 0, Math.PI * 2); ctx.stroke();

      ctx.restore();
    }
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  _zzz(ctx, s, phase) {
    const x = s.headX + 22, y = s.headY - 18;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const oy = -i * 14 + Math.sin(phase * 2 + i) * 6;
      const a = 0.3 + i * 0.2 + Math.sin(phase + i) * 0.1;
      ctx.fillStyle = `rgba(0,220,255,${Math.min(1, a)})`;
      ctx.font = `${12 + i * 4}px "Microsoft YaHei",sans-serif`;
      ctx.fillText('z', x + i * 6, y + oy);
    }
    ctx.restore();
  }
}
