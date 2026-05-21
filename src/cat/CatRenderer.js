// desktop-pet/src/cat/CatRenderer.js
/**
 * 宠物渲染器 — 薄封装层，委托给 SkinManager + 皮肤渲染器。
 * 职责：Canvas 管理、缩放/偏移计算、气泡叠加、离屏缓冲。
 */
import { CAT_H, catScale, currentTheme, getCatScale, getCatSize, petType, petStyle } from '../constants.js';
import { skinManager } from '../skins/SkinManager.js';

export class CatRenderer {
  constructor() {
    this._canvas = document.getElementById('petCanvas');
    this._ctx = this._canvas.getContext('2d');
    this._offscreen = document.createElement('canvas');
    this._octx = this._offscreen.getContext('2d');
    this._bubbleRenderer = null;
    this._walkTime = 0;

    // 静止帧缓存（需跟踪变更以失效）
    this._cachedFrame = null;
    this._lastAction = null;
    this._lastStyle = petStyle;
    this._lastScale = 1.0;
    this._lastTheme = null;
    this._lastSkinTheme = null;

    const sz = getCatSize();
    this._offscreen.width = sz.w; this._offscreen.height = sz.h;
    this.setSize(sz.w, sz.h);
  }

  setSize(w, h) {
    this._canvas.width = w; this._canvas.height = h;
    this._offscreen.width = w; this._offscreen.height = h;
    this._canvas.style.width = w + 'px'; this._canvas.style.height = h + 'px';
    // 尺寸变化 → 缓存失效
    this._cachedFrame = null;
  }

  get canvas() { return this._canvas; }
  setBubbleRenderer(b) { this._bubbleRenderer = b; }

  /**
   * @param {AnimationState} state — 动画状态（替代 skeleton）
   * @param {boolean} canCache — idle/sleep 静止状态可缓存帧
   */
  render(state, canCache = false) {
    const sz = getCatSize();
    const ctx = this._octx;
    // 导入皮肤的当前主题色板（内置皮肤返回 null，渲染器走全局 COLORS）
    const skinTheme = skinManager.getActiveThemeColors(petType, petStyle);
    const skinThemeId = skinManager.getActiveThemeId(`${petType}.${petStyle}`);

    // 静止帧缓存：style/scale/全局主题/皮肤主题/action 均未变时才复用
    if (canCache && this._cachedFrame && state.action === this._lastAction
        && petStyle === this._lastStyle && catScale === this._lastScale
        && currentTheme === this._lastTheme && skinThemeId === this._lastSkinTheme) {
      const mainCtx = this._ctx;
      mainCtx.clearRect(0, 0, sz.w, sz.h);
      mainCtx.drawImage(this._cachedFrame, 0, 0);
      return;
    }

    ctx.clearRect(0, 0, sz.w, sz.h);

    const xOff = (sz.w - sz.vw) / 2;
    const yOff = Math.round(60 * sz.h / CAT_H);

    ctx.save();
    ctx.translate(xOff, yOff);

    const sc = getCatScale();
    ctx.scale(sc.sx, sc.sy);

    ctx.save();
    if (!state.facingRight) { ctx.translate(240, 0); ctx.scale(-1, 1); }

    // 委托给皮肤渲染器
    const renderer = skinManager.getRenderer(petType, petStyle);
    ctx.save();
    try {
      renderer.draw(ctx, state, { theme: skinTheme, scale: sc });
      this._lastAction = state.action;
      this._lastStyle = petStyle;
      this._lastScale = catScale;
      this._lastTheme = currentTheme;
      this._lastSkinTheme = skinThemeId;
    } catch (e) {
      console.error('[CatRenderer] 渲染失败:', petStyle, e);
      ctx.restore();
      // fallback 到写实猫
      ctx.save();
      try {
        const fb = skinManager.getRenderer('cat', 'realistic');
        fb.draw(ctx, state, { theme: null, scale: sc });
      } catch (e2) {
        console.error('[CatRenderer] fallback 也失败了:', e2);
      }
    }
    ctx.restore();

    ctx.restore();

    // 气泡
    if (this._bubbleRenderer) {
      this._bubbleRenderer.draw(ctx, 120, -44);
    }

    ctx.restore();

    // 缓存静止帧
    if (canCache) {
      if (!this._cachedFrame) {
        this._cachedFrame = document.createElement('canvas');
        this._cachedFrame.width = sz.w;
        this._cachedFrame.height = sz.h;
      }
      const cc = this._cachedFrame.getContext('2d');
      cc.clearRect(0, 0, sz.w, sz.h);
      cc.drawImage(this._offscreen, 0, 0);
    } else {
      this._cachedFrame = null;
    }

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
}
