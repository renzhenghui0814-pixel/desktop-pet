/**
 * 积木猫 — 乐高风格：3D 砖块 + 顶面凸起螺柱 + 多色拼接
 */
import { COLORS } from '../../constants.js';

// RGB 数组 → hex 字符串
const toHex = ([r, g, b]) => '#' + [r, g, b].map(v => {
  const n = Math.round(v);
  return (n < 16 ? '0' : '') + n.toString(16);
}).join('');

// 颜色辅助 — RGB 数组操作
const lightenRgb = ([r, g, b], amt) => [Math.min(255, Math.round(r + (255 - r) * amt)), Math.min(255, Math.round(g + (255 - g) * amt)), Math.min(255, Math.round(b + (255 - b) * amt))];
const darkenRgb = ([r, g, b], amt) => [Math.max(0, Math.round(r * (1 - amt))), Math.max(0, Math.round(g * (1 - amt))), Math.max(0, Math.round(b * (1 - amt)))];

// 积木色板 — 从当前 COLORS 动态派生，响应主题切换
let BK = {};

function rebuildBK() {
  const bellyShade = COLORS.bellyShade || COLORS.belly;
  BK = {
    orange: {
      top: toHex(lightenRgb(COLORS.bodyMain, 0.18)),
      front: toHex(COLORS.bodyMain),
      side: toHex(COLORS.bodyDark),
      outline: toHex(COLORS.outline),
    },
    tan: {
      top: toHex(COLORS.belly),
      front: toHex(bellyShade),
      side: toHex(darkenRgb(bellyShade, 0.15)),
      outline: toHex(darkenRgb(bellyShade, 0.3)),
    },
    white: {
      top: '#ffffff', front: '#f0f0f0', side: '#d8d8d8', outline: '#b0b0b0',
    },
    black: {
      top: '#505050', front: '#2a2a2a', side: '#1a1a1a', outline: '#000000',
    },
    red: {
      top: toHex(COLORS.innerEar),
      front: toHex(COLORS.nose),
      side: toHex(darkenRgb(COLORS.nose, 0.15)),
      outline: toHex(darkenRgb(COLORS.nose, 0.3)),
    },
    darkGray: {
      top: toHex(lightenRgb(COLORS.bodyDark, 0.25)),
      front: toHex(COLORS.bodyDark),
      side: toHex(darkenRgb(COLORS.bodyDark, 0.15)),
      outline: toHex(darkenRgb(COLORS.bodyDark, 0.3)),
    },
  };
}

export class CatBlock {
  draw(ctx, s, st, blinking, tailPhase, meowOpen, lookDir, walkPhase) {
    // 每帧重建色板以响应主题切换
    rebuildBK();
    const sleeping = st === 'sleeping';
    ctx.save();

    // 底面阴影
    ctx.fillStyle = sleeping ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(s.bodyX, sleeping ? 158 : 153, 42, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!sleeping) this._tail(ctx, s, tailPhase);
    if (!sleeping) this._legs(ctx, s, st, walkPhase, false);

    this._body(ctx, s, st, sleeping);

    if (!sleeping) this._legs(ctx, s, st, walkPhase, true);
    this._head(ctx, s, st, sleeping, blinking, meowOpen, lookDir);

    if (sleeping) this._zzz(ctx, s, tailPhase);
    ctx.restore();
  }

