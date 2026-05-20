/**
 * requestAnimationFrame 驱动的动画循环
 * 提供统一的 update/render 注册机制，带 deltaTime 钳制
 */
export class AnimationLoop {
  constructor() {
    this._rafId = null;
    this._lastTime = 0;
    this._updaters = [];
    this._renderers = [];
    this._running = false;
    this._maxDelta = 100; // 最大 deltaTime 钳制（ms），防止失焦后跳帧
  }

  registerUpdate(fn) { this._updaters.push(fn); }
  registerRender(fn) { this._renderers.push(fn); }
  removeUpdate(fn) {
    this._updaters = this._updaters.filter(f => f !== fn);
  }
  removeRender(fn) {
    this._renderers = this._renderers.filter(f => f !== fn);
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
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
    // 失焦时暂停；忽略过大的 delta
    if (document.hidden || dt > this._maxDelta) dt = 0;

    for (let i = 0; i < this._updaters.length; i++) {
      try { this._updaters[i](dt); } catch (e) { console.error('[AnimationLoop] update error:', e); }
    }
    for (let i = 0; i < this._renderers.length; i++) {
      try { this._renderers[i](dt); } catch (e) { console.error('[AnimationLoop] render error:', e); }
    }
  }
}
