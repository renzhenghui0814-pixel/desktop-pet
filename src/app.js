/**
 * 桌面宠物 — 主应用
 */
import { CAT_W, CAT_H, CAT_VISUAL_H, CAT_VISUAL_W, DEFAULT_PHRASES, STATE_DURATION, setTheme, setCatScale, setPetStyle, getCatSize, catScale, petStyle, petType } from './constants.js';
import { currentTheme } from './constants.js';
import { AnimationState } from './skins/AnimationState.js';
import { AnimationLoop } from './engine/AnimationLoop.js';
import { StateMachine, STATES } from './engine/StateMachine.js';
import { Easing } from './engine/Easing.js';
import { CatRenderer } from './cat/CatRenderer.js';
import { skinManager } from './skins/SkinManager.js';
import { PatrolBehavior } from './behaviors/PatrolBehavior.js';
import { MouseTracker } from './interaction/MouseTracker.js';
import { SpeechBubble } from './interaction/SpeechBubble.js';
import { ScreenBounds } from './utils/ScreenBounds.js';
import { randInt } from './utils/Random.js';

class DesktopPetApp {
  constructor() {
    this.renderer = new CatRenderer();
    this.bubble = new SpeechBubble();
    this.renderer.setBubbleRenderer(this.bubble);
    this.screenBounds = new ScreenBounds();
    this.patrol = new PatrolBehavior(this.screenBounds);
    this.mouse = new MouseTracker(this.renderer);
    this.sm = new StateMachine(STATES.IDLE);

    // 动画状态（替代骨架）
    this._animState = new AnimationState();
    this._currentFPS = 60;
    this._lastFPS = 60;

    // 动画状态
    this._walk = 0; this._tail = 0;
    this._blink = false; this._blinkT = 0; this._blinkCd = randInt(80, 180);
    this._stTimer = 0; this._stDur = 300;
    this._meowCd = randInt(600, 1200);
    this._faceR = true; this._look = { x: 0, y: 0 };
    this._prevSt = STATES.IDLE;

    // 跳跃
    this._jump = false; this._jumpVy = 0; this._jumpBase = 0;
    this._hoverBubbleCd = 0;

    // 拖动
    this._drag = false;

    // 面板
    this._panelOpen = false;

    // 宠语（按形象存储）
    this._phrases = this._loadPhrases();

    // 加载已导入的皮肤（注册渲染器 + 补默认宠语，需在 _phrases 之后、首帧渲染之前）
    this._loadImportedSkins();

    // 内置形象的独立主题记忆 + 应用当前形象的主题（启动沿用上次）
    this._styleThemes = this._loadStyleThemes();
    this._applyStyleTheme(petStyle);

    // 提醒
    this._reminders = [];
    this._loadReminders();
    this._reminderActive = false;
    setInterval(() => this._checkReminders(), 1000);

    // 先用回退值同步初始化位置，防止首帧窗口移出屏幕
    this._posReady = false;
    this._initPosSync();
    this._setupInput();

    this._loop = new AnimationLoop();
    this._loop.registerUpdate((dt) => this._tick(dt));
    this._loop.registerRender(() => this._draw());
    this._loop.start();

    // 异步获取精确屏幕信息后修正位置
    this._initPosAsync();
  }

  // ═══ 初始化 ═══
  _initPosSync() {
    // ScreenBounds 构造函数里已用回退值初始化
    const wa = this.screenBounds.primaryWorkArea;
    this.patrol.init(wa.x + 300, wa.y + wa.height - CAT_VISUAL_H - 60);
    this._moveWin();
    this._posReady = true;
  }

  async _initPosAsync() {
    await this.screenBounds.refresh();
    const wa = this.screenBounds.primaryWorkArea;
    this.patrol.init(wa.x + 300, wa.y + wa.height - CAT_VISUAL_H - 60);
    this._moveWin();
  }

