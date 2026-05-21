// desktop-pet/src/skins/SkinManager.js
/**
 * 皮肤管理器 — 替代 pets/index.js 硬编码 REGISTRY。
 * 内置 4 个皮肤静态导入，支持 imported/ 目录动态发现，
 * 提供 getRenderer（带缓存）/ listSkins / importSkin。
 */
import { CatRealistic } from '../../skins/cat.realistic/renderer.js';
import { CatRobot } from '../../skins/cat.robot/renderer.js';
import { CatBlock } from '../../skins/cat.block/renderer.js';
import { CatDemon } from '../../skins/cat.demon/renderer.js';

const BUILTIN = {
  'cat.realistic': CatRealistic,
  'cat.robot': CatRobot,
  'cat.block': CatBlock,
  'cat.demon': CatDemon,
};

const BUILTIN_MANIFESTS = [
  { id: 'cat.realistic', name: '写实橘猫', type: 'cat', style: 'realistic', icon: '🐱', builtin: true },
  { id: 'cat.robot', name: '哆啦猫梦', type: 'cat', style: 'robot', icon: '🤖', builtin: true },
  { id: 'cat.block', name: '积木猫', type: 'cat', style: 'block', icon: '🧱', builtin: true },
  { id: 'cat.demon', name: '暗影恶兽', type: 'cat', style: 'demon', icon: '👹', builtin: true },
];

export class SkinManager {
  constructor() {
    this._registry = { ...BUILTIN };
    this._cache = {};
    this._manifests = [...BUILTIN_MANIFESTS];
    this._activeTheme = this._loadActiveThemes(); // { [skinId]: themeId } 导入皮肤当前主题
  }

  /** 获取渲染器实例（带缓存），petType+petStyle 不变时复用同一实例 */
  getRenderer(type, style) {
    const key = `${type}.${style}`;
    if (!this._cache[key]) {
      const Cls = typeof this._registry[key] === 'function'
        ? this._registry[key]
        : BUILTIN['cat.realistic']; // fallback
      this._cache[key] = new Cls();
    }
    return this._cache[key];
  }

  // ── 皮肤主题管理（仅导入皮肤；内置皮肤无 themes，相关方法返回空/null） ──
  _loadActiveThemes() {
    try { return JSON.parse(localStorage.getItem('pet-skin-themes') || '{}'); } catch (e) { return {}; }
  }
  _saveActiveThemes() {
    try { localStorage.setItem('pet-skin-themes', JSON.stringify(this._activeTheme)); } catch (e) {}
  }
  /** 按 id 取 manifest */
  getManifest(id) {
    return this._manifests.find(m => m.id === id) || null;
  }
  /** 取某皮肤的主题列表（无则空数组） */
  getThemes(id) {
    const m = this.getManifest(id);
    return (m && Array.isArray(m.themes)) ? m.themes : [];
  }
  /** 当前激活主题 id：已选且合法则用之，否则取首个，再无返回 null */
  getActiveThemeId(id) {
    const themes = this.getThemes(id);
    if (!themes.length) return null;
    const cur = this._activeTheme[id];
    if (cur && themes.some(t => t.id === cur)) return cur;
    return themes[0].id;
  }
  /** 设置某皮肤的当前主题并持久化 */
  setActiveTheme(id, themeId) {
    this._activeTheme[id] = themeId;
    this._saveActiveThemes();
  }
  /** 返回当前皮肤当前主题的 colors 对象；内置或无主题返回 null（渲染器走默认/全局色） */
  getActiveThemeColors(type, style) {
    const id = `${type}.${style}`;
    const themes = this.getThemes(id);
    if (!themes.length) return null;
    const tid = this.getActiveThemeId(id);
    const theme = themes.find(t => t.id === tid) || themes[0];
    return theme.colors || null;
  }

  /** 列出所有已注册皮肤（给设置面板用） */
  listSkins(typeFilter) {
    let list = [...this._manifests];
    if (typeFilter) list = list.filter(m => m.type === typeFilter);
    return list;
  }

  /** 注册导入的皮肤（由 main→renderer IPC 传入的 JS 代码） */
  registerSkin(manifest, rendererCode) {
    const key = manifest.id;
    // 安全校验 id 格式
    if (!/^[a-z0-9._-]+$/.test(key)) {
      throw new Error('皮肤 ID 格式非法: ' + key);
    }
    // 动态创建渲染器类
    const rendererClass = this._compileRenderer(rendererCode, key);
    this._registry[key] = rendererClass;
    this._manifests.push({ ...manifest, builtin: false });
    // 清除旧缓存，下次 getRenderer 时重建
    delete this._cache[key];
    return true;
  }

  /** 使用 Function 构造器编译渲染器代码（沙箱环境，无 Node API 访问） */
  _compileRenderer(code, id) {
    try {
      const fn = new Function('exports', code + '\nreturn exports;');
      const exports = {};
      fn(exports);
      const Cls = exports.default || exports[id] || Object.values(exports)[0];
      if (typeof Cls !== 'function') {
        throw new Error('渲染器模块未导出类');
      }
      return Cls;
    } catch (e) {
      console.error('[SkinManager] 编译渲染器失败:', id, e);
      throw e;
    }
  }

  /** 注销皮肤（仅 imported 皮肤可删除） */
  unregisterSkin(id) {
    delete this._registry[id];
    delete this._cache[id];
    this._manifests = this._manifests.filter(m => m.id !== id);
  }
}

// 全局单例
export const skinManager = new SkinManager();
