import { CAT_VISUAL_W as CAT_W, CAT_VISUAL_H as CAT_H, EDGE_MARGIN } from '../constants.js';

export class PatrolBehavior {
  constructor(screenBounds) {
    this._screen = screenBounds;
    this._perimeter = 0;
    this._targetPerimeter = 0;
    this._totalPerimeter = 0;
    this._dir = 1;

    this._x = 0;
    this._y = 0;
    this._edge = 'bottom';

    this._targetX = 0;
    this._targetY = 0;

    this.MAX_SPEED = 2.4;
    this.EASE_DIST = 140;
    this.MIN_TARGET_DIST = 250;

    this._vx = 0;
    this._vy = 0;

    // 自由移动模式：从屏幕内任意位置走向边缘
    this._freeMoving = false;
    this._freeTargetX = 0;
    this._freeTargetY = 0;
    this._arriveCooldown = 0;
  }

  get x() { return this._x; }
  get y() { return this._y; }
  set x(v) { this._x = v; }
  set y(v) { this._y = v; }
  get edge() { return this._edge; }
  get isFreeMoving() { return this._freeMoving; }

  init(x, y) {
    this._x = x;
    this._y = y;
    this.syncPerimeter();
    this._pickTarget();
  }

  /** 从屏幕任意位置开始走向最近边缘 */
  startFreeMove(x, y) {
    this._x = x;
    this._y = y;
    this._freeMoving = true;
    // 计算最近边缘点
    this._totalPerimeter = this._calcPerimeter();
    const b = this._edgeBounds();
    const cx = Math.min(b.xMax, Math.max(b.xMin, x));
    const cy = Math.min(b.yMax, Math.max(b.yMin, y));

    // 找最近边上的点
    const candidates = [
      { dx: 0, dy: b.yMin - cy, fx: cx, fy: b.yMin },
      { dx: b.xMax - cx, dy: 0, fx: b.xMax, fy: cy },
      { dx: 0, dy: b.yMax - cy, fx: cx, fy: b.yMax },
      { dx: b.xMin - cx, dy: 0, fx: b.xMin, fy: cy },
    ];
    let best = candidates[0];
    let bestDist = Infinity;
    for (const c of candidates) {
      const d = c.dx * c.dx + c.dy * c.dy;
      if (d < bestDist) { bestDist = d; best = c; }
    }
    this._freeTargetX = best.fx;
    this._freeTargetY = best.fy;
    this._vx = 0;
    this._vy = 0;
  }

  _edgeBounds() {
    const wa = this._screen.primaryWorkArea;
    const xMin = wa.x + EDGE_MARGIN;
    const yMin = wa.y + EDGE_MARGIN;
    const xMax = wa.x + wa.width - EDGE_MARGIN - CAT_W;
    const yMax = wa.y + wa.height - EDGE_MARGIN - CAT_H;
    return {
      xMin: Math.min(xMax, xMin), yMin: Math.min(yMax, yMin),
      xMax: Math.max(xMax, xMin), yMax: Math.max(yMax, yMin),
    };
  }

  _calcPerimeter() {
    const b = this._edgeBounds();
    return Math.max(1, 2 * (b.xMax - b.xMin + b.yMax - b.yMin));
  }

  _perimeterToXY(pos) {
    const b = this._edgeBounds();
    const w = Math.max(0, b.xMax - b.xMin);
    const h = Math.max(0, b.yMax - b.yMin);
    const total = Math.max(1, 2 * (w + h));
    pos = ((pos % total) + total) % total;
    if (pos <= w) return { x: b.xMin + pos, y: b.yMin, edge: 'top' };
    pos -= w;
    if (pos <= h) return { x: b.xMax, y: b.yMin + pos, edge: 'right' };
    pos -= h;
    if (pos <= w) return { x: b.xMax - pos, y: b.yMax, edge: 'bottom' };
    pos -= w;
    return { x: b.xMin, y: b.yMax - pos, edge: 'left' };
  }

  syncPerimeter() {
    this._totalPerimeter = this._calcPerimeter();
    const b = this._edgeBounds();
    const cx = Math.min(b.xMax, Math.max(b.xMin, this._x));
    const cy = Math.min(b.yMax, Math.max(b.yMin, this._y));
    const w = Math.max(0, b.xMax - b.xMin);
    const h = Math.max(0, b.yMax - b.yMin);

    const candidates = [
      { dist: (cy - b.yMin) ** 2, pos: cx - b.xMin },
      { dist: (cx - b.xMax) ** 2, pos: w + (cy - b.yMin) },
      { dist: (cy - b.yMax) ** 2, pos: w + h + (b.xMax - cx) },
      { dist: (cx - b.xMin) ** 2, pos: w + h + w + (b.yMax - cy) },
    ];
    const best = candidates.reduce((a, b) => a.dist < b.dist ? a : b);
    this._perimeter = ((best.pos % this._totalPerimeter) + this._totalPerimeter) % this._totalPerimeter;

    const p = this._perimeterToXY(this._perimeter);
    this._x = p.x; this._y = p.y; this._edge = p.edge;
    this._freeMoving = false;
  }