  _setupInput() {
    this.mouse.onClick(() => this._onClick());
    this.mouse.onRightClick(() => this._openSettings());
    this.mouse.onDragStart(() => { if (!this._panelOpen && this.sm.state === STATES.WALKING) this._startIdle(); });
    this.mouse.onDragEnd(() => { if (!this._panelOpen) { this.patrol.startFreeMove(this.patrol.x, this.patrol.y); this._startWalk(); this._loop.setTargetFPS(60); } });
    // 监听设置窗口的动作
    if (window.electronAPI?.onSettingsAct) {
      window.electronAPI.onSettingsAct((act) => {
        if (act.type === 'set-theme') {
          // 仅改当前（内置）形象的主题记忆，不影响其他形象
          this._styleThemes[petStyle] = act.theme;
          this._saveStyleThemes();
          setTheme(act.theme);
          this._loop.requestFrame(); // 强制重绘（渲染可能因面板打开而暂停）
        }
        else if (act.type === 'set-style') {
          console.log('[app] 收到切换形象:', act.style);
          setPetStyle(act.style);
          this._applyStyleTheme(act.style); // 应用该形象记忆的主题（内置形象）
          this._loop.requestFrame();
        }
        else if (act.type === 'register-skin') {
          // 导入皮肤：注册渲染器到 skinManager 并立即切换
          try {
            skinManager.registerSkin(act.manifest, act.code);
            this._applySkinPhrases(act.manifest); // 首次导入填入默认宠语
            setPetStyle(act.manifest.style);
            this._loop.requestFrame();
            console.log('[app] 已注册导入皮肤:', act.manifest.id);
          } catch (e) {
            console.error('[app] 注册导入皮肤失败:', e);
            window.electronAPI?.logError('注册导入皮肤失败: ' + (e && e.message));
          }
        }
        else if (act.type === 'set-skin-theme') {
          // 切换导入皮肤的主题（act.id = 皮肤 id，如 cat.claude）
          skinManager.setActiveTheme(act.id, act.themeId);
          this._loop.requestFrame();
        }
        else if (act.type === 'update-phrases') { this._phrases = act.phrases; this._savePhrases(); }
        else if (act.type === 'update-reminders') { this._reminders = act.reminders; this._saveReminders(); }
        else if (act.type === 'set-scale') {
          setCatScale(act.scale);
          const sz = getCatSize();
          this.renderer.setSize(sz.w, sz.h);
          this._moveWin();
          this._loop.requestFrame(); // 强制重绘（否则画布空白→宠物"消失"）
        }
        else if (act.type === 'close' || act.type === 'settings-closed') {
          if (!this._panelOpen) return;
          this._panelOpen = false;
          this.patrol.syncPerimeter();
          this._startWalk();
          this._loop.setTargetFPS(60); // 唤醒渲染循环（之前因面板打开而暂停）
        }
      });
    }
  }

  // ═══ 主循环 ═══
  _tick(dt) {
    const st = this.sm.state;
    this._tail += 0.04;
    this._blinkTick();
    this._bubbleTick();
    this._autoMeow();

    if (this._panelOpen) return;
    if (this.mouse.isDragging) { this._dragUpdate(); return; }
    if (this.mouse.isOnCat) {
      if (st !== STATES.STANDING && st !== STATES.SLEEPING) { this.sm.transition(STATES.STANDING); this._stTimer = 0; this._stDur = 400; this._loop.requestFrame(); }
      this._look = this.mouse.lookDirection;
      return;
    }
    if (this.bubble.visible && this.bubble.mode !== 'hover') return;

    this._stTimer++;
    if (st === STATES.WALKING) this._walkTick();
    else if (st === STATES.STANDING || st === STATES.LOOKING) { if (this._stTimer > this._stDur) this._startWalk(); }
    else this._idleTick();

    if (this._jump) this._jumpTick();
  }

  _walkTick() {
    const r = this.patrol.update();
    this._faceR = r.facingRight;
    this._walk += 0.06 * (r.speed / this.patrol.MAX_SPEED);
    if (this.patrol.isAtTarget()) {
      const x = Math.random();
      if (x < 0.25) this._startIdle();
      else if (x < 0.48) this._startSit();
      else if (x < 0.62) this._startSleep();
      else if (x < 0.74) this._startGroom();
      else if (x < 0.84) this._startStretch();
      else this._startWalk();
    }
  }

  _idleTick() { if (this._stTimer > this._stDur) this._startWalk(); }

  _autoMeow() {
    if (this.bubble.visible || this.mouse.isOnCat) return;
    this._meowCd--;
    if (this._meowCd <= 0) {
      this.sm.transition(STATES.MEOWING); this._stTimer = 0; this._stDur = 100;
      this.bubble.show(this._pickPhrase(), 'auto');
      this._meowCd = randInt(900, 1800);
    }
  }

