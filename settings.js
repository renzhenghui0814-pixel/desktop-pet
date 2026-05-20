var S = window.settingsAPI;
// phrases 现在是 { [style]: string[] } 对象
var phrases = {}, reminders = [], currentTheme = 'orange', catScale = 1.0, petStyle = 'realistic';

S.onInit(function(data) {
  phrases = data.phrases || {};
  reminders = data.reminders || [];
  currentTheme = data.currentTheme || 'orange';
  catScale = data.catScale || 1.0;
  petStyle = data.petStyle || 'realistic';

  var slider = document.getElementById('scaleSlider');
  if (slider) { slider.value = Math.round(catScale * 100); updateScaleLabel(); }

  // 高亮当前形象
  document.querySelectorAll('#page-style .style-card').forEach(function(c) {
    c.classList.toggle('active', c.dataset.style === petStyle);
  });
  // 高亮当前配色
  document.querySelectorAll('#page-color .color-card').forEach(function(c) {
    c.classList.toggle('active', c.dataset.theme === currentTheme);
  });

  // 初始化时间选择器
  initTimePicker();

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

// ── 配色切换 ──
document.querySelectorAll('#page-color .color-card').forEach(function(c) {
  c.onclick = function() {
    currentTheme = c.dataset.theme;
    document.querySelectorAll('#page-color .color-card').forEach(function(x) { x.classList.remove('active'); });
    c.classList.add('active');
    S.send({ type: 'set-theme', theme: currentTheme });
  };
});

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

// ── 生成形象预览图 ──
(function drawPreviews() {
  var previews = {
    realistic: function(ctx) {
      ctx.fillStyle = '#f0c080'; ctx.beginPath(); ctx.arc(28, 28, 22, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e0a060'; ctx.beginPath(); ctx.arc(28, 26, 18, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(20, 24, 7, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(36, 24, 7, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#5a8e3a'; ctx.beginPath(); ctx.arc(20, 24, 4, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#5a8e3a'; ctx.beginPath(); ctx.arc(36, 24, 4, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(20, 24, 2, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(36, 24, 2, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f0a0a0'; ctx.beginPath(); ctx.arc(28, 30, 3, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e0a060'; ctx.beginPath(); ctx.moveTo(10, 14); ctx.lineTo(6, 2); ctx.lineTo(18, 10); ctx.fill();
      ctx.fillStyle = '#e0a060'; ctx.beginPath(); ctx.moveTo(46, 14); ctx.lineTo(50, 2); ctx.lineTo(38, 10); ctx.fill();
    },
    robot: function(ctx) {
      ctx.fillStyle = '#5a9ac8'; ctx.beginPath(); ctx.arc(28, 30, 22, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f8f8ff'; ctx.beginPath(); ctx.arc(28, 32, 16, 14, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f5c842'; ctx.beginPath(); ctx.arc(22, 16, 6, 5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#cc3333'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(22, 20, 8, -1, 1); ctx.stroke();
      ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(20, 28, 5, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(36, 28, 5, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(18, 26, 2, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(34, 26, 2, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e04040'; ctx.beginPath(); ctx.arc(28, 32, 3, 2.5, 0, Math.PI*2); ctx.fill();
    },
    block: function(ctx) {
      ctx.fillStyle = '#c89664'; ctx.fillRect(10, 10, 36, 22);
      ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 2; ctx.strokeRect(9, 9, 38, 24);
      ctx.fillStyle = '#c89664'; ctx.fillRect(12, 6, 32, 14);
      ctx.strokeRect(11, 5, 34, 16);
      ctx.fillStyle = '#333'; ctx.fillRect(16, 10, 5, 7); ctx.fillStyle = '#333'; ctx.fillRect(35, 10, 5, 7);
      ctx.fillStyle = '#e08080'; ctx.fillRect(26, 16, 4, 3);
      ctx.fillRect(18, 30, 8, 8); ctx.fillRect(30, 30, 8, 8);
      ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 1;
      ctx.strokeRect(17, 29, 10, 10); ctx.strokeRect(29, 29, 10, 10);
    },
    demon: function(ctx) {
      ctx.fillStyle = '#501020'; ctx.beginPath(); ctx.arc(28, 30, 20, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#401010'; ctx.beginPath(); ctx.moveTo(14, 18); ctx.lineTo(6, 2); ctx.lineTo(18, 14); ctx.fill();
      ctx.fillStyle = '#401010'; ctx.beginPath(); ctx.moveTo(42, 18); ctx.lineTo(50, 2); ctx.lineTo(38, 14); ctx.fill();
      ctx.fillStyle = '#e8ff00'; ctx.beginPath(); ctx.arc(20, 26, 5, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e8ff00'; ctx.beginPath(); ctx.arc(36, 26, 5, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(20, 26, 2, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(36, 26, 2, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(22, 34); ctx.lineTo(24, 42); ctx.lineTo(26, 34); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(34, 34); ctx.lineTo(32, 42); ctx.lineTo(30, 34); ctx.fill();
    }
  };

  setTimeout(function() {
    document.querySelectorAll('#page-style .style-card').forEach(function(card) {
      var s = card.dataset.style;
      var fn = previews[s];
      if (!fn) return;
      var iconDiv = card.querySelector('.style-icon');
      if (!iconDiv) return;
      var canvas = document.createElement('canvas');
      canvas.width = 56; canvas.height = 56;
      canvas.style.cssText = 'border-radius:50%;margin:0 auto 8px;display:block';
      canvas.className = 'style-icon';
      fn(canvas.getContext('2d'));
      iconDiv.replaceWith(canvas);
    });
  }, 300);
})();
