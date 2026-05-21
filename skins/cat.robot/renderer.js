// desktop-pet/skins/cat.robot/renderer.js
/**
 * 哆啦猫梦渲染器 — 哆啦A梦风格：蓝色圆球 + 白色肚袋 + 铃铛 + 豆眼 + 无耳
 */
import { COLORS } from '../../src/constants.js';
import { r } from '../../src/utils/Colors.js';

// 从 COLORS 动态派生哆啦A梦色板（响应主题切换）
function doraColors() {
  const c = (arr) => '#' + arr.map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
  const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return {
    blue:      c(COLORS.bodyMain),
    blueDark:  c(COLORS.bodyDark),
    blueLight: c(COLORS.bodyLight),
    white:     c(COLORS.belly),
    whiteDark: c(COLORS.bellyShade),
    red:       c(COLORS.nose),
    redLight:  c(COLORS.innerEar),
    yellow:    c(COLORS.irisInner),
    yellowDark:c(COLORS.irisOuter),
    black:     c(COLORS.pupil),
    pink:      c(COLORS.blush),
  };
}

export class CatRobot {
  draw(ctx, st, options) {
    const a = st.action;
    const sleeping = a === 'sleeping';
    this._D = doraColors(); // 每帧从 COLORS 动态派生，响应主题切换（实例属性，供各子方法访问）

    ctx.save();

    // 阴影
    ctx.fillStyle = sleeping ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.08)';
    ctx.beginPath(); ctx.ellipse(120, sleeping ? 166 : 160, 44, 4, 0, 0, Math.PI * 2); ctx.fill();

    // 后层：短尾
    if (!sleeping) this._drawTail(ctx, st.tailPhase);

    // 身体
    this._drawBody(ctx, st, sleeping);

    // 头部
    this._drawHead(ctx, st, sleeping);

    // 四肢
    if (!sleeping) this._drawLimbs(ctx, st);