  _blinkTick() {
    if (this.sm.state === STATES.SLEEPING) return;
    if (this._blink) { this._blinkT--; if (this._blinkT <= 0) { this._blink = false; this._blinkCd = randInt(80, 200); } }
    else { this._blinkCd--; if (this._blinkCd <= 0 && Math.random() < 0.05) { this._blink = true; this._blinkT = 4; } }
  }

  _bubbleTick() {
    this.bubble.tick();
    // 每次鼠标进入宠物都弹气泡（离开即隐藏，再进入再弹，无冷却）
    if (this.mouse.isOnCat && this.mouse.hoverDuration > 0 && !this.bubble.visible) { this.bubble.show(this._pickPhrase(), 'hover'); }
    if (!this.mouse.isOnCat && this.bubble.visible && this.bubble.mode === 'hover') this.bubble.hide();
  }

  _jumpTick() {
    this._jumpVy += 0.42; this.patrol.y += this._jumpVy;
    if (this.patrol.y >= this._jumpBase) { this.patrol.y = this._jumpBase; this._jump = false; this._jumpVy = 0; }
  }

  _dragUpdate() {
    this.patrol.x = this.mouse.mouseX - CAT_VISUAL_W / 2;
    this.patrol.y = this.mouse.mouseY - CAT_VISUAL_H / 2;
    this._moveWin();
  }

  _onClick() {
    if (this._panelOpen) return;
    if (!this._jump) { this._jumpVy = -9; this._jump = true; this._jumpBase = this.patrol.y; }
    if (this.sm.state === STATES.SLEEPING) this._startWalk();
  }

  // ═══ 状态切换 ═══
  _startWalk() { this._prevSt = this.sm.state; this.sm.transition(STATES.WALKING); this._stDur = 0; }
  _startIdle() { this._prevSt = this.sm.state; this.sm.transition(STATES.IDLE); this._stDur = randInt(...STATE_DURATION.idle); this._stTimer = 0; }
  _startSit() { this._prevSt = this.sm.state; this.sm.transition(STATES.SITTING); this._stDur = randInt(...STATE_DURATION.sitting); this._stTimer = 0; }
  _startSleep() { this._prevSt = this.sm.state; this.sm.transition(STATES.SLEEPING); this._stDur = randInt(...STATE_DURATION.sleeping); this._stTimer = 0; }
  _startStretch() { this._prevSt = this.sm.state; this.sm.transition(STATES.STRETCHING); this._stDur = randInt(...STATE_DURATION.stretching); this._stTimer = 0; }
  _startGroom() { this._prevSt = this.sm.state; this.sm.transition(STATES.GROOMING); this._stDur = randInt(...STATE_DURATION.grooming); this._stTimer = 0; }

  // ═══ 渲染 ═══
  _draw() {
    const st = this.sm.state;

    // 同步 AnimationState
    this._animState.syncFromApp(this);

    // 帧率策略
    let targetFPS;
    if (this._panelOpen || this.mouse.isDragging || this._reminderActive) {
      targetFPS = 0; // 暂停
    } else if (this._jump || st === 'walking' || st === 'meowing' || st === 'stretching') {
      targetFPS = 60;
    } else if (st === 'standing' || st === 'looking' || st === 'grooming') {
      targetFPS = 15;
    } else {
      targetFPS = 4; // idle / sitting / sleeping
    }

    if (targetFPS !== this._lastFPS) {
      this._loop.setTargetFPS(targetFPS);
      this._lastFPS = targetFPS;
    }

    // 是否可缓存静止帧
    const canCache = (st === 'sleeping');

    // 渲染
    this.renderer.render(this._animState, canCache);

    // IPC 节流：仅位置变化 > 2px 时移动窗口
    if (st === 'walking' || this._jump || this.mouse.isDragging) {
      this._moveWin();
    }
  }

  _moveWin() {
    const sz = getCatSize();
    const xo = (sz.w - sz.vw) / 2;
    const yo = Math.round(60 * sz.h / CAT_H);
    const nx = Math.round(this.patrol.x - xo);
    const ny = Math.round(this.patrol.y - yo);

    // 仅位置变化 > 2px 时调用 IPC
    if (this._lastWinX == null || Math.abs(nx - this._lastWinX) > 2 || Math.abs(ny - this._lastWinY) > 2) {
      this._lastWinX = nx;
      this._lastWinY = ny;
      window.electronAPI?.moveWindow(nx, ny, sz.w, sz.h);
    }
  }

