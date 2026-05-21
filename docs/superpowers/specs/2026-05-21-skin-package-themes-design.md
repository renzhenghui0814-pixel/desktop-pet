# 设计：可携带主题 / 宠语 / 头像的皮肤包

日期：2026-05-21
状态：已确认设计，待实现

## 背景与目标

当前导入的 zip 皮肤（如 Claude 宠物）存在三个不足：

1. **不能切换主题**：内置形象通过全局 `COLORS` + `setTheme` 支持橘/黑/白主题，但导入渲染器是沙箱、颜色硬编码，无法换色。
2. **没有默认宠语**：导入形象的 `_phrases[style]` 为空，宠语菜单空白。
3. **卡片图标是 emoji**：设置面板形象卡片只显示 manifest.icon 的 emoji，不展示真实形象。

目标：让 zip 皮肤包能携带**自己的主题集、默认宠语、自绘头像**，并实现"主题随形象联动"——选中某导入形象时，主题菜单只显示该形象支持的主题。

## 关键决策（已与用户确认）

- **主题联动范围**：仅导入形象带自己的主题；内置 4 形象（写实猫/机器猫/积木猫/暗影龙）保持现状（橘/黑/白全局主题），**零改动**。
- **头像生成**：复用渲染器的 `draw` 画一帧静态站姿作为缩略图，自动跟随主题，无需皮肤作者额外写头像代码。
- **切换形象后的主题**：记住每个导入形象上次选的主题（localStorage），首次用 themes 的第一个。
- **宠语导入策略**：仅在该形象还没有宠语（首次导入、用户未编辑过）时写入默认宠语，避免覆盖用户编辑。

## 现状架构（相关部分）

- `src/constants.js`：全局 `COLORS`、`THEMES`、`setTheme`（改 COLORS）、`DEFAULT_PHRASES`（按内置 style 分组）、`petStyle` + `setPetStyle`。
- `src/skins/SkinManager.js`：单例，`_registry`（id→渲染器类）、`getRenderer(type,style)`（带缓存）、`registerSkin(manifest, code)`（`new Function` 沙箱编译）。
- `src/cat/CatRenderer.js`：`render()` 里调 `renderer.draw(ctx, state, { theme: null, scale })` —— **theme 当前恒为 null**，正好可接入皮肤主题。
- `src/app.js`：`onSettingsAct` 处理 `set-theme`/`set-style`/`register-skin` 等；`_loadImportedSkins()` 启动时从 localStorage 重新注册导入皮肤；`_phrases` 宠语存储；`_pickPhrase()`。
- `settings.js`：独立窗口的普通脚本（非 ES module）。`renderSkins()` 动态渲染形象卡片；配色页 `#page-color .color-card` 静态 3 个（orange/black/white）；`drawPreviews()` 给内置形象画预览 emoji 替代图。localStorage `pet-imported-skins` 存 `{manifest, code}` 数组。

## 设计

### 1. skin.json 格式扩展

在现有字段基础上新增两个**可选**字段：

```json
{
  "id": "cat.claude",
  "name": "克劳德",
  "type": "cat",
  "style": "claude",
  "entry": "renderer.js",
  "icon": "✳️",
  "themes": [
    { "id": "coral",    "name": "珊瑚橙", "colors": { "main": "#D97757", "...": "..." } },
    { "id": "midnight", "name": "午夜蓝", "colors": { "main": "#5B7FB9", "...": "..." } },
    { "id": "forest",   "name": "森林绿", "colors": { "main": "#5B9279", "...": "..." } }
  ],
  "phrases": ["需要我帮你看看这段代码吗?", "让我想想这个问题...", "..."]
}
```

- `themes`：数组，每项 `{ id, name, colors }`。`colors` 的键由渲染器作者自定义。
- `phrases`：默认宠语字符串数组。
- 两者都可选；缺 `themes` 的皮肤不显示主题选项，缺 `phrases` 的宠语列表为空。

主进程 `import-skin` 校验逻辑不变（仍只校验 id/name/entry + 安全检查），themes/phrases 随 manifest 一并返回，无需额外校验。

### 2. renderer.js 主题约定

渲染器从 `options.theme` 取色，缺省回退到自带默认色板：

```js
var DEFAULT = { main: '#D97757', dark: '#BE5D3A', /* ... */ };

exports.default = class ClaudePet {
  draw(ctx, st, options) {
    var C = (options && options.theme) || DEFAULT;
    // 全部绘制改用 C.main / C.dark / ...
  }
};
```

- colors 键约定（Claude 形象）：`main, dark, light, face, outline, term, star, starLight, eyeWhite, pupil, white`。
- 主题的 `colors` 必须提供这些键；DEFAULT 作为兜底（主题缺某键时不会崩，但建议齐全）。

### 3. 主题随形象联动（仅导入形象）

**数据流（选主题）**：
```
settings.js 选主题卡片
  → S.send({ type:'set-skin-theme', style, themeId })
  → app.js onSettingsAct
      → skinManager.setActiveTheme('cat.'+style, themeId)
      → localStorage 记住该皮肤当前主题
      → this._loop.requestFrame()
  → 下一帧 CatRenderer.render 取 skinManager.getActiveThemeColors(type, style)
      → renderer.draw(ctx, state, { theme: colors, scale })
```

**SkinManager 扩展**：
- 内部维护 `_activeTheme`（id→themeId）。
- `getActiveThemeColors(type, style)`：导入皮肤返回其当前主题的 colors 对象；内置皮肤或无 themes 返回 `null`（内置渲染器忽略 options.theme，照用全局 COLORS）。
- `setActiveTheme(id, themeId)` / `getThemes(id)` / `getManifest(id)`。
- 当前主题持久化：localStorage `pet-skin-themes` 存 `{ [skinId]: themeId }`，启动 `_loadImportedSkins` 后恢复。

