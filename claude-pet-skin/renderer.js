// 克劳德 — Claude Code 启动展示形象
// 赤陶橙身体 + 头顶 Anthropic 星芒 + 胸前 ">_" 终端符 + 友好大眼
// 沙箱渲染器：无 import / export，导出 exports.default = class（在 new Function 环境中编译）
// 支持主题：从 options.theme 取色，缺省回退 DEFAULT。颜色键：
//   main dark light face outline term star starLight eyeWhite pupil white

var DEFAULT = {
  main:      '#D97757',  // Anthropic 赤陶橙
  dark:      '#BE5D3A',
  light:     '#EBA483',
  face:      '#F7ECE4',  // 浅米面部
  outline:   '#9E4A2C',
  term:      '#2D2A26',  // 终端深色
  star:      '#D97757',
  starLight: '#F2B58F',
  eyeWhite:  '#FFFFFF',
  pupil:     '#2D2A26',
  white:     '#FFFFFF',
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// hex(#rrggbb) + alpha -> rgba()，让半透明色也跟随主题
function hexA(hex, a) {
  var h = (hex || '#000000').replace('#', '');
  var r = parseInt(h.substring(0, 2), 16);
  var g = parseInt(h.substring(2, 4), 16);
  var b = parseInt(h.substring(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

exports.default = class ClaudePet {
  draw(ctx, st, options) {
    this._C = (options && options.theme) || DEFAULT;

    var a = st.action;
    var sleeping = a === 'sleeping';
    var sitting = a === 'sitting';

    ctx.save();
    this._shadow(ctx, sleeping);
    if (!sleeping) this._legs(ctx, st, sitting);
    this._body(ctx, st, sleeping, sitting);
    this._head(ctx, st, sleeping);
    if (!sleeping) this._star(ctx, st.phase);
    if (sleeping) this._zzz(ctx, st.tailPhase);
    ctx.restore();
  }

  _shadow(ctx, sleeping) {
    ctx.fillStyle = 'rgba(60,30,15,0.12)';
    ctx.beginPath();
    ctx.ellipse(120, sleeping ? 160 : 156, sleeping ? 58 : 46, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _body(ctx, st, sleeping, sitting) {
    var C = this._C;
    var cx = 120;
    var cy = sleeping ? 138 : (sitting ? 116 : 108);
    var bw = sleeping ? 96 : 72;
    var bh = sleeping ? 40 : 58;

    var g = ctx.createLinearGradient(0, cy - bh / 2, 0, cy + bh / 2);
    g.addColorStop(0, C.light);
    g.addColorStop(0.5, C.main);
    g.addColorStop(1, C.dark);
    ctx.fillStyle = g;
    rr(ctx, cx - bw / 2, cy - bh / 2, bw, bh, sleeping ? 20 : 26);
    ctx.fill();
    ctx.strokeStyle = C.outline; ctx.lineWidth = 2; ctx.stroke();

    if (sleeping) return;

    this._terminal(ctx, cx, cy + 2);
  }

  _terminal(ctx, cx, cy) {
    var C = this._C;
    ctx.fillStyle = C.face;
    rr(ctx, cx - 22, cy - 14, 44, 28, 7);
    ctx.fill();
    ctx.strokeStyle = hexA(C.outline, 0.35); ctx.lineWidth = 1.5; ctx.stroke();

    ctx.strokeStyle = C.term; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // ">"
    ctx.beginPath();
    ctx.moveTo(cx - 13, cy - 6);
    ctx.lineTo(cx - 6, cy);
    ctx.lineTo(cx - 13, cy + 6);
    ctx.stroke();
    // "_" 光标
    ctx.beginPath();
    ctx.moveTo(cx - 1, cy + 7);
    ctx.lineTo(cx + 12, cy + 7);
    ctx.stroke();
  }

  _head(ctx, st, sleeping) {
    var C = this._C;
    var cx = 120;
    var cy = sleeping ? 122 : 56;
    var hr = sleeping ? 22 : 30;

    var g = ctx.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, hr);
    g.addColorStop(0, C.light);
    g.addColorStop(0.55, C.main);
    g.addColorStop(1, C.dark);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx, cy, hr, hr, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.outline; ctx.lineWidth = 2; ctx.stroke();

    if (sleeping) {
      ctx.strokeStyle = C.term; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      for (var s = -1; s <= 1; s += 2) {
        ctx.beginPath(); ctx.arc(cx + s * 9, cy, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      }
      return;
    }

    // 浅色面部
    ctx.fillStyle = C.face;
    ctx.beginPath(); ctx.ellipse(cx, cy + 4, hr * 0.78, hr * 0.66, 0, 0, Math.PI * 2); ctx.fill();

    var lx = st.lookDir ? st.lookDir.x : 0;
    var ly = st.lookDir ? st.lookDir.y : 0;

    // 眼睛
    if (st.blink) {
      ctx.strokeStyle = C.term; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      for (var s2 = -1; s2 <= 1; s2 += 2) {
        ctx.beginPath(); ctx.moveTo(cx + s2 * 10 - 6, cy); ctx.lineTo(cx + s2 * 10 + 6, cy); ctx.stroke();
      }
    } else {
      for (var s3 = -1; s3 <= 1; s3 += 2) {
        var ex = cx + s3 * 10 + lx * 2;
        var ey = cy + 1 + ly * 1.5;
        ctx.fillStyle = C.eyeWhite;
        ctx.beginPath(); ctx.ellipse(ex, ey, 6.5, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.pupil;
        ctx.beginPath(); ctx.ellipse(ex + lx * 1.5, ey + ly, 3.4, 4.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.white;
        ctx.beginPath(); ctx.ellipse(ex - 1.6, ey - 2.4, 1.6, 2, 0, 0, Math.PI * 2); ctx.fill();
      }
    }

    // 腮红
    ctx.fillStyle = hexA(C.main, 0.35);
    ctx.beginPath(); ctx.ellipse(cx - 17, cy + 8, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 17, cy + 8, 5, 3, 0, 0, Math.PI * 2); ctx.fill();

    // 嘴
    var open = st.meowOpen || 0;
    if (open > 0.3) {
      ctx.fillStyle = C.term;
      ctx.beginPath(); ctx.ellipse(cx, cy + 13, 5, 2 + open * 5, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = C.term; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + 12);
      ctx.quadraticCurveTo(cx, cy + 15, cx + 4, cy + 12);
      ctx.stroke();
    }
  }

  // Anthropic 星芒（头顶旋转）
  _star(ctx, phase) {
    var C = this._C;
    var cx = 120, cy = 16;
    var rays = 12;
    var rot = (phase || 0) * 0.6;

    ctx.save();
    ctx.translate(cx, cy);
    // 连接茎（插入头顶）
    ctx.strokeStyle = C.dark; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, 18); ctx.stroke();

    ctx.rotate(rot);
    for (var i = 0; i < rays; i++) {
      ctx.save();
      ctx.rotate((i / rays) * Math.PI * 2);
      var grad = ctx.createLinearGradient(0, 0, 0, -12);
      grad.addColorStop(0, C.star);
      grad.addColorStop(1, C.starLight);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-2, -3);
      ctx.lineTo(0, -12);
      ctx.lineTo(2, -3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = C.starLight;
    ctx.beginPath(); ctx.ellipse(0, 0, 3.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.star;
    ctx.beginPath(); ctx.ellipse(0, 0, 2, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  _legs(ctx, st, sitting) {
    var C = this._C;
    var cx = 120;
    var topY = sitting ? 138 : 134;
    var footY = 154;
    var wp = st.walkPhase || 0;
    var walking = st.action === 'walking';

    for (var i = 0; i < 2; i++) {
      var side = i === 0 ? -1 : 1;
      var swing = walking ? Math.sin(wp + i * Math.PI) * 5 : 0;
      var fx = cx + side * 16 + swing;
      ctx.strokeStyle = C.dark; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx + side * 16, topY); ctx.lineTo(fx, footY); ctx.stroke();
      ctx.fillStyle = C.main;
      ctx.beginPath(); ctx.ellipse(fx, footY + 1, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.outline; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }

  _zzz(ctx, phase) {
    var C = this._C;
    var x = 150, y = 110;
    ctx.save();
    for (var i = 0; i < 3; i++) {
      var oy = -i * 13 + Math.sin((phase || 0) * 2 + i) * 5;
      ctx.fillStyle = hexA(C.star, 0.35 + i * 0.2);
      ctx.font = (12 + i * 4) + 'px "Microsoft YaHei",sans-serif';
      ctx.fillText('z', x + i * 6, y + oy);
    }
    ctx.restore();
  }

  getBounds() { return { w: 180, h: 150 }; }
};