  // ═══ 设置面板 ═══
  _openSettings() {
    if (this._panelOpen) return;
    this._panelOpen = true;
    this.sm.transition(STATES.IDLE);
    window.electronAPI?.openSettings({
      currentTheme, catScale, petStyle,
      phrases: JSON.parse(JSON.stringify(this._phrases)),
      reminders: [...this._reminders],
    });
  }

  // ═══ 导入皮肤 ═══
  _loadImportedSkins() {
    try {
      const arr = JSON.parse(localStorage.getItem('pet-imported-skins') || '[]');
      for (const x of arr) {
        const m = x.manifest || x;
        const code = x.code;
        if (m && code && m.id) {
          try { skinManager.registerSkin(m, code); this._applySkinPhrases(m); }
          catch (e) { console.error('[app] 加载导入皮肤失败:', m.id, e); }
        }
      }
    } catch (e) { console.error('[app] 读取导入皮肤列表失败:', e); }
  }

  // ═══ 内置形象的独立主题记忆 ═══
  _loadStyleThemes() {
    try { return JSON.parse(localStorage.getItem('pet-style-themes') || '{}'); } catch (e) { return {}; }
  }
  _saveStyleThemes() {
    try { localStorage.setItem('pet-style-themes', JSON.stringify(this._styleThemes)); } catch (e) {}
  }
  /** 该形象是否为带自身主题的导入皮肤 */
  _isImportedStyle(style) {
    return skinManager.getThemes(`${petType}.${style}`).length > 0;
  }
  /** 应用某形象的主题：内置形象 setTheme 到其记忆主题；导入形象不动全局色（由皮肤主题渲染） */
  _applyStyleTheme(style) {
    if (!this._isImportedStyle(style)) {
      setTheme(this._styleThemes[style] || 'orange');
    }
  }

  /** 把皮肤自带的默认宠语写入对应形象（仅在该形象还没有宠语时，避免覆盖用户编辑） */
  _applySkinPhrases(manifest) {
    if (!manifest) return;
    const style = manifest.style;
    if (Array.isArray(manifest.phrases) && manifest.phrases.length
        && (!this._phrases[style] || this._phrases[style].length === 0)) {
      this._phrases[style] = manifest.phrases.slice();
      this._savePhrases();
    }
  }

  // ═══ 宠语存储（按形象） ═══
  _loadPhrases() {
    const defaults = JSON.parse(JSON.stringify(DEFAULT_PHRASES));
    try { const s = localStorage.getItem('pet-phrases'); if (s) Object.assign(defaults, JSON.parse(s)); } catch (e) { }
    return defaults;
  }
  _savePhrases() { try { localStorage.setItem('pet-phrases', JSON.stringify(this._phrases)); } catch (e) { } }
  _pickPhrase() {
    const arr = this._phrases[petStyle] || this._phrases.realistic || [];
    return arr[Math.floor(Math.random() * arr.length)] || '你好呀~';
  }

  // ═══ 提醒存储 ═══
  _loadReminders() { try { const s = localStorage.getItem('pet-reminders'); if (s) this._reminders = JSON.parse(s).filter(r => r.time > Date.now()); } catch (e) { } }
  _saveReminders() { try { localStorage.setItem('pet-reminders', JSON.stringify(this._reminders)); } catch (e) { } }

  _checkReminders() {
    if (this._reminderActive) return;
    const now = Date.now();
    for (const r of this._reminders) {
      if (r.time <= now) {
        this._reminders = this._reminders.filter(x => x.id !== r.id);
        this._saveReminders();
        this._reminderActive = true;
        const wa = this.screenBounds.primaryWorkArea;
        this.patrol.x = wa.x + (wa.width - CAT_VISUAL_W) / 2;
        this.patrol.y = wa.y + (wa.height - CAT_VISUAL_H) / 2;
        this._moveWin();
        this.sm.transition(STATES.IDLE);
        document.getElementById('reminderOverlay').querySelector('.reminder-content').textContent = '⏰ ' + r.text;
        document.getElementById('reminderOverlay').classList.remove('hidden');
        setTimeout(() => {
          document.getElementById('reminderOverlay').classList.add('hidden');
          this._reminderActive = false;
          this._startWalk();
          this._loop.setTargetFPS(60); // 唤醒渲染循环
        }, 5000);
        break;
      }
    }
  }
}

new DesktopPetApp();
