/**
 * 加权随机和工具函数
 */

/** 返回 [min, max) 的随机数 */
export function randRange(min, max) {
  return min + Math.random() * (max - min);
}

/** 返回 [min, max] 的随机整数 */
export function randInt(min, max) {
  return Math.floor(randRange(min, max + 1));
}

/** 从数组中随机取一项 */
export function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 带权重的随机选择 */
export function weightedChoice(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
