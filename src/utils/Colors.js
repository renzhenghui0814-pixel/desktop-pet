import { getTheme } from '../constants.js';

export function r(rgb, alpha = 1) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}

export function lerpColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** 从当前主题获取颜色 */
export function tc(key) {
  const theme = getTheme();
  return theme[key] || [128, 128, 128];
}
