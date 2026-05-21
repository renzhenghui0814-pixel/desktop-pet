// 宠物类型 + 形象（由 SkinManager 管理，此处保留供 CatRenderer 读取）
export const petType = 'cat';
export let petStyle = 'realistic';
try { const s = localStorage.getItem('pet-style'); if (s) petStyle = s; } catch(e) {}
export function setPetStyle(v) { petStyle = v; try { localStorage.setItem('pet-style', v); } catch(e) {} }

// 宠物渲染尺寸 / 骨架设计基准
const SKEL_W = 240, SKEL_H = 200;

// scale=1.0 时的尺寸
export const CAT_W = 260;
export const CAT_H = 210;
export const CAT_VISUAL_H = 150;
export const CAT_VISUAL_W = 180;

// 从骨架到视觉的基准缩放比
const BASE_SX = CAT_VISUAL_W / SKEL_W;
const BASE_SY = CAT_VISUAL_H / SKEL_H;

// 当前缩放（强制 1.0）
export let catScale = 1.0;

export function setCatScale(v) {
  catScale = Math.max(0.4, Math.min(1.6, v));
  try { localStorage.setItem('pet-scale', String(catScale)); } catch(e) {}
}

/** 获取实际渲染缩放比（骨架→视觉 × 用户缩放） */
export function getCatScale() {
  return { sx: BASE_SX * catScale, sy: BASE_SY * catScale };
}

/** 获取缩放后的窗口尺寸 */
export function getCatSize() {
  return {
    w: Math.round(CAT_W * catScale),
    h: Math.round(CAT_H * catScale),
    vw: Math.round(CAT_VISUAL_W * catScale),
    vh: Math.round(CAT_VISUAL_H * catScale),
  };
}

// 贴边距
export const EDGE_MARGIN = 55;

// 颜色 —— 橘猫色系
export const COLORS = {
  bodyDark:    [180, 75, 20],
  bodyMain:    [220, 110, 30],
  bodyLight:   [245, 150, 65],
  outline:     [155, 65, 10],
  belly:       [255, 218, 185],
  bellyShade:  [235, 190, 160],
  paw:         [255, 218, 185],
  innerEar:    [255, 175, 188],
  nose:        [255, 130, 170],
  noseOut:     [230, 60, 120],
  eyeWhite:    [255, 255, 255],
  eyeOutline:  [65, 65, 65],
  pupil:       [35, 35, 35],
  pupilHighlight: [255, 255, 255],
  mouth:       [135, 95, 95],
  whisker:     [195, 195, 195],
  stripe:      [170, 70, 12],
  stripeLight: [195, 95, 18],
  shadow:      [0, 0, 0],
  blush:       [255, 155, 175],
  tail:        [210, 105, 25],
  tailDark:    [120, 55, 20],
  // 眼睛虹膜
  irisInner:   [130, 190, 80],
  irisOuter:   [90, 150, 50],
};

