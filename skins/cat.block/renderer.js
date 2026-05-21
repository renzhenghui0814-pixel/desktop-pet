// desktop-pet/skins/cat.block/renderer.js
/**
 * 积木猫渲染器 — 完全由乐高砖块堆叠而成。
 * 身体=多块 2xN 砖拼接，头=2x2 方砖，腿=长条梁+圆板脚。
 * 每种颜色有 top/front/side/outline 四色（3D 砖块效果）。
 */
import { COLORS } from '../../src/constants.js';

// 从 COLORS 派生的砖块色板
const toHex = (arr) => '#' + arr.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const lighten = (hex, amt) => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  const l = v => Math.min(255, Math.round(v + (255 - v) * amt));
  return `rgb(${l(r)},${l(g)},${l(b)})`;
};
const darken = (hex, amt) => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  const d = v => Math.max(0, Math.round(v * (1 - amt)));
  return `rgb(${d(r)},${d(g)},${d(b)})`;
};

// 经典乐高五色（从 COLORS 动态派生，响应主题切换）
function brickColors() {
  const c = (arr) => '#' + arr.map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
  const l = (hex, amt) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    const f = v => Math.min(255, Math.round(v + (255 - v) * amt));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  };
  const d = (hex, amt) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    const f = v => Math.max(0, Math.round(v * (1 - amt)));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  };
  const mk = (main, dark, light) => ({
    top: l(main, 0.25), front: main, side: d(main, 0.25), outline: d(main, 0.45),
  });
  return {
    red:    mk(c(COLORS.bodyMain), c(COLORS.bodyDark), c(COLORS.bodyLight)),
    yellow: mk(c(COLORS.irisInner), c(COLORS.irisOuter), c(COLORS.irisInner)),
    blue:   mk(c(COLORS.irisOuter), c(COLORS.pupil), c(COLORS.irisInner)),
    white:  mk(c(COLORS.belly), c(COLORS.bellyShade), c(COLORS.belly)),
    black:  mk(c(COLORS.outline), c(COLORS.pupil), c(COLORS.outline)),
  };
}

export class CatBlock {
  draw(ctx, st, options) {
    const a = st.action;
    const sleeping = a === 'sleeping';
    this._B = brickColors(); // 每帧从 COLORS 动态派生，响应主题切换

    ctx.save();

    // 阴影
    ctx.fillStyle = sleeping ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.ellipse(120, sleeping ? 164 : 156, 46, 5, 0, 0, Math.PI * 2); ctx.fill();

    if (!sleeping) this._drawTail(ctx, st.tailPhase, st.walkPhase);
    this._drawBody(ctx, st, sleeping);
    this._drawHead(ctx, st, sleeping);
    if (!sleeping) this._drawLegs(ctx, st);

    if (sleeping) this._drawZzz(ctx, st.tailPhase);
    ctx.restore();
  }

