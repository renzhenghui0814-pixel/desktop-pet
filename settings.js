import { skinManager } from './src/skins/SkinManager.js';
import { setTheme } from './src/constants.js';
import { AnimationState } from './src/skins/AnimationState.js';

var S = window.settingsAPI;
// phrases 现在是 { [style]: string[] } 对象
var phrases = {}, reminders = [], currentTheme = 'orange', catScale = 1.0, petStyle = 'realistic';

// 把已导入皮肤注册到设置窗口自己的 skinManager（用于画真实头像 + 读主题）
(function loadImportedToSettings() {
  try {
    var arr = JSON.parse(localStorage.getItem('pet-imported-skins') || '[]');
    arr.forEach(function (x) {
      var m = x.manifest || x;
      if (m && x.code && m.id) { try { skinManager.registerSkin(m, x.code); } catch (e) {} }
    });
  } catch (e) {}
})();

S.onInit(function(data) {
  phrases = data.phrases || {};
  reminders = data.reminders || [];
  currentTheme = data.currentTheme || 'orange';
  catScale = data.catScale || 1.0;
  petStyle = data.petStyle || 'realistic';

  var slider = document.getElementById('scaleSlider');
  if (slider) { slider.value = Math.round(catScale * 100); updateScaleLabel(); }

  // 初始化时间选择器
  initTimePicker();

  // 渲染形象列表（含导入皮肤头像）与主题菜单（按当前形象联动）
  var styleGrid = document.querySelector('#page-style .style-grid');
  if (styleGrid) renderSkins(styleGrid);
  renderThemeMenu(petStyle);

  renderPhrases();
  renderReminders();
});

// ── 关闭 ──
document.getElementById('closeBtn').onclick = function() { S.send({ type: 'close' }); };

// ── 拖动 ──
(function() {
  var hdr = document.getElementById('dragHdr'), dragging = false, sx = 0, sy = 0;
  hdr.onmousedown = function(e) { dragging = true; sx = e.screenX; sy = e.screenY; };
  window.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    var dx = e.screenX - sx, dy = e.screenY - sy;
    sx = e.screenX; sy = e.screenY;
    window.moveBy(dx, dy);
  });
  window.addEventListener('mouseup', function() { dragging = false; });
})();

// ── Tab ──
document.querySelectorAll('.tab').forEach(function(t) {
  t.onclick = function() {
    document.querySelectorAll('.tab').forEach(function(x) { x.classList.remove('active'); });
    t.classList.add('active');
    document.querySelectorAll('.page').forEach(function(x) { x.classList.remove('active'); });
    var pg = document.getElementById('page-' + t.dataset.tab);
    if (pg) pg.classList.add('active');
  };
});

// ── 形象切换 ──
document.querySelectorAll('#page-style .style-card').forEach(function(c) {
  c.onclick = function() {
    petStyle = c.dataset.style;
    document.querySelectorAll('#page-style .style-card').forEach(function(x) { x.classList.remove('active'); });
    c.classList.add('active');
    S.send({ type: 'set-style', style: petStyle });
    // 切换到该形象的宠语
    renderPhrases();
  };
});

// ── 配色 / 主题（按形象联动） ──
var BUILTIN_THEMES = [
  { theme: 'orange', name: '橘色', g: 'linear-gradient(135deg, #e08a28, #f0b048)' },
  { theme: 'black',  name: '黑色', g: 'linear-gradient(135deg, #3a3532, #5a5550)' },
  { theme: 'white',  name: '白色', g: 'linear-gradient(135deg, #f0ece6, #faf8f4)' },
];

// 从 localStorage 找某 style 对应的导入皮肤（含 manifest 与渲染器 code）
function getImportedSkin(style) {
  try {
    var arr = JSON.parse(localStorage.getItem('pet-imported-skins') || '[]');
    for (var i = 0; i < arr.length; i++) {
      var m = arr[i].manifest || arr[i];
      if (m && m.style === style) return { manifest: m, code: arr[i].code };
    }
  } catch (e) {}
  return null;
}