  _pickTarget() {
    this._totalPerimeter = this._calcPerimeter();
    const minDist = Math.min(this.MIN_TARGET_DIST, this._totalPerimeter / 3);
    let target = Math.random() * this._totalPerimeter;
    for (let i = 0; i < 20; i++) {
      if (Math.abs(this._signedDelta(target)) >= minDist) break;
      target = Math.random() * this._totalPerimeter;
    }
    this._targetPerimeter = target;
    this._dir = this._signedDelta(target) >= 0 ? 1 : -1;
    const p = this._perimeterToXY(target);
    this._targetX = p.x; this._targetY = p.y; this._targetEdge = p.edge;
  }

  _signedDelta(target) {
    const delta = (target - this._perimeter) % this._totalPerimeter;
    if (delta > this._totalPerimeter / 2) return delta - this._totalPerimeter;
    if (delta < -this._totalPerimeter / 2) return delta + this._totalPerimeter;
    return delta;
  }

  isAtTarget() {
    if (this._freeMoving) return false;
    return Math.abs(this._signedDelta(this._targetPerimeter)) < this.MAX_SPEED + 3;
  }

  /** 每帧更新 */
  update() {
    if (this._freeMoving) return this._updateFreeMove();
    return this._updatePerimeter();
  }

  _updateFreeMove() {
    const dx = this._freeTargetX - this._x;
    const dy = this._freeTargetY - this._y;
    const dist = Math.hypot(dx, dy);

    // 到达边缘，切换到周长巡逻
    if (dist < 3) {
      this._x = this._freeTargetX;
      this._y = this._freeTargetY;
      this.syncPerimeter();
      this._pickTarget();
      return { vx: 0, vy: 0, facingRight: true, speed: 0 };
    }

    // 朝目标直线移动，带缓动减速
    const factor = Math.min(1, dist / this.EASE_DIST);
    const spd = Math.max(0.6, this.MAX_SPEED * factor);
    const nx = dx / dist;
    const ny = dy / dist;

    const prevX = this._x, prevY = this._y;
    this._x += nx * spd;
    this._y += ny * spd;

    this._vx += (this._x - prevX - this._vx) * 0.2;
    this._vy += (this._y - prevY - this._vy) * 0.2;

    const speed = Math.hypot(this._vx, this._vy);
    return { vx: this._vx, vy: this._vy, facingRight: this._vx >= 0, speed };
  }

  _updatePerimeter() {
    const delta = this._signedDelta(this._targetPerimeter);
    const dist = Math.abs(delta);

    if (dist < this.MAX_SPEED + 4) {
      this._perimeter = this._targetPerimeter;
      const p = this._perimeterToXY(this._perimeter);
      this._x = p.x; this._y = p.y; this._edge = p.edge;
      this._vx = 0; this._vy = 0;
      // 到达后冷却 500ms 再选新目标，防止抖动
      if (this._arriveCooldown <= 0) {
        this._arriveCooldown = 30; // ~500ms at 60fps
      }
      this._arriveCooldown--;
      if (this._arriveCooldown <= 0) {
        this._pickTarget();
      }
      return { vx: 0, vy: 0, facingRight: true, speed: 0 };
    }
    this._arriveCooldown = 0;

    const factor = Math.min(1, dist / this.EASE_DIST);
    const wantSpd = Math.max(0.8, this.MAX_SPEED * factor);
    const step = Math.min(dist, wantSpd) * (delta >= 0 ? 1 : -1);

    const prevX = this._x, prevY = this._y;
    const nextP = ((this._perimeter + step) % this._totalPerimeter + this._totalPerimeter) % this._totalPerimeter;
    const nextPos = this._perimeterToXY(nextP);
    this._perimeter = nextP;
    this._x = nextPos.x;
    this._y = nextPos.y;
    this._edge = nextPos.edge;

    this._vx += (this._x - prevX - this._vx) * 0.2;
    this._vy += (this._y - prevY - this._vy) * 0.2;

    const speed = Math.hypot(this._vx, this._vy);
    return { vx: this._vx, vy: this._vy, facingRight: this._vx >= 0, speed };
  }
}