  // ---- 单个砖块（3D 效果） ----
  _brick(ctx, x, y, w, h, d, color, studs = 0) {
    const c = this._B[color] || this._B.red;
    const hw = w / 2, hd = d || 6;

    // 前面
    const fg = ctx.createLinearGradient(0, y, 0, y + h);
    fg.addColorStop(0, c.front);
    fg.addColorStop(0.3, lighten(c.front, 0.06));
    fg.addColorStop(1, darken(c.front, 0.08));
    ctx.fillStyle = fg;
    this._roundRect(ctx, x - hw, y, w, h, 3); ctx.fill();

    // 侧面
    ctx.fillStyle = c.side;
    ctx.beginPath();
    ctx.moveTo(x + hw, y); ctx.lineTo(x + hw + 4, y - 3); ctx.lineTo(x + hw + 4, y + h - 3); ctx.lineTo(x + hw, y + h);
    ctx.closePath(); ctx.fill();

    // 顶面
    ctx.fillStyle = c.top;
    ctx.beginPath();
    ctx.moveTo(x - hw + 3, y); ctx.lineTo(x - hw + 3, y - hd);
    ctx.lineTo(x + hw + 1, y - hd - 3); ctx.lineTo(x + hw + 4, y - 3);
    ctx.lineTo(x + hw, y);
    ctx.closePath(); ctx.fill();

    // 轮廓
    ctx.strokeStyle = c.outline; ctx.lineWidth = 1.2; ctx.lineJoin = 'round';
    this._roundRect(ctx, x - hw, y, w, h, 3); ctx.stroke();
    // 顶面轮廓
    ctx.beginPath();
    ctx.moveTo(x - hw + 3, y - hd); ctx.lineTo(x + hw + 1, y - hd - 3); ctx.lineTo(x + hw + 4, y - 3);
    ctx.stroke();

    // 螺柱
    if (studs > 0) {
      const ss = w / (studs + 1);
      for (let i = 0; i < studs; i++) {
        const sx = x - hw + ss * (i + 1) + 1;
        const sy = y - hd - 1;
        const sr = Math.min(w / (studs * 2.2), hd * 0.35);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(sx, sy, sr, sr * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = c.outline; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.ellipse(sx, sy, sr, sr * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
  }

  // ---- 身体：多块砖拼接 ----
  _drawBody(ctx, st, sleeping) {
    const cx = 120, cy = sleeping ? 138 : 108;
    if (sleeping) {
      this._brick(ctx, cx + 8, cy, 50, 16, 6, 'red', 4);
      ctx.fillStyle = this._B.white.front;
      ctx.beginPath(); ctx.ellipse(cx + 14, cy + 2, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
      return;
    }

    // 主体：2x6 红砖
    this._brick(ctx, cx, cy + 2, 48, 22, 8, 'red', 4);
    // 腹部：2x3 白砖叠在前面
    this._brick(ctx, cx + 2, cy + 16, 30, 12, 4, 'white', 2);
    // 顶部装饰：1x4 黄砖
    this._brick(ctx, cx - 2, cy - 10, 28, 8, 4, 'yellow', 2);
  }

  // ---- 头部：2x2 方砖 + 圆点眼 ----
  _drawHead(ctx, st, sleeping) {
    const cx = 120, cy = sleeping ? 120 : 54;

    if (sleeping) {
      this._brick(ctx, cx + 10, cy, 22, 14, 6, 'red', 1);
      for (const side of [-1, 1]) {
        ctx.strokeStyle = this._B.black.outline; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx + side * 6 + 10, cy + 3, 3, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
      }
      return;
    }

    // 头部：2x3 红砖
    this._brick(ctx, cx, cy, 30, 22, 8, 'red', 2);

    // 耳朵：1x1 斜面砖（蓝/黄色各一）
    for (let side = -1; side <= 1; side += 2) {
      const ec = side === -1 ? 'blue' : 'yellow';
      this._slopeBrick(ctx, cx + side * 18, cy - 14, 8, 12, ec);
    }

    // 眼睛：白色 1x1 圆砖（带黑色瞳孔）
    if (st.blink) {
      for (const side of [-1, 1]) {
        ctx.fillStyle = this._B.red.front;
        ctx.fillRect(cx + side * 8 - 5, cy - 2, 10, 3);
        ctx.strokeStyle = this._B.red.outline; ctx.lineWidth = 1;
        ctx.strokeRect(cx + side * 8 - 5, cy - 2, 10, 3);
      }
    } else {
      for (const side of [-1, 1]) {
        const ex = cx + side * 8;
        ctx.fillStyle = this._B.white.front;
        ctx.beginPath(); ctx.ellipse(ex, cy, 6, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = this._B.white.outline; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(ex, cy, 6, 7, 0, 0, Math.PI * 2); ctx.stroke();
        // 瞳孔
        ctx.fillStyle = this._B.black.front;
        ctx.beginPath(); ctx.ellipse(ex + st.lookDir.x, cy + st.lookDir.y * 0.5, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
        // 高光螺柱
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(ex - 2, cy - 2, 1.2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
      }
    }

    // 鼻子：红色 1x1 圆板
    ctx.fillStyle = this._B.red.front;
    ctx.beginPath(); ctx.ellipse(cx, cy + 6, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = this._B.red.outline; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy + 6, 3, 2.5, 0, 0, Math.PI * 2); ctx.stroke();

    // 嘴
    if (st.meowOpen > 0.3) {
      ctx.fillStyle = this._B.black.front;
      ctx.beginPath(); ctx.ellipse(cx, cy + 12, 4, 2 + st.meowOpen * 4, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = this._B.red.outline; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + 10); ctx.lineTo(cx, cy + 12); ctx.lineTo(cx + 4, cy + 10);
      ctx.stroke();
    }
  }

  // ---- 斜面砖（耳朵） ----
  _slopeBrick(ctx, x, y, w, h, color) {
    const c = this._B[color];
    const hw = w / 2;
    ctx.fillStyle = c.front;
    ctx.beginPath();
    ctx.moveTo(x, y - h); ctx.lineTo(x - hw, y + h); ctx.lineTo(x + hw, y + h);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.side;
    ctx.beginPath();
    ctx.moveTo(x, y - h); ctx.lineTo(x + hw, y + h); ctx.lineTo(x + hw + 2, y + h - 2);
    ctx.lineTo(x, y - h + 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = c.outline; ctx.lineWidth = 1.2; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y - h); ctx.lineTo(x - hw, y + h); ctx.lineTo(x + hw, y + h);
    ctx.closePath(); ctx.stroke();
    // 顶部螺柱
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(x, y - h + 3, 2, 1.2, 0, 0, Math.PI * 2); ctx.fill();
  }

  // ---- 腿：1xN 长条梁 + 圆板脚 ----
  _drawLegs(ctx, st) {
    const cx = 120, cy = 108;
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const swing = Math.sin(st.walkPhase + i * Math.PI) * 3;
      const fx = i === 0 ? cx + side * 14 + 10 + swing : cx + side * 18;
      const fy = 150;

      // 腿柱：1x2 蓝色砖
      this._brick(ctx, fx, fy - 8, 9, 14, 4, i === 0 ? 'blue' : 'yellow', 1);

      // 脚：黑色圆板
      ctx.fillStyle = this._B.black.front;
      ctx.beginPath(); ctx.ellipse(fx, fy + 6, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = this._B.black.outline; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(fx, fy + 6, 7, 4, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }

  // ---- 尾巴：1x1 圆砖串 ----
  _drawTail(ctx, phase, walkPhase) {
    const bx = 80, by = 116;
    const sw = Math.sin(phase * 1.3) * 6;
    const colors = ['red', 'white', 'red', 'white'];

    ctx.save();
    for (let i = 3; i >= 0; i--) {
      const t = i / 3;
      const tx = bx - i * 7 + sw * t;
      const ty = by - i * i * 1.2;
      const r = 5.5 - i * 0.7;
      const c = this._B[colors[i]];

      const g = ctx.createRadialGradient(tx - r * 0.2, ty - r * 0.2, r * 0.05, tx, ty, r);
      g.addColorStop(0, c.top);
      g.addColorStop(0.7, c.front);
      g.addColorStop(1, c.side);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(tx, ty, r, r * 0.82, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = c.outline; ctx.lineWidth = 1; ctx.stroke();
      // 螺柱
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(tx, ty - r * 0.35, r * 0.32, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  _drawZzz(ctx, phase) {
    const x = 148, y = 28;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const oy = -i * 14 + Math.sin(phase * 2 + i) * 5;
      ctx.fillStyle = `rgba(100,70,30,${0.3 + i * 0.2})`;
      ctx.font = `bold ${12 + i * 4}px "Microsoft YaHei",sans-serif`;
      ctx.fillText('z', x + i * 6, y + oy);
    }
    ctx.restore();
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  getBounds() { return { w: 180, h: 150 }; }
}
