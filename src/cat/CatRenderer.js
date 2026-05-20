/**
 * 宠物渲染器 — 薄封装层，委托给 pet 模块
 */
import { CAT_W, CAT_H, getCatScale, getCatSize, petType, petStyle } from '../constants.js';
import { getPetRenderer } from '../pets/index.js';

export class CatRenderer {
  constructor() {
    this._canvas = document.getElementById('petCanvas');
    this._ctx = this._canvas.getContext('2d');
    this._offscreen = document.createElement('canvas');
    this._octx = this._offscreen.getContext('2d');
    this._bubbleRenderer = null;
    this._walkTime = 0;
    // 缓存渲染器，避免每帧创建新实例
    this._cachedRenderer = null;
    this._cachedType = null;
    this._cachedStyle = null;
    // 初始尺寸
    const sz = getCatSize();
    this._offscreen.width = sz.w; this._offscreen.height = sz.h;
    this.setSize(sz.w, sz.h);
  }

  setSize(w, h) {
    this._canvas.width = w; this._canvas.height = h;
    this._offscreen.width = w; this._offscreen.height = h;
    this._canvas.style.width = w + 'px'; this._canvas.style.height = h + 'px';
  }

  get canvas() { return this._canvas; }
  setBubbleRenderer(b) { this._bubbleRenderer = b; }

  render(skeleton, state, blinking = false, tailPhase = 0, meowOpen = 0, lookDir = { x: 0, y: 0 }, facingRight = true) {
    const sz = getCatSize();
    const ctx = this._octx;
    ctx.clearRect(0, 0, sz.w, sz.h);

    // 偏移量：窗口与可见区域的差
    const xOff = (sz.w - sz.vw) / 2;
    const yOff = Math.round(60 * sz.h / CAT_H);

    ctx.save();
    ctx.translate(xOff, yOff);

    // 骨架空间 → 可见像素空间（含用户缩放）
    const sc = getCatScale();
    ctx.scale(sc.sx, sc.sy);

    ctx.save();
    if (!facingRight) { ctx.translate(240, 0); ctx.scale(-1, 1); }

    const walkPhase = this._getWalkPhase(state);
    // 仅在 petType 或 petStyle 变化时重建渲染器
    if (this._cachedType !== petType || this._cachedStyle !== petStyle || !this._cachedRenderer) {
      const prevStyle = this._cachedStyle;
      this._cachedType = petType;
      this._cachedStyle = petStyle;
      this._cachedRenderer = getPetRenderer(petType, petStyle);
      console.log('[CatRenderer] 切换渲染器:', prevStyle, '→', petStyle, '| 渲染器:', this._cachedRenderer?.constructor?.name);
    }
    // 额外 save/restore 隔离渲染器内部可能的异常，防止 Canvas 状态栈泄漏
    ctx.save();
    try {
      this._cachedRenderer.draw(ctx, skeleton, state, blinking, tailPhase, meowOpen, lookDir, walkPhase);
    } catch (e) {
      console.error('[CatRenderer] 渲染器 draw() 出错:', petStyle, '| 错误:', e.message || e);
      // 通过 IPC 发送到主进程终端，方便调试
      if (window.electronAPI?.logError) {
        window.electronAPI.logError('[CatRenderer] ' + petStyle + ' 渲染失败: ' + (e.message || e) + ' | stack: ' + (e.stack || ''));
      }
      ctx.restore();  // 恢复被污染的隔离 save（含渲染器内部未配对的 save）
      // 当前帧用 realistic 回退，不影响缓存，下一帧仍尝试正确的渲染器
      ctx.save();
      try {
        const fallback = getPetRenderer(petType, 'realistic');
        fallback.draw(ctx, skeleton, state, blinking, tailPhase, meowOpen, lookDir, walkPhase);
      } catch (e2) {
        console.error('[CatRenderer] realistic 回退也失败了:', e2);
      }
    }
    ctx.restore();  // 结束隔离 save（总是执行）

    ctx.restore();

    // 气泡在 cat-visual 坐标系中绘制，随缩放自动缩放
    if (this._bubbleRenderer) {
      this._bubbleRenderer.draw(ctx, 120, -28);
    }

    ctx.restore();

    // 离屏 → 主 Canvas
    const mainCtx = this._ctx;
    mainCtx.clearRect(0, 0, sz.w, sz.h);
    mainCtx.drawImage(this._offscreen, 0, 0, sz.w, sz.h, 0, 0, sz.w, sz.h);
  }

  getAlpha(x, y) {
    const sz = getCatSize();
    if (x < 0 || y < 0 || x >= sz.w || y >= sz.h) return 0;
    const pixel = this._octx.getImageData(x, y, 1, 1).data;
    return pixel[3];
  }

  _getWalkPhase(st) {
    if (st === 'walking') this._walkTime += 0.15;
    else if (st === 'idle' || st === 'sitting') this._walkTime += 0.01;
    return this._walkTime;
  }
}
