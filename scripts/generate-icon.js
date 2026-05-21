// desktop-pet/scripts/generate-icon.js
/**
 * 几何猫头图标生成器
 * 用 Canvas API 绘制 → sharp 多尺寸缩放 → png-to-ico 打包
 * 用法：node scripts/generate-icon.js
 */
const { createCanvas } = require('canvas');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const SIZE = 256;
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

const cx = SIZE / 2, cy = SIZE / 2;
const headW = 120, headH = 130;
const headR = 32;

// ---- 头部：圆角矩形 ----
const headX = cx - headW / 2, headY = cy - headH / 2 + 10;

const bodyGrad = ctx.createLinearGradient(headX, headY, headX, headY + headH);
bodyGrad.addColorStop(0, '#F0A040');
bodyGrad.addColorStop(0.5, '#E88030');
bodyGrad.addColorStop(1, '#E07030');
ctx.fillStyle = bodyGrad;
ctx.beginPath();
roundedRect(ctx, headX, headY, headW, headH, headR);
ctx.fill();

ctx.strokeStyle = '#C05020';
ctx.lineWidth = 4;
ctx.beginPath();
roundedRect(ctx, headX, headY, headW, headH, headR);
ctx.stroke();

// ---- 耳朵：两个三角形 ----
const earW = 36, earH = 56;
for (const side of [-1, 1]) {
  const ex = cx + side * headW * 0.28;
  const ey = headY + 4;

  ctx.fillStyle = side === -1 ? '#E07030' : '#F0A040';
  ctx.beginPath();
  ctx.moveTo(ex - earW / 2, ey + earH * 0.5);
  ctx.lineTo(ex, ey - earH * 0.6);
  ctx.lineTo(ex + earW / 2, ey + earH * 0.5);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#C05020'; ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#FFB0B0';
  ctx.beginPath();
  ctx.moveTo(ex - earW * 0.28, ey + earH * 0.45);
  ctx.lineTo(ex, ey - earH * 0.35);
  ctx.lineTo(ex + earW * 0.28, ey + earH * 0.45);
  ctx.closePath(); ctx.fill();
}

// ---- 眼睛：两个竖椭圆（暗色） ----
for (const side of [-1, 1]) {
  const ex = cx + side * 26;
  const ey = cy - 8;

  ctx.fillStyle = '#FFFEFC';
  ctx.beginPath(); ctx.ellipse(ex, ey, 18, 21, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#4A3020'; ctx.lineWidth = 3; ctx.stroke();

  const iris = ctx.createRadialGradient(ex - 2, ey - 2, 2, ex, ey, 13);
  iris.addColorStop(0, '#A0D050');
  iris.addColorStop(0.7, '#609030');
  iris.addColorStop(1, '#305010');
  ctx.fillStyle = iris;
  ctx.beginPath(); ctx.ellipse(ex, ey, 12, 15, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath(); ctx.ellipse(ex, ey, 4, 10, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.ellipse(ex - 5, ey - 6, 5, 6, -0.2, 0, Math.PI * 2); ctx.fill();
}

// ---- 鼻子 ----
ctx.fillStyle = '#FF8090';
ctx.beginPath();
ctx.moveTo(cx - 9, cy + 16);
ctx.lineTo(cx + 9, cy + 16);
ctx.lineTo(cx, cy + 25);
ctx.closePath(); ctx.fill();
ctx.strokeStyle = '#C05040'; ctx.lineWidth = 2; ctx.stroke();

// ---- 嘴线 ----
ctx.strokeStyle = '#6A4030'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
ctx.beginPath();
ctx.moveTo(cx, cy + 22);
ctx.quadraticCurveTo(cx - 8, cy + 34, cx - 14, cy + 30);
ctx.moveTo(cx, cy + 22);
ctx.quadraticCurveTo(cx + 8, cy + 34, cx + 14, cy + 30);
ctx.stroke();

// 保存 256x256 PNG
const pngPath = path.join(__dirname, '..', 'assets', 'icon.png');
const buf = canvas.toBuffer('image/png');
fs.writeFileSync(pngPath, buf);
console.log('icon.png generated (256x256)');

// 多尺寸缩放并打包为 ICO
// imagesToIco 需要 { width, height, data: Buffer } 格式的原始 RGBA 像素数据
const sizes = [16, 24, 32, 48, 64, 128, 256];
(async () => {
  const images = [];
  for (const s of sizes) {
    const raw = await sharp(buf).resize(s, s).raw().toBuffer();
    images.push({ width: s, height: s, data: raw });
    console.log('  ' + s + 'x' + s + ' OK');
  }
  const icoBuf = pngToIco.imagesToIco(images);
  const icoPath = path.join(__dirname, '..', 'assets', 'icon.ico');
  fs.writeFileSync(icoPath, icoBuf);
  console.log('icon.ico generated');
})();

function roundedRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