// 主题配色
export const THEMES = {
  orange: { name: '橘色', style: 'round',
    bodyDark: [180, 75, 20], bodyMain: [220, 110, 30], bodyLight: [245, 150, 65],
    outline: [155, 65, 10], belly: [255, 218, 185], bellyShade: [235, 190, 160],
    paw: [255, 218, 185], innerEar: [255, 175, 188],
    nose: [255, 130, 170], noseOut: [230, 60, 120],
    eyeWhite: [255, 255, 255], eyeOutline: [65, 65, 65],
    pupil: [35, 35, 35], pupilHighlight: [255, 255, 255],
    mouth: [135, 95, 95], whisker: [195, 195, 195],
    stripe: [170, 70, 12], stripeLight: [195, 95, 18],
    shadow: [0, 0, 0], blush: [255, 155, 175],
    tail: [210, 105, 25], tailDark: [120, 55, 20],
    irisInner: [130, 190, 80], irisOuter: [90, 150, 50],
  },
  black: { name: '黑色', style: 'round',
    bodyDark: [30, 28, 28], bodyMain: [55, 50, 50], bodyLight: [90, 85, 82],
    outline: [20, 18, 18], belly: [70, 65, 62], bellyShade: [50, 46, 44],
    paw: [65, 60, 58], innerEar: [180, 150, 155],
    nose: [80, 70, 68], noseOut: [50, 42, 40],
    eyeWhite: [255, 255, 252], eyeOutline: [25, 22, 20],
    pupil: [20, 18, 16], pupilHighlight: [255, 255, 255],
    mouth: [90, 80, 78], whisker: [140, 135, 130],
    stripe: [38, 35, 33], stripeLight: [60, 55, 52],
    shadow: [0, 0, 0], blush: [120, 90, 90],
    tail: [52, 48, 46], tailDark: [25, 22, 20],
    irisInner: [180, 170, 50], irisOuter: [140, 130, 20],
  },
  white: { name: '白色', style: 'round',
    bodyDark: [200, 195, 188], bodyMain: [240, 236, 230], bodyLight: [252, 250, 248],
    outline: [170, 165, 158], belly: [248, 244, 240], bellyShade: [225, 220, 212],
    paw: [245, 240, 235], innerEar: [255, 190, 195],
    nose: [255, 160, 170], noseOut: [220, 110, 120],
    eyeWhite: [255, 255, 255], eyeOutline: [150, 145, 140],
    pupil: [30, 28, 26], pupilHighlight: [255, 255, 255],
    mouth: [180, 160, 155], whisker: [220, 218, 215],
    stripe: [225, 220, 212], stripeLight: [235, 230, 224],
    shadow: [0, 0, 0], blush: [255, 190, 195],
    tail: [235, 230, 225], tailDark: [190, 185, 178],
    irisInner: [80, 180, 220], irisOuter: [50, 140, 180],
  },
  robot: { name: '机器', style: 'robot',
    bodyDark: [80, 85, 90], bodyMain: [150, 155, 160], bodyLight: [200, 205, 210],
    outline: [60, 65, 70], belly: [180, 185, 190], bellyShade: [130, 135, 140],
    paw: [160, 165, 170], innerEar: [255, 200, 100],
    nose: [255, 80, 60], noseOut: [200, 50, 30],
    eyeWhite: [255, 255, 255], eyeOutline: [40, 45, 50],
    pupil: [255, 50, 30], pupilHighlight: [255, 255, 255],
    mouth: [100, 100, 105], whisker: [120, 125, 130],
    stripe: [100, 105, 110], stripeLight: [140, 145, 150],
    shadow: [0, 0, 0], blush: [255, 100, 80],
    tail: [140, 145, 150], tailDark: [70, 75, 80],
    irisInner: [255, 200, 50], irisOuter: [200, 150, 30],
  },
  block: { name: '积木', style: 'block',
    bodyDark: [140, 100, 60], bodyMain: [200, 150, 100], bodyLight: [240, 200, 160],
    outline: [100, 70, 40], belly: [220, 180, 150], bellyShade: [180, 140, 110],
    paw: [210, 170, 140], innerEar: [240, 180, 160],
    nose: [180, 120, 100], noseOut: [140, 80, 60],
    eyeWhite: [255, 248, 240], eyeOutline: [80, 55, 35],
    pupil: [50, 30, 20], pupilHighlight: [255, 250, 240],
    mouth: [130, 90, 70], whisker: [180, 150, 130],
    stripe: [160, 120, 80], stripeLight: [200, 160, 120],
    shadow: [0, 0, 0], blush: [230, 170, 150],
    tail: [190, 140, 90], tailDark: [120, 80, 50],
    irisInner: [100, 160, 80], irisOuter: [60, 120, 40],
  },
  demon: { name: '暗影', style: 'demon',
    bodyDark: [50, 15, 20], bodyMain: [80, 25, 35], bodyLight: [130, 60, 70],
    outline: [25, 8, 10], belly: [60, 20, 25], bellyShade: [45, 15, 20],
    paw: [70, 25, 30], innerEar: [200, 80, 80],
    nose: [180, 50, 50], noseOut: [120, 20, 20],
    eyeWhite: [255, 240, 200], eyeOutline: [20, 5, 5],
    pupil: [255, 200, 30], pupilHighlight: [255, 240, 200],
    mouth: [140, 50, 50], whisker: [150, 80, 80],
    stripe: [60, 15, 20], stripeLight: [100, 35, 45],
    shadow: [0, 0, 0], blush: [180, 50, 50],
    tail: [70, 20, 25], tailDark: [35, 8, 12],
    irisInner: [255, 180, 30], irisOuter: [200, 100, 10],
  },
  real: { name: '写实', style: 'real',
    bodyDark: [160, 75, 30], bodyMain: [200, 100, 45], bodyLight: [235, 145, 80],
    outline: [130, 55, 20], belly: [245, 210, 175], bellyShade: [225, 180, 150],
    paw: [240, 210, 180], innerEar: [245, 170, 175],
    nose: [220, 120, 130], noseOut: [190, 80, 90],
    eyeWhite: [255, 252, 250], eyeOutline: [60, 40, 25],
    pupil: [30, 25, 20], pupilHighlight: [255, 252, 248],
    mouth: [130, 90, 85], whisker: [210, 200, 195],
    stripe: [155, 65, 15], stripeLight: [185, 90, 35],
    shadow: [0, 0, 0], blush: [240, 150, 160],
    tail: [195, 95, 40], tailDark: [110, 50, 20],
    irisInner: [140, 185, 80], irisOuter: [100, 140, 50],
  },
};