  // ═══ 绘制单个乐高砖块 ═══
  // 正面视角，能看到顶面 + 前面 + 微侧立体感
  _brick(ctx, x, y, w, h, d, color, studRows, studCols) {
    const c = BK[color] || BK.orange;
    const hw = w / 2, hd = d || 6;

    // 前面（主色）
    ctx.fillStyle = c.front;
    ctx.beginPath();
    this._roundRect(ctx, x - hw, y, w, h, 3);
    ctx.fill();

    // 前面高光条
    const frontGrad = ctx.createLinearGradient(0, y, 0, y + h);
    frontGrad.addColorStop(0, c.front);
    frontGrad.addColorStop(0.3, this._lighten(c.front, 0.08));
    frontGrad.addColorStop(1, this._darken(c.front, 0.1));
    ctx.fillStyle = frontGrad;
    ctx.beginPath();
    this._roundRect(ctx, x - hw, y, w, h, 3);
    ctx.fill();

    // 顶面（3D 效果的顶部凸起）
    ctx.fillStyle = c.top;
    ctx.beginPath();
    ctx.moveTo(x - hw + 4, y);
    ctx.lineTo(x - hw + 4, y - hd);
    ctx.lineTo(x + hw - 4, y - hd);
    ctx.lineTo(x + hw - 4, y);
    ctx.closePath();
    ctx.fill();

    // 顶面左侧微侧
    ctx.fillStyle = this._darken(c.top, 0.06);
    ctx.beginPath();
    ctx.moveTo(x - hw + 4, y);
    ctx.lineTo(x - hw + 2, y - hd + 2);
    ctx.lineTo(x - hw + 6, y - hd + 2);
    ctx.lineTo(x - hw + 4 + 4, y);
    ctx.fill();

    // 轮廓线
    ctx.strokeStyle = c.outline; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    this._roundRect(ctx, x - hw, y, w, h, 3);
    ctx.stroke();

    // 顶面轮廓
    ctx.beginPath();
    ctx.moveTo(x - hw + 4, y);
    ctx.lineTo(x - hw + 4, y - hd);
    ctx.lineTo(x + hw - 4, y - hd);
    ctx.lineTo(x + hw - 4, y);
    ctx.stroke();

    // 螺柱（顶面的圆柱凸起）
    if (studRows > 0 && studCols > 0) {
      const sx = w / (studCols + 1);
      const sy = hd / (studRows + 1);
      const sr = Math.min(w / studCols, hd / studRows) * 0.28;

      for (let row = 0; row < studRows; row++) {
        for (let col = 0; col < studCols; col++) {
          const studX = x - hw + 4 + sx * (col + 1);
          const studY = y - hd * 0.5 + (row - (studRows - 1) / 2) * sy;

          // 螺柱阴影
          ctx.fillStyle = this._darken(c.top, 0.12);
          ctx.beginPath();
          ctx.ellipse(studX, studY + 1, sr * 1.15, sr * 0.65, 0, 0, Math.PI * 2);
          ctx.fill();

          // 螺柱主体
          const studGrad = ctx.createRadialGradient(studX - sr * 0.2, studY - sr * 0.3, sr * 0.05, studX, studY, sr);
          studGrad.addColorStop(0, '#ffffff');
          studGrad.addColorStop(0.5, c.top);
          studGrad.addColorStop(1, this._darken(c.top, 0.15));
          ctx.fillStyle = studGrad;
          ctx.beginPath();
          ctx.ellipse(studX, studY, sr, sr * 0.58, 0, 0, Math.PI * 2);
          ctx.fill();

          // 螺柱轮廓
          ctx.strokeStyle = c.outline; ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(studX, studY, sr, sr * 0.58, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }

  // ═══ 身体 — 4x3 大砖块 ═══
  _body(ctx, s, st, sleeping) {
    const cx = s.bodyX, cy = s.bodyY;
    if (sleeping) {
      ctx.fillStyle = BK.orange.front;
      ctx.beginPath(); ctx.ellipse(cx, cy, 38, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = BK.orange.outline; ctx.lineWidth = 2; ctx.stroke();
      return;
    }
    // 主身体砖块 4x3
    this._brick(ctx, cx, cy + 2, 52, 30, 10, 'orange', 2, 4);

    // 肚皮板（浅色 2x2 砖块叠在身体前面下方）
    this._brick(ctx, cx, cy + 14, 28, 14, 4, 'tan', 0, 2);
  }

  // ═══ 头部 — 3x3 砖块 + 耳朵 ═══
  _head(ctx, s, st, sleeping, blinking, meowOpen, lookDir) {
    const cx = s.headX, cy = s.headY;

    if (sleeping) {
      ctx.fillStyle = BK.orange.front;
      ctx.beginPath(); ctx.ellipse(cx + 4, cy + 4, 18, 11, 0.1, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = BK.orange.outline; ctx.lineWidth = 2; ctx.stroke();
      for (const side of [-1, 1]) {
        ctx.strokeStyle = BK.orange.outline; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx + side * 7, cy + 3, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      }
      return;
    }

    // 主头部砖块
    this._brick(ctx, cx, cy, 36, 26, 10, 'orange', 2, 2);

    // 耳朵 — 斜面砖（三角形）
    for (let side = -1; side <= 1; side += 2) {
      const ex = cx + side * 20, ey = cy - 15;
      this._slopeBrick(ctx, ex, ey, 10, 14, 8, 'orange', side);
    }

    // 眼睛 — 白色 1x1 光面砖
    for (const side of [-1, 1]) {
      const ex = cx + side * 9, ey = cy - 2;
      if (blinking) {
        ctx.fillStyle = BK.orange.front;
        ctx.fillRect(ex - 6, ey - 1, 12, 3);
        ctx.strokeStyle = BK.orange.outline; ctx.lineWidth = 1;
        ctx.strokeRect(ex - 6, ey - 1, 12, 3);
      } else {
        // 白眼砖
        this._brick(ctx, ex, ey, 11, 9, 2, 'white', 0, 1);
        // 瞳孔 — 黑色小圆板
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(ex + lookDir.x * 1.5, ey + lookDir.y * 0.5, 3, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // 高光
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(ex - 2, ey - 2, 1.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 鼻子 — 红色 1x1 圆板
    ctx.fillStyle = BK.red.front;
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    const noseGrad = ctx.createRadialGradient(cx - 1, cy + 3, 0.5, cx, cy + 4, 4);
    noseGrad.addColorStop(0, '#ff8888');
    noseGrad.addColorStop(1, BK.red.front);
    ctx.fillStyle = noseGrad;
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = BK.red.outline; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, 4, 3, 0, 0, Math.PI * 2); ctx.stroke();

    // 嘴
    if (meowOpen > 0.3) {
      const open = meowOpen * 7;
      ctx.fillStyle = '#2a1a10';
      ctx.beginPath(); ctx.ellipse(cx + 2, cy + 11, 5, 3 + open, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = BK.orange.outline; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 9);
      ctx.lineTo(cx, cy + 12);
      ctx.lineTo(cx + 6, cy + 9);
      ctx.stroke();
    }
  }

  // ── 斜面砖（耳朵） ──
  _slopeBrick(ctx, x, y, w, h, d, color, side) {
    const c = BK[color] || BK.orange;
    const hw = w / 2;
    // 前面（三角形）
    ctx.fillStyle = c.front;
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x - hw, y + h);
    ctx.lineTo(x + hw, y + h);
    ctx.closePath();
    ctx.fill();

    // 斜面
    ctx.fillStyle = c.top;
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x - hw, y + h);
    ctx.lineTo(x - hw + 2, y + h - 2);
    ctx.lineTo(x, y - h + d);
    ctx.closePath();
    ctx.fill();

    // 轮廓
    ctx.strokeStyle = c.outline; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    ctx.lineTo(x - hw, y + h);
    ctx.lineTo(x + hw, y + h);
    ctx.closePath();
    ctx.stroke();

    // 小螺柱
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(x, y - h + 3, 2, 1.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c.outline; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(x, y - h + 3, 2, 1.2, 0, 0, Math.PI * 2); ctx.stroke();
  }

  // ═══ 尾巴 — 1x1 圆砖链 ═══
  _tail(ctx, s, phase) {
    const bx = s.bodyX - s.bodyRX * 0.8, by = s.bodyY + 6;
    const sw = Math.sin(phase * 1.3) * 6;

    ctx.save();
    const segs = 4;
    const colors = ['orange', 'darkGray', 'orange', 'darkGray'];
    for (let i = segs - 1; i >= 0; i--) {
      const t = i / (segs - 1);
      const tx = bx - i * 8 + sw * t;
      const ty = by - i * i * 1.2;
      const r = 6 - i * 0.8; // 越远越小
      const c = BK[colors[i]] || BK.orange;

      // 圆砖主体
      const g = ctx.createRadialGradient(tx - r * 0.2, ty - r * 0.2, r * 0.05, tx, ty, r);
      g.addColorStop(0, c.top);
      g.addColorStop(0.7, c.front);
      g.addColorStop(1, c.side);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(tx, ty, r, r * 0.82, 0, 0, Math.PI * 2);
      ctx.fill();

      // 顶面小螺柱
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(tx, ty - r * 0.35, r * 0.35, r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = c.outline; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(tx, ty, r, r * 0.82, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ═══ 腿 — 1x2 立柱砖 ═══
  _legs(ctx, s, st, phase, front) {
    const bx = s.bodyX, by = s.bodyY, rx = s.bodyRX, ry = s.bodyRY;
    if (st === 'sleeping') return;

    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const swing = Math.sin(phase + i * Math.PI + (front ? Math.PI : 0)) * 4;
      const fx = (front ? bx + side * rx * 0.3 + rx * 0.42 : bx + side * rx * 0.58) + swing;
      const fy = 148;

      ctx.save();
      // 1x2 立柱砖
      const c = front ? BK.orange : BK.darkGray;
      const legGrad = ctx.createLinearGradient(0, fy - 8, 0, fy + 4);
      legGrad.addColorStop(0, c.top);
      legGrad.addColorStop(0.3, c.front);
      legGrad.addColorStop(1, c.side);
      ctx.fillStyle = legGrad;

      ctx.beginPath();
      this._roundRect(ctx, fx - 5, fy - 6, 10, 16, 3);
      ctx.fill();

      // 顶面小螺柱
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(fx, fy - 5, 3, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = c.outline; ctx.lineWidth = 1.3;
      ctx.beginPath();
      this._roundRect(ctx, fx - 5, fy - 6, 10, 16, 3);
      ctx.stroke();

      // 脚底平板砖
      ctx.fillStyle = BK.darkGray.front;
      ctx.beginPath();
      this._roundRect(ctx, fx - 7, fy + 7, 14, 5, 2);
      ctx.fill();
      ctx.strokeStyle = BK.darkGray.outline; ctx.lineWidth = 1;
      ctx.beginPath();
      this._roundRect(ctx, fx - 7, fy + 7, 14, 5, 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  _zzz(ctx, s, phase) {
    const x = s.headX + 22, y = s.headY - 22;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const oy = -i * 14 + Math.sin(phase * 2 + i) * 5;
      const a = 0.3 + i * 0.2 + Math.sin(phase + i) * 0.1;
      ctx.fillStyle = `rgba(120,90,40,${Math.min(1, a)})`;
      ctx.font = `bold ${12 + i * 4}px "Microsoft YaHei",sans-serif`;
      ctx.fillText('z', x + i * 6, y + oy);
    }
    ctx.restore();
  }

  // 颜色辅助
  _roundRect(ctx, x, y, w, h, r) {
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
  _lighten(hex, amt) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const l = (v) => Math.min(255, Math.round(v + (255 - v) * amt));
    return `rgb(${l(r)},${l(g)},${l(b)})`;
  }
  _darken(hex, amt) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const d = (v) => Math.max(0, Math.round(v * (1 - amt)));
    return `rgb(${d(r)},${d(g)},${d(b)})`;
  }
}
