// desktop-pet/src/skins/AnimationState.js
/**
 * 动画状态 — 替代 DEFAULT_SKELETON。
 * 纯数据对象，描述"宠物在做什么"，不描述"身体部件在哪里"。
 * 每个皮肤渲染器自主解读这些状态为视觉呈现。
 */
export class AnimationState {
  constructor() {
    this.action = 'idle';          // 行为：walking|idle|sitting|sleeping|stretching|grooming|meowing|looking|standing
    this.phase = 0;                // 通用动画相位 0..1，循环递增
    this.blink = false;            // 是否眨眼
    this.meowOpen = 0;             // 张嘴程度 0..1（0=闭，1=完全张开）
    this.lookDir = { x: 0, y: 0 };// 视线方向 -1..1
    this.facingRight = true;       // 朝向
    this.walkPhase = 0;            // 走路相位（腿部摆动用）
    this.tailPhase = 0;            // 尾巴摆动相位
    this.position = { x: 0, y: 0 };// 屏幕位置
  }

  /**
   * 从 DesktopPetApp 的运行时状态同步
   * @param {DesktopPetApp} app
   */
  syncFromApp(app) {
    this.action = app.sm.state;
    this.blink = app._blink;
    this.meowOpen = (app.sm.state === 'meowing')
      ? Math.sin(app._stTimer * 0.15) * 0.5 + 0.5
      : 0;
    this.lookDir = app._look;
    this.facingRight = app._faceR;
    this.walkPhase = app._walk;
    this.tailPhase = app._tail;
    this.position = { x: app.patrol.x, y: app.patrol.y };
  }
}
