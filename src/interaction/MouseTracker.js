/**
 * 鼠标跟踪器（基于主进程 IPC 轮询 + 拖拽支持）
 */
export class MouseTracker {
  constructor(renderer) {
    this._renderer = renderer;

    this._mx = 0; this._my = 0;
    this._winX = 0; this._winY = 0;
    this._localX = 0; this._localY = 0;
    this._onCat = false;
    this._hoverDuration = 0;
    this._clickThrough = false;
    this._dragging = false;
    this._dragStartX = 0; this._dragStartY = 0;

    this._hoverListeners = [];
    this._clickListeners = [];
    this._leaveListeners = [];
    this._rightClickListeners = [];
    this._dragStartListeners = [];
    this._dragEndListeners = [];
    this._lastClickThroughToggle = 0;

    this._setup();
  }

  _setup() {
    const canvas = this._renderer.canvas;

    // IPC 鼠标轮询
    const cursorCB = window.electronAPI?.onCursor || window.electronAPI?.onCursorUpdate;
    if (cursorCB) {
      cursorCB((data) => {
        const wx = data.wx !== undefined ? data.wx : data.winX;
        const wy = data.wy !== undefined ? data.wy : data.winY;
        this._mx = data.x; this._my = data.y;
        this._winX = wx; this._winY = wy;
        this._localX = data.x - wx;
        this._localY = data.y - wy;

        const onCat = this._renderer.getAlpha(this._localX, this._localY) > 40;

        if (onCat && !this._onCat) {
          this._onCat = true;
          this._hoverDuration = 0;
          this._setClickThrough(false);
          this._notify(this._hoverListeners, 'enter');
        } else if (!onCat && this._onCat) {
          this._onCat = false;
          this._hoverDuration = 0;
          this._setClickThrough(true);
          this._notify(this._leaveListeners, 'leave');
        }

        if (onCat) this._hoverDuration++;
      });
    }

    // 鼠标按下（左键）→ 开始拖拽
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 && this._onCat) {
        this._dragging = true;
        this._notify(this._dragStartListeners);
        e.preventDefault();
      }
    });

    // 鼠标释放 → 结束拖拽
    document.addEventListener('mouseup', () => {
      if (this._dragging) {
        this._dragging = false;
        this._notify(this._dragEndListeners);
      }
    });

    // 点击
    canvas.addEventListener('click', (e) => {
      if (this._onCat) {
        this._notify(this._clickListeners, {
          x: e.offsetX, y: e.offsetY, right: false,
          screenX: this._mx, screenY: this._my,
        });
      }
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this._onCat) {
        this._notify(this._rightClickListeners, {
          x: e.offsetX, y: e.offsetY, right: true,
          screenX: this._mx, screenY: this._my,
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.close();
    });
  }

  _setClickThrough(enabled) {
    if (enabled === this._clickThrough) return;
    // 仅在从可交互→穿透时防抖（防止快速抖动），反之立即生效
    if (enabled) {
      const now = performance.now();
      if (now - this._lastClickThroughToggle < 300) return;
      this._lastClickThroughToggle = now;
    }
    this._clickThrough = enabled;
    if (window.electronAPI) {
      window.electronAPI.setClickThrough(enabled);
    }
  }

  _notify(listeners, data) {
    for (const fn of listeners) fn(data);
  }

  get mouseX() { return this._mx; }
  get mouseY() { return this._my; }
  get localX() { return this._localX; }
  get localY() { return this._localY; }
  get isOnCat() { return this._onCat; }
  get hoverDuration() { return this._hoverDuration; }
  get isDragging() { return this._dragging; }

  get lookDirection() {
    const cx = this._renderer.canvas.width / 2;
    const cy = this._renderer.canvas.height * 0.35;
    return {
      x: Math.max(-1, Math.min(1, (this._localX - cx) / 30)),
      y: Math.max(-1, Math.min(1, (this._localY - cy) / 25)),
    };
  }

  onHoverEnter(fn) { this._hoverListeners.push(fn); }
  onHoverLeave(fn) { this._leaveListeners.push(fn); }
  onClick(fn) { this._clickListeners.push(fn); }
  onRightClick(fn) { this._rightClickListeners.push(fn); }
  onDragStart(fn) { this._dragStartListeners.push(fn); }
  onDragEnd(fn) { this._dragEndListeners.push(fn); }
}
