// 注意：ELECTRON_RUN_AS_NODE 必须在启动 Electron 之前在 shell 中清除。
// 此处的 delete 对 Electron 初始启动模式无效（C++ 层检查早于 JS 执行），
// 但可作为安全措施防止子进程（renderer、GPU 等）继承该变量。
// 启动方式（PowerShell）：Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue; npx electron .
if (process.env.ELECTRON_RUN_AS_NODE) {
  console.warn('[main] ELECTRON_RUN_AS_NODE 已设置，删除中...若窗口未出现，请在 shell 中先清除该变量再启动');
}
delete process.env.ELECTRON_RUN_AS_NODE;

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWin = null;
let settingsWin = null;
let cursorTimer = null;

function createMain() {
  const sh = screen.getPrimaryDisplay().workAreaSize.height;
  mainWin = new BrowserWindow({
    width: 260, height: 210, x: 300, y: sh - 210,
    transparent: true, frame: false, alwaysOnTop: true,
    skipTaskbar: true, resizable: false, hasShadow: false,
    type: 'toolbar',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, contextIsolation: true, sandbox: false,
      backgroundThrottling: false, // 失焦/被设置窗口遮挡时仍保持渲染（否则切主题等无反应）
    },
  });
  mainWin.setAlwaysOnTop(true, 'screen-saver');
  mainWin.setVisibleOnAllWorkspaces(true);
  mainWin.loadFile('index.html');
  mainWin.setIgnoreMouseEvents(false);

  cursorTimer = setInterval(() => {
    if (!mainWin || mainWin.isDestroyed()) return;
    const c = screen.getCursorScreenPoint();
    const b = mainWin.getBounds();
    mainWin.webContents.send('cursor', { x: c.x, y: c.y, wx: b.x, wy: b.y, ww: b.width, wh: b.height });
  }, 200); // 从 50 改为 200

  mainWin.on('closed', () => { clearInterval(cursorTimer); mainWin = null; });
}

// ── 设置窗口 ──
function openSettings(data) {
  if (settingsWin && !settingsWin.isDestroyed()) { settingsWin.focus(); return; }

  const disp = screen.getPrimaryDisplay().workAreaSize;
  const pw = 360, ph = 440;
  settingsWin = new BrowserWindow({
    width: pw, height: ph,
    x: Math.round((disp.width - pw) / 2),
    y: Math.round((disp.height - ph) / 2),
    frame: false, alwaysOnTop: true, resizable: true,
    skipTaskbar: true, backgroundColor: '#fff',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload-settings.js'),
      nodeIntegration: false, contextIsolation: true, sandbox: false,
    },
  });
  settingsWin.setAlwaysOnTop(true, 'screen-saver');
  settingsWin.loadFile('settings.html');
  settingsWin.on('closed', () => {
    // 确保无论设置窗口如何关闭，宠物都恢复活动
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send('settings-act', { type: 'settings-closed' });
    }
    settingsWin = null;
  });
  settingsWin.webContents.on('did-finish-load', () => {
    settingsWin.webContents.send('init', data);
  });
}

// ── IPC ──
ipcMain.handle('set-click-through', (_e, v) => { mainWin?.setIgnoreMouseEvents(v, { forward: true }); });
ipcMain.handle('move-window', (_e, x, y, w, h) => {
  // 防护：参数可能为 NaN/undefined
  if (typeof x !== 'number' || isNaN(x) || typeof y !== 'number' || isNaN(y)) {
    console.warn('[main] move-window 收到无效参数:', { x, y, w, h });
    return;
  }
  mainWin?.setBounds({ x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h) });
});
ipcMain.handle('get-all-displays', () => screen.getAllDisplays().map(d => ({
  id: d.id, bounds: d.bounds, workArea: d.workArea, scaleFactor: d.scaleFactor,
})));
ipcMain.handle('get-window-bounds', () => mainWin?.getBounds());
ipcMain.handle('open-settings', (_e, data) => { openSettings(data); });
ipcMain.handle('log-error', (_e, msg) => { console.error('[renderer]', msg); });

// 设置窗口 → 宠物窗口
ipcMain.on('settings-act', (_e, act) => {
  if (mainWin && !mainWin.isDestroyed()) mainWin.webContents.send('settings-act', act);
  if (act.type === 'close') { settingsWin?.close(); }
  if (act.type === 'quit') { settingsWin?.close(); mainWin?.close(); }
});

// ── 皮肤导入 ──
const fs = require('fs');
const { execSync } = require('child_process');

ipcMain.handle('import-skin', async (_e, zipPath) => {
  // 安全校验：仅允许 .zip
  if (!zipPath || !zipPath.toLowerCase().endsWith('.zip')) {
    return { success: false, error: '仅支持 .zip 文件' };
  }
  const skinName = path.basename(zipPath, '.zip');
  const destDir = path.join(__dirname, 'skins', 'imported', skinName);

  try {
    // 使用 PowerShell 解压
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`, { timeout: 30000 });

    // 校验 skin.json
    const manifestPath = path.join(destDir, 'skin.json');
    if (!fs.existsSync(manifestPath)) {
      fs.rmSync(destDir, { recursive: true });
      return { success: false, error: '缺少 skin.json' };
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    if (!manifest.id || !manifest.name || !manifest.entry) {
      fs.rmSync(destDir, { recursive: true });
      return { success: false, error: 'skin.json 缺少必填字段 (id/name/entry)' };
    }

    // 校验 entry 文件存在
    const entryPath = path.join(destDir, manifest.entry);
    if (!fs.existsSync(entryPath)) {
      fs.rmSync(destDir, { recursive: true });
      return { success: false, error: `entry 文件不存在: ${manifest.entry}` };
    }

    // 安全检查：禁止可执行文件
    const dangerous = ['.exe', '.bat', '.ps1', '.sh', '.com', '.dll'];
    const files = fs.readdirSync(destDir, { recursive: true });
    for (const f of files) {
      if (dangerous.some(ext => f.toLowerCase().endsWith(ext))) {
        fs.rmSync(destDir, { recursive: true });
        return { success: false, error: `发现禁止的文件类型: ${path.extname(f)}` };
      }
    }

    // 大小限制 5MB
    let totalSize = 0;
    for (const f of files) {
      totalSize += fs.statSync(path.join(destDir, f)).size;
    }
    if (totalSize > 5 * 1024 * 1024) {
      fs.rmSync(destDir, { recursive: true });
      return { success: false, error: '皮肤包超过 5MB 限制' };
    }

    // 读取 renderer.js 内容
    const rendererCode = fs.readFileSync(entryPath, 'utf-8');

    return { success: true, manifest, rendererCode };
  } catch (e) {
    // 清理失败的导入
    try { if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true }); } catch (_) {}
    return { success: false, error: e.message || '导入失败' };
  }
});

app.whenReady().then(createMain);
app.on('window-all-closed', () => app.quit());