// 内置形象的独立主题记忆（每个内置形象记住自己的橘/黑/白）
function getStyleTheme(style) {
  try {
    var m = JSON.parse(localStorage.getItem('pet-style-themes') || '{}');
    return m[style] || 'orange';
  } catch (e) { return 'orange'; }
}
function setStyleTheme(style, theme) {
  try {
    var m = JSON.parse(localStorage.getItem('pet-style-themes') || '{}');
    m[style] = theme;
    localStorage.setItem('pet-style-themes', JSON.stringify(m));
  } catch (e) {}
}

// 渲染"主题"标签：内置形象用橘/黑/白全局主题，导入形象用其自带主题
function renderThemeMenu(style) {
  var grid = document.querySelector('#page-color .color-grid');
  if (!grid) return;
  grid.innerHTML = '';
  var imp = getImportedSkin(style);

  if (imp && imp.manifest.themes && imp.manifest.themes.length) {
    var id = imp.manifest.id;
    var themes = imp.manifest.themes;
    var active = skinManager.getActiveThemeId(id);
    themes.forEach(function(t) {
      var c1 = (t.colors && (t.colors.light || t.colors.main)) || '#ccc';
      var c2 = (t.colors && (t.colors.dark || t.colors.main)) || '#999';
      var card = document.createElement('div');
      card.className = 'color-card' + (t.id === active ? ' active' : '');
      card.innerHTML = '<div class="color-dot" style="background:linear-gradient(135deg,' + c1 + ',' + c2 + ')"></div><div class="color-name">' + t.name + '</div>';
      card.onclick = function() {
        skinManager.setActiveTheme(id, t.id); // 设置端立即更新，头像同步刷新（消除异步竞态）
        grid.querySelectorAll('.color-card').forEach(function(x){ x.classList.remove('active'); });
        card.classList.add('active');
        S.send({ type: 'set-skin-theme', id: id, themeId: t.id });
        var g = document.querySelector('#page-style .style-grid');
        if (g) renderSkins(g);
      };
      grid.appendChild(card);
    });
  } else {
    var styleTheme = getStyleTheme(style); // 该内置形象记忆的主题
    BUILTIN_THEMES.forEach(function(b) {
      var card = document.createElement('div');
      card.className = 'color-card' + (b.theme === styleTheme ? ' active' : '');
      card.innerHTML = '<div class="color-dot" style="background:' + b.g + '"></div><div class="color-name">' + b.name + '</div>';
      card.onclick = function() {
        setStyleTheme(style, b.theme); // 只记住当前形象的主题（设置端立即写入，头像即时刷新）
        currentTheme = b.theme;
        setTheme(b.theme);
        grid.querySelectorAll('.color-card').forEach(function(x){ x.classList.remove('active'); });
        card.classList.add('active');
        S.send({ type: 'set-theme', theme: b.theme });
        var g = document.querySelector('#page-style .style-grid');
        if (g) renderSkins(g);
      };
      grid.appendChild(card);
    });
  }
}

// 用真实渲染器在小 canvas 上画形象头像：内置跟随全局主题，导入跟随皮肤主题
function drawAvatar(canvas, style) {
  try {
    var themeColors = skinManager.getActiveThemeColors('cat', style); // 导入返回 colors，内置返回 null
    if (!themeColors) setTheme(getStyleTheme(style)); // 内置：用该形象记忆的主题
    var renderer = skinManager.getRenderer('cat', style);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var s = 0.35;
    ctx.save();
    ctx.translate(canvas.width / 2 - 120 * s, canvas.height / 2 - 85 * s);
    ctx.scale(s, s);
    var st = new AnimationState();
    st.action = 'idle'; st.phase = 0.6;
    renderer.draw(ctx, st, { theme: themeColors, scale: { sx: s, sy: s } });
    ctx.restore();
    return true;
  } catch (e) { return false; }
}

// ── 缩放 ──
var scaleSlider = document.getElementById('scaleSlider');
var scaleVal = document.getElementById('scaleVal');
function updateScaleLabel() {
  if (scaleVal) scaleVal.textContent = (scaleSlider ? scaleSlider.value : 100) + '%';
}
if (scaleSlider) {
  scaleSlider.oninput = function() {
    updateScaleLabel();
    S.send({ type: 'set-scale', scale: parseInt(scaleSlider.value) / 100 });
  };
}

