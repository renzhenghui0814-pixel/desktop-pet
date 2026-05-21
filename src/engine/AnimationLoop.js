/**
 * requestAnimationFrame 驱动的动画循环 — 支持自适应帧率
 */
export class AnimationLoop {
  constructor() {
    this._rafId = null;
    this._lastTime = 0;
    this._updaters = [];
    this._renderers = [];
    this._running = false;
    this._maxDelta = 100;
    this._targetFPS = 60;         // 目标帧率
    this._frameInterval = 1000 / 60; // 对应帧间隔 ms
    this._accumulator = 0;        // 累积时间
    this._forceNextFrame = false; // 强制下一帧（状态切换用）
  }

  /** 设置目标帧率，0 = 完全暂停 */
  setTargetFPS(fps) {
    if (fps !== this._targetFPS) {
      this._targetFPS = fps;
      this._frameInterval = fps > 0 ? 1000 / fps : Infinity;
      this._accumulator = 0;
      if (fps > 0) this._forceNextFrame = true; // 状态切换时立即渲染首帧
    }
  }

  /** 强制立即渲染一帧（用于状态切换） */
  requestFrame() {
    this._forceNextFrame = true;
  }

  registerUpdate(fn) { this._updaters.push(fn); }
  registerRender(fn) { this._renderers.push(fn); }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._accumulator = 0;
    this._tick(this._lastTime);
  }

  stop() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _tick(now) {
    if (!this._running) return;
    this._rafId = requestAnimationFrame((t) => this._tick(t));

    let dt = now - this._lastTime;
    this._lastTime = now;

    if (document.hidden) dt = 0;          // 后台：完全暂停
    if (dt > this._maxDelta) dt = 0;      // 失焦恢复不跳帧

    // 始终执行 update（状态机逻辑需要持续运行），即使不渲染
    this._accumulator += dt;
    for (let i = 0; i < this._updaters.length; i++) {
      try { this._updaters[i](Math.min(dt, this._maxDelta)); } catch (e) { console.error('[AnimationLoop] update error:', e); }
    }

    // 帧率门控：累积时间达到帧间隔才渲染
    if (this._forceNextFrame || this._accumulator >= this._frameInterval) {
      this._accumulator = this._accumulator % this._frameInterval;
      this._forceNextFrame = false;
      for (let i = 0; i < this._renderers.length; i++) {
        try { this._renderers[i](dt); } catch (e) { console.error('[AnimationLoop] render error:', e); }
      }
    }
  }
}