**CatRenderer.render 改造**：把 `theme: null` 改为 `theme: skinManager.getActiveThemeColors(petType, petStyle)`。同时把 currentTheme 缓存判断扩展为也比较"皮肤主题"（避免静止帧缓存串色）。

**设置面板主题菜单联动（settings.js）**：
- 切换形象时重新渲染"主题"标签内容。
- 内置形象：显示现有 orange/black/white（走 `set-theme`，全局）。
- 导入形象：动态生成 manifest.themes 的卡片（走 `set-skin-theme`），高亮当前主题。
- 打开设置面板时，主进程把"各导入皮肤当前主题"一并下发，用于高亮。

### 4. 默认宠语

- `app.js` 处理 `register-skin` 时，若 `manifest.phrases` 非空且 `this._phrases[style]` 不存在/为空，则 `this._phrases[style] = manifest.phrases.slice()` 并 `_savePhrases()`。
- `_loadImportedSkins`（启动路径）同样补齐：已导入皮肤若宠语为空则用 manifest.phrases 填充。
- 设置面板宠语标签已按 `petStyle` 显示 `phrases[petStyle]`，导入形象选中后自然显示默认宠语，可改可删。

### 5. 头像缩略图

- `settings.js` 的 `renderSkins()` 对**导入形象**：从 localStorage `pet-imported-skins` 取该皮肤的 `code`，用 `new Function('exports', code+'\nreturn exports;')` 在沙箱编译出渲染器类，实例化后在一个小 canvas（如 56×56，按比例缩放绘制）上画一帧 `action='idle'` 的静态姿势，应用该皮肤当前主题色，作为卡片图标。
- 内置形象：保持现有 `drawPreviews()` 逻辑不变。
- 编译失败或无 code 时回退到 emoji 图标。

### 6. 名字与配色

- `skin.json` 的 `name` 由"Claude 助手"改为 **"克劳德"**。
- Claude 三主题配色：

| 键 | 珊瑚橙 coral（默认） | 午夜蓝 midnight | 森林绿 forest |
|----|----|----|----|
| main | #D97757 | #5B7FB9 | #5B9279 |
| dark | #BE5D3A | #3E5A8A | #3E6B55 |
| light | #EBA483 | #8AA8D8 | #8ABFA5 |
| face | #F7ECE4 | #EAEEF6 | #EAF2EC |
| outline | #9E4A2C | #2C3E5E | #2C4A3A |
| term | #2D2A26 | #1E2530 | #1E2A24 |
| star | #D97757 | #7B9FD9 | #6FA98C |
| starLight | #F2B58F | #AFC6EC | #A6D4BC |
| eyeWhite | #FFFFFF | #FFFFFF | #FFFFFF |
| pupil | #2D2A26 | #1E2530 | #1E2A24 |
| white | #FFFFFF | #FFFFFF | #FFFFFF |

- 默认宠语（编程助手风格，约 10 条）：
  「需要我帮你看看这段代码吗?」「让我想想这个问题...」「这个 bug 我们一起抓!」「记得 git commit 哦~」「要不要补个测试?」「你今天效率很高呢!」「喝口水,歇一会儿吧」「这段逻辑很优雅!」「我在这儿,随时帮你」「代码即诗 ✨」

## 文件改动清单

| 文件 | 改动 |
|------|------|
| `claude-pet-skin/skin.json` | name→克劳德；加 themes（3 套）、phrases |
| `claude-pet-skin/renderer.js` | 抽出 DEFAULT 色板，draw 改读 `options.theme`；重打包 zip |
| `src/skins/SkinManager.js` | 新增 `_activeTheme`、`setActiveTheme`、`getActiveThemeColors`、`getThemes`、`getManifest`；当前主题持久化 |
| `src/cat/CatRenderer.js` | `render` 传 `theme: skinManager.getActiveThemeColors(...)`；缓存判断纳入皮肤主题 |
| `src/app.js` | `register-skin` 时存默认宠语；新增 `set-skin-theme` 处理；`_loadImportedSkins` 恢复主题+补宠语；打开设置时下发皮肤主题信息 |
| `settings.js` | 主题菜单按形象联动（导入形象动态生成主题卡片）；`renderSkins` 用编译的 renderer 画头像；导入成功后刷新主题菜单 |
| `main.js` | （无需改动；import-skin 已透传完整 manifest） |

## 向后兼容

- 没有 themes/phrases 的旧皮肤照常工作（无主题选项、宠语为空、头像若有 code 则绘制否则 emoji）。
- 内置 4 形象的主题系统完全不动。
- localStorage 新增键 `pet-skin-themes`；`pet-imported-skins` 格式不变（仍 `{manifest, code}`，manifest 现在可能含 themes/phrases）。

## 测试策略

沿用已验证的"渲染进程内端到端"调试手法（临时 `_debug_*.js` + Electron + executeJavaScript，测完即删）：

1. **renderer 主题**：编译新 renderer，分别传 coral/midnight/forest 三套 colors 调 draw，断言渲染像素平均色随主题明显变化；不传 theme 时用 DEFAULT 不报错。
2. **SkinManager**：registerSkin 后 `getActiveThemeColors` 返回首主题；`setActiveTheme` 后返回对应色；内置 style 返回 null。
3. **宠语导入**：模拟 register-skin，断言 `_phrases['claude']` 被填入 manifest.phrases；已有宠语时不覆盖。
4. **头像**：用 code 沙箱编译并在小 canvas 绘制，断言非透明像素 > 0。
5. **回归**：内置形象切 orange/black/white 仍生效；之前修复的 4 个问题不回归。

测试通过后清理调试文件与测试写入的 localStorage，重启应用供用户体验。