// ── 时间选择器初始化 ──
function initTimePicker() {
  var hSel = document.getElementById('reminderHour');
  var mSel = document.getElementById('reminderMinute');
  if (!hSel || !mSel) return;

  for (var h = 0; h < 24; h++) {
    var opt = document.createElement('option');
    opt.value = h;
    opt.textContent = ('0' + h).slice(-2);
    hSel.appendChild(opt);
  }
  for (var m = 0; m < 60; m++) {
    var opt = document.createElement('option');
    opt.value = m;
    opt.textContent = ('0' + m).slice(-2);
    mSel.appendChild(opt);
  }

  // 默认为当前时间的下一分钟
  var now = new Date();
  hSel.value = now.getHours();
  mSel.value = now.getMinutes() + 1;
  if (mSel.value >= 60) { mSel.value = 0; hSel.value = (now.getHours() + 1) % 24; }

  // 滚动事件
  hSel.addEventListener('wheel', function(e) {
    e.preventDefault();
    if (e.deltaY > 0) { hSel.selectedIndex = Math.min(hSel.selectedIndex + 1, 23); }
    else { hSel.selectedIndex = Math.max(hSel.selectedIndex - 1, 0); }
  });
  mSel.addEventListener('wheel', function(e) {
    e.preventDefault();
    if (e.deltaY > 0) { mSel.selectedIndex = Math.min(mSel.selectedIndex + 1, 59); }
    else { mSel.selectedIndex = Math.max(mSel.selectedIndex - 1, 0); }
  });
}

// ── 宠语（按形象存储） ──
function curPhrases() {
  if (!phrases[petStyle]) phrases[petStyle] = [];
  return phrases[petStyle];
}

function renderPhrases() {
  var list = document.getElementById('phraseList');
  list.innerHTML = '';
  var arr = curPhrases();
  arr.forEach(function(text, i) {
    var row = document.createElement('div'); row.className = 'item';
    row.innerHTML = '<span>' + text + '</span><button class="btn">改</button><button class="btn del">删</button>';
    row.querySelector('.btn').onclick = function() {
      var v = prompt('修改宠语', text);
      if (v && v.trim()) { arr[i] = v.trim(); saveP(); renderPhrases(); }
    };
    row.querySelector('.btn.del').onclick = function() { arr.splice(i, 1); saveP(); renderPhrases(); };
    list.appendChild(row);
  });
}
function saveP() { S.send({ type: 'update-phrases', phrases: phrases }); }
document.getElementById('phraseAdd').onclick = function() {
  var inp = document.getElementById('phraseInput'), v = inp.value.trim();
  if (v) { curPhrases().push(v); saveP(); inp.value = ''; renderPhrases(); }
};

// ── 提醒 ──
function renderReminders() {
  var list = document.getElementById('reminderList');
  list.innerHTML = '';
  reminders.sort(function(a, b) { return a.time - b.time; }).forEach(function(r) {
    var d = new Date(r.time);
    var ts = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    var row = document.createElement('div'); row.className = 'item';
    row.innerHTML = '<em>' + ts + '</em><span>' + r.text + '</span><button class="btn del">删</button>';
    row.querySelector('.btn.del').onclick = function() {
      reminders = reminders.filter(function(x) { return x.id !== r.id; });
      saveR(); renderReminders();
    };
    list.appendChild(row);
  });
}
function saveR() { S.send({ type: 'update-reminders', reminders: reminders }); }
document.getElementById('reminderAdd').onclick = function() {
  var hSel = document.getElementById('reminderHour');
  var mSel = document.getElementById('reminderMinute');
  var inp = document.getElementById('reminderInput');
  var text = inp.value.trim();
  if (!text) return;

  var h = parseInt(hSel.value), min = parseInt(mSel.value);
  var now = new Date();
  var t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, min, 0, 0);
  if (t <= now) t.setDate(t.getDate() + 1);
  reminders.push({ id: Date.now(), time: t.getTime(), text: text });
  saveR(); inp.value = ''; renderReminders();
};

// ── 退出 ──
document.getElementById('quitBtn').onclick = function() { S.send({ type: 'quit' }); };

