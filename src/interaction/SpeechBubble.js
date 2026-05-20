import { CAT_VISUAL_W } from '../constants.js';

export class SpeechBubble {
  constructor() {
    this._visible = false; this._timer = 0; this._mode = null;
    this._text = ''; this._hideTimer = null;
  }
  get visible() { return this._visible; }
  get mode() { return this._mode; }

  show(text, mode = 'hover') {
    this._text = text; this._visible = true; this._timer = 0; this._mode = mode;
    if (this._hideTimer) clearTimeout(this._hideTimer);
    if (mode === 'auto') this._scheduleHide(5000);
    if (mode === 'manual') this._scheduleHide(8000);
  }
  hide() {
    this._visible = false; this._mode = null;
    if (this._hideTimer) { clearTimeout(this._hideTimer); this._hideTimer = null; }
  }
  _scheduleHide(ms) { this._hideTimer = setTimeout(() => this.hide(), ms); }
  tick() { if (this._visible) this._timer++; }

  draw(ctx, headX, headY) {
    if (!this._visible) return;
    ctx.save();
    const text = this._text;
    const fs = 18;
    ctx.font = fs + 'px "Microsoft YaHei","微软雅黑",sans-serif';
    const tw = ctx.measureText(text).width;
    const th = 24, px = 18, py = 12, tailH = 10, r = 12;
    const bw = tw + px * 2, bh = th + py * 2 + tailH;

    let bx = headX - bw / 2, by = headY - bh - 4;
    // 如果气泡超出顶部，调整到 headY 下方
    if (by < 4) by = headY + 10;
    bx = Math.max(2, Math.min(bx, CAT_VISUAL_W - bw - 2));
    // 气泡在猫上方→三角向下（正常），气泡在猫下方→三角向上（flip）
    const flip = by > 0;
    ctx.translate(bx, by);

    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    this._rr(ctx, 2, 3, bw, bh - tailH, r); ctx.fill();

    const bY = flip ? tailH : 0;
    const g = ctx.createLinearGradient(0, bY, 0, bY + bh - tailH);
    g.addColorStop(0, '#FFFDE7'); g.addColorStop(1, '#FFF8E1');
    ctx.fillStyle = g;
    this._rr(ctx, 0, bY, bw, bh - tailH, r); ctx.fill();

    ctx.strokeStyle = 'rgba(232,119,34,0.65)'; ctx.lineWidth = 1.5;
    this._rr(ctx, 0, bY, bw, bh - tailH, r); ctx.stroke();

    ctx.fillStyle = g; ctx.beginPath();
    if (flip) { ctx.moveTo(bw / 2 - 8, bY); ctx.lineTo(bw / 2 + 8, bY); ctx.lineTo(bw / 2, 0); }
    else { ctx.moveTo(bw / 2 - 8, bY + bh - tailH); ctx.lineTo(bw / 2 + 8, bY + bh - tailH); ctx.lineTo(bw / 2, bh); }
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#5D4037';
    ctx.font = fs + 'px "Microsoft YaHei","微软雅黑",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, bw / 2, bY + (bh - tailH) / 2);
    ctx.restore();
  }

  _rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
  }
}