// 当前主题（仅反映最后一次 setTheme 的全局色板；每个内置形象的主题记忆由 app.js 管理）
export let currentTheme = 'orange';
export const setTheme = (t) => {
  currentTheme = t;
  const theme = THEMES[t] || THEMES.orange;
  Object.assign(COLORS, theme);
};
export const getTheme = () => THEMES[currentTheme] || THEMES.orange;

// 宠语（按形象分样式）
export const DEFAULT_PHRASES = {
  realistic: [
    '今天也要开心哦！',
    '别太累啦，摸摸我嘛~',
    '你在干嘛呀？休息一下~',
    '你的代码写得真好！',
    '该喝口水了喔！',
    '别焦虑，有我在呢！',
    '摸摸头好不好？',
    '今天元气满满！',
    'bug 都被我抓走啦！',
    '偷偷看你一眼~',
    '好困呀，打个盹儿~',
    '背后有只 bug！',
    '我最喜欢看代码了~',
    '又在加班呀？多休息！',
    '呼噜呼噜~ 好舒服~',
    '给你加油打气！',
    '伸个懒腰~ 好爽！',
    '你的鼠标好暖和呀~',
    '起飞！冲冲冲！',
    '今天天气真好~',
  ],
  robot: [
    '哔哔~ 系统运行正常！',
    'CPU 温度正常，可以继续工作！',
    '检测到 bug，正在修复...',
    '电量充足，随时待命！',
    'Wi-Fi 信号满格！',
    '正在同步数据... 完成！',
    '需要充电吗？我还有 98% 电量！',
    '内存清理完毕，速度飞快！',
    '哔哔哔！发现有趣的项目！',
    '系统更新：今天也是高效的一天！',
    '正在分析你的代码... 完美！',
    '散热风扇已启动，别担心~',
    '警报！检测到你该休息了！',
    '数据备份完毕，安全第一！',
  ],
  block: [
    '咔嗒咔嗒~ 方块世界！',
    '像素虽小，快乐很大！',
    '拼好每一块，搭出精彩！',
    '嗒嗒嗒~ 今天搭什么呢？',
    '我的世界，由方块组成！',
    '咔嗒！bug 被压扁了！',
    '积木不倒，精神不灭！',
    '一块一块，慢慢来~',
    '像素风也很可爱对吧？',
    '咔嗒咔嗒~ 动起来！',
  ],
  demon: [
    '吼~ 黑暗降临！',
    '别怕，我很可爱（大概）...',
    '今天也要征服这个世界！',
    '深渊在注视着你...开玩笑的~',
    '我的爪子可比键盘锋利！',
    '吼呜~ 饿了，有零食吗？',
    '黑暗能量已充满！',
    '别看牙多，我很温柔的！',
    '翅膀展开！...撞到屏幕了',
    '吼~ 这个代码写得不错！',
  ],
};

// 状态行为时长范围（帧数，60fps）
export const STATE_DURATION = {
  idle:      [180, 480],
  sitting:   [360, 900],
  sleeping:  [600, 1500],
  stretching:[60, 120],
  grooming:  [150, 400],
  meowing:   [70, 140],
  looking:   [100, 250],
};