// ── 动态皮肤列表 ──
function loadSkins() {
  var list = [
    { id: 'cat.realistic', name: '写实橘猫', type: 'cat', style: 'realistic', icon: '🐱', builtin: true },
    { id: 'cat.robot', name: '哆啦猫梦', type: 'cat', style: 'robot', icon: '🤖', builtin: true },
    { id: 'cat.block', name: '积木猫', type: 'cat', style: 'block', icon: '🧱', builtin: true },
    { id: 'cat.demon', name: '暗影恶兽', type: 'cat', style: 'demon', icon: '👹', builtin: true },
  ];

  try {
    var imported = JSON.parse(localStorage.getItem('pet-imported-skins') || '[]');
    // 兼容新格式 {manifest, code} 与旧格式（纯 manifest）
    imported.forEach(function(x){ list.push(x.manifest || x); });
  } catch (e) {}

  return list;
}

function renderSkins(container) {
  var skins = loadSkins();
  container.innerHTML = '';
  var currentStyle = localStorage.getItem('pet-style') || 'realistic';

  skins.forEach(function(skin) {
    var card = document.createElement('div');
    card.className = 'style-card' + (skin.style === currentStyle ? ' active' : '');
    card.dataset.style = skin.style;
    card.style.cursor = 'pointer';
    card.innerHTML = '<div class="style-icon">' + skin.icon + '</div><div class="style-name">' + skin.name + '</div><div class="style-desc">' + (skin.builtin ? '内置' : '导入') + '</div>';
    card.onclick = function() {
      petStyle = skin.style;
      document.querySelectorAll('#page-style .style-card').forEach(function(x) { x.classList.remove('active'); });
      card.classList.add('active');
      S.send({ type: 'set-style', style: petStyle });
      renderPhrases();
      renderThemeMenu(skin.style); // 主题菜单随形象联动
    };
    container.appendChild(card);

    // 用真实渲染器画头像（内置 + 导入），各自跟随主题
    var canvas = document.createElement('canvas');
    canvas.width = 56; canvas.height = 56;
    canvas.className = 'style-icon';
    canvas.style.cssText = 'border-radius:50%;margin:0 auto 8px;display:block;background:var(--cream)';
    if (drawAvatar(canvas, skin.style)) {
      var iconDiv = card.querySelector('.style-icon');
      if (iconDiv) iconDiv.replaceWith(canvas);
    }
  });

  return skins;
}

// ── 皮肤导入 ──
var importBtn = document.getElementById('importSkinBtn');
var importInput = document.getElementById('importSkinInput');
var importStatus = document.getElementById('importStatus');

if (importBtn && importInput) {
  importBtn.addEventListener('click', function() {
    importInput.click();
  });

  importInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;

    importStatus.textContent = '验证中...';
    importStatus.style.color = '#888';

    window.settingsAPI.importSkin(file.path).then(function(result) {
      if (result.success) {
        importStatus.textContent = '✅ 导入成功！';
        importStatus.style.color = '#4caf50';

        var imported = JSON.parse(localStorage.getItem('pet-imported-skins') || '[]');
        // 同 id 去重，存入 {manifest, code}，供重启后重新注册渲染器
        imported = imported.filter(function(x){ var m = x.manifest || x; return m.id !== result.manifest.id; });
        imported.push({ manifest: result.manifest, code: result.rendererCode });
        localStorage.setItem('pet-imported-skins', JSON.stringify(imported));

        // 通知主窗口注册渲染器并切换到该皮肤（否则切换时会 fallback 成写实猫）
        S.send({ type: 'register-skin', manifest: result.manifest, code: result.rendererCode });
        petStyle = result.manifest.style;

        var grid = document.querySelector('#page-style .style-grid');
        if (grid) renderSkins(grid);
        renderPhrases();
        renderThemeMenu(petStyle);
      } else {
        importStatus.textContent = '❌ ' + result.error;
        importStatus.style.color = '#f44336';
      }
    }).catch(function(err) {
      importStatus.textContent = '❌ 导入失败: ' + err.message;
      importStatus.style.color = '#f44336';
    });

    e.target.value = '';
  });
}

// 初始化时替换静态形象列表为动态列表
(function initDynamicSkins() {
  var grid = document.querySelector('#page-style .style-grid');
  if (grid) {
    renderSkins(grid);
  }
})();
