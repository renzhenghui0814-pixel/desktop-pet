/**
 * 屏幕边界检测工具
 */
export class ScreenBounds {
  constructor() {
    this.displays = [];
    this._refresh();
  }

  /**
   * 刷新屏幕信息（处理显示器变化）
   * 通过 Electron IPC 获取所有显示器信息
   */
  async refresh() {
    if (window.electronAPI) {
      this.displays = await window.electronAPI.getAllDisplays();
    } else {
      // 回退：使用浏览器 API
      this._refresh();
    }
    return this.displays;
  }

  _refresh() {
    this.displays = [{
      id: 0,
      bounds: { x: 0, y: 0, width: screen.width, height: screen.height },
      workArea: {
        x: 0, y: 0,
        width: screen.availWidth || screen.width,
        height: screen.availHeight || screen.height,
      },
      scaleFactor: window.devicePixelRatio || 1,
    }];
  }

  /** 获取所有显示器合并工作区 */
  get primaryWorkArea() {
    if (this.displays.length === 0) {
      return { x: 0, y: 0, width: 1920, height: 1080 };
    }
    // 合并所有显示器的工作区
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const d of this.displays) {
      const w = d.workArea;
      if (w.x < minX) minX = w.x;
      if (w.y < minY) minY = w.y;
      if (w.x + w.width > maxX) maxX = w.x + w.width;
      if (w.y + w.height > maxY) maxY = w.y + w.height;
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  /** 获取指定位置的显示器 */
  getDisplayAt(x, y) {
    for (const d of this.displays) {
      const b = d.bounds;
      if (x >= b.x && y >= b.y && x < b.x + b.width && y < b.y + b.height) {
        return d;
      }
    }
    return this.displays[0] || null;
  }
}