    if (sleeping) this._drawZzz(ctx, st.tailPhase);
    ctx.restore();
  }

  _drawBody(ctx, st, sleeping) {
    const cx = 120, cy = sleeping ? 128 : 104;
    const r = sleeping ? 28 : 38;

    // 蓝色圆球身体
    const bg = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.05, cx, cy, r);
    bg.addColorStop(0, this._D.blueLight);
    bg.addColorStop(0.5, this._D.blue);
    bg.addColorStop(1, this._D.blueDark);
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.ellipse(cx, cy, r, r + 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1.5; ctx.stroke();

    if (sleeping) return;

    // 白色圆肚皮
    ctx.fillStyle = this._D.white;
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, r * 0.78, r * 0.72, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1; ctx.stroke();

    // 四次元百宝袋
    ctx.fillStyle = this._D.white;
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.45, r * 0.38, r * 0.28, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this._D.whiteDark; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.45, r * 0.38, r * 0.28, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    // 口袋弧形缝线
    ctx.strokeStyle = this._D.whiteDark; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.45, r * 0.38, Math.PI * 1.02, Math.PI * 1.98);
    ctx.stroke();
  }

  _drawHead(ctx, st, sleeping) {
    const cx = 120, cy = sleeping ? 110 : 52;
    const hr = sleeping ? 20 : 30;

    // 蓝色圆头（完全圆形，无耳）
    const hg = ctx.createRadialGradient(cx - hr * 0.2, cy - hr * 0.25, hr * 0.05, cx, cy, hr);
    hg.addColorStop(0, this._D.blueLight);
    hg.addColorStop(0.5, this._D.blue);
    hg.addColorStop(1, this._D.blueDark);
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.ellipse(cx, cy, hr, hr + 1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1.5; ctx.stroke();

    if (sleeping) {
      for (const side of [-1, 1]) {
        ctx.strokeStyle = this._D.black; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx + side * 6, cy + 2, 4, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
      }
      return;
    }

    // 白色面部区域
    ctx.fillStyle = this._D.white;
    ctx.beginPath(); ctx.ellipse(cx, cy + 2, hr * 0.85, hr * 0.65, 0, 0, Math.PI * 2); ctx.fill();

    // 豆眼
    if (st.blink) {
      for (const side of [-1, 1]) {
        ctx.strokeStyle = this._D.black; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx + side * 8 - 5, cy + 1); ctx.lineTo(cx + side * 8 + 5, cy + 1); ctx.stroke();
      }
    } else {
      for (const side of [-1, 1]) {
        const ex = cx + side * 8 + st.lookDir.x * 2;
        const ey = cy + 1 + st.lookDir.y;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(ex, ey, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = this._D.black;
        ctx.beginPath(); ctx.ellipse(ex + st.lookDir.x, ey, 3.5, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(ex - 1.5, ey - 2, 2, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      }
    }

    // 小红鼻
    const nx = cx, ny = cy + 10;
    ctx.fillStyle = this._D.red;
    ctx.beginPath(); ctx.ellipse(nx, ny, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this._D.redLight;
    ctx.beginPath(); ctx.ellipse(nx - 1, ny - 1, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();

    // 嘴
    if (st.meowOpen > 0.3) {
      ctx.fillStyle = this._D.red;
      ctx.beginPath(); ctx.ellipse(nx, ny + 9, 7, 3 + st.meowOpen * 6, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = this._D.black; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(nx - 6, ny + 7); ctx.lineTo(nx + 6, ny + 7);
      ctx.stroke();
    }

    // 六根胡须
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const wy = ny + 2 + i * 4;
        ctx.strokeStyle = this._D.black; ctx.lineWidth = 0.8; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx + side * 10, wy);
        ctx.lineTo(cx + side * 30, wy + i * 2 - 2);
        ctx.stroke();
      }
    }

    // 红色铃铛 + 项圈
    const bellX = cx, bellY = cy + hr - 2;
    ctx.fillStyle = this._D.yellow;
    ctx.beginPath(); ctx.ellipse(bellX, bellY - 4, hr * 0.85, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = this._D.yellowDark; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(bellX, bellY - 4, hr * 0.85, 5, 0, Math.PI, Math.PI * 2); ctx.stroke();

    // 铃铛球体
    const bg = ctx.createRadialGradient(bellX - 2, bellY + 3, 1, bellX, bellY + 4, 8);
    bg.addColorStop(0, '#FFE860');
    bg.addColorStop(0.6, this._D.yellow);
    bg.addColorStop(1, this._D.yellowDark);
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.ellipse(bellX, bellY + 4, 8, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.ellipse(bellX - 2, bellY + 1, 3, 2.5, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = this._D.yellowDark; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(bellX, bellY + 11, 7, -1.2, 1.2); ctx.stroke();
    ctx.fillStyle = this._D.yellowDark;
    ctx.beginPath(); ctx.ellipse(bellX, bellY + 8, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  }

  _drawLimbs(ctx, st) {
    const cx = 120, cy = 104, r = 38;
    const sw = Math.sin(st.walkPhase) * 3;

    // 短圆手
    for (const side of [-1, 1]) {
      const hx = cx + side * (r + 8) + sw;
      const hy = cy - 2;
      ctx.fillStyle = this._D.white;
      ctx.beginPath(); ctx.ellipse(hx, hy, 10, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1; ctx.stroke();
    }

    // 扁平脚板
    for (const side of [-1, 1]) {
      const fx = cx + side * 16 + sw * (side > 0 ? -1 : 1);
      const fy = cy + r + 4;
      ctx.fillStyle = this._D.white;
      ctx.beginPath(); ctx.ellipse(fx, fy, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 1; ctx.stroke();
    }
  }

  _drawTail(ctx, phase) {
    const tx = 78, ty = 110 + Math.sin(phase) * 3;
    ctx.fillStyle = this._D.red;
    ctx.beginPath(); ctx.ellipse(tx, ty, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this._D.redLight;
    ctx.beginPath(); ctx.ellipse(tx - 1, ty - 1, 2, 2, 0, 0, Math.PI * 2); ctx.fill();
  }

  _drawZzz(ctx, phase) {
    const x = 148, y = 16;
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const oy = -i * 14 + Math.sin(phase * 2 + i) * 6;
      ctx.fillStyle = `rgba(0,180,255,${0.3 + i * 0.2})`;
      ctx.font = `${12 + i * 4}px "Microsoft YaHei",sans-serif`;
      ctx.fillText('z', x + i * 6, y + oy);
    }
    ctx.restore();
  }

  getBounds() { return { w: 180, h: 150 }; }
}
