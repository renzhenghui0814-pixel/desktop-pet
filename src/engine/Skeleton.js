/**
 * 猫骨骼定义 + 姿势关键帧数据
 * 骨骼点是猫咪各部位的锚点，姿势混合时在这些关键帧之间 lerp
 */

// 默认骨骼——胖短腿圆脸猫
export const DEFAULT_SKELETON = {
  headX: 130, headY: 68,
  bodyX: 88, bodyY: 114,
  bodyRX: 52, bodyRY: 34,  // 更圆更胖
  // 短腿
  frontHipX: 108, frontHipY: 128,
  frontKneeX: 112, frontKneeY: 140,
  frontPawX: 114, frontPawY: 150,
  backHipX: 70, backHipY: 128,
  backKneeX: 66, backKneeY: 140,
  backPawX: 62, backPawY: 150,
  // 短尾
  tailBaseX: 40, tailBaseY: 110,
  tailMidX: 22, tailMidY: 92,
  tailTipX: 26, tailTipY: 74,
  facingRight: 1,
};

// 各状态的姿势关键帧（相对于默认骨骼的偏移）
export const POSES = {
  walking: (phase) => {
    const stride = Math.sin(phase), bob = Math.abs(Math.sin(phase)) * 1.5;
    return {
      frontPawY: 152 + stride * 5, backPawY: 152 - stride * 5,
      frontKneeY: 140 + stride * 3, backKneeY: 140 - stride * 3,
      bodyY: 114 - bob, headY: 68 - bob,
      tailMidY: 92 + Math.sin(phase * 1.8) * 8,
      tailTipY: 74 + Math.sin(phase * 1.8 + 1) * 8,
      tailMidX: 22 + Math.sin(phase * 1.8) * 6,
      tailTipX: 26 + Math.sin(phase * 1.8 + 1) * 4,
    };
  },

  sitting: {
    bodyX: 88, bodyY: 118, bodyRX: 42, bodyRY: 36,
    headX: 128, headY: 64,
    frontHipY: 134, frontKneeY: 146, frontPawY: 154,
    backHipY: 130, backKneeY: 142, backPawY: 152,
    tailBaseY: 114, tailMidY: 98, tailTipY: 88,
  },

  sleeping: {
    bodyY: 130, bodyRX: 64, bodyRY: 14, bodyX: 90,
    headX: 146, headY: 96,
    frontHipY: 140, frontKneeY: 148, frontPawY: 154,
    backHipY: 138, backKneeY: 146, backPawY: 152,
    tailBaseX: 32, tailBaseY: 122, tailMidX: 12, tailMidY: 128, tailTipX: 4, tailTipY: 124,
  },

  stretching: (t) => {
    const s = Math.sin(t * Math.PI) * 0.5 + 0.5;
    return {
      bodyX: 80 - s * 5, bodyRX: 50 + s * 6, bodyRY: 32 - s * 4,
      headX: 120 + s * 6, headY: 68 - s * 3,
      frontHipX: 100 + s * 2, frontKneeY: 140 + s * 4, frontPawY: 150 + s * 6,
    };
  },

  grooming: (t) => {
    const l = Math.sin(t * 1.8) * 0.5 + 0.5;
    return { headX: 124 - l * 6, headY: 68 + l * 4, bodyY: 114, bodyX: 88, frontHipX: 104 - l * 3, frontKneeY: 142 - l * 2 };
  },

  meowing: (t) => {
    const m = Math.sin(t * 2.5) * 0.5 + 0.5;
    return { headY: 68 - m * 4, headX: 130, bodyY: 114, tailMidY: 92 + m * 8, tailTipY: 74 + m * 10 };
  },

  standing: (lx, ly) => ({
    // 双腿站立——身体竖直，前腿抬起
    bodyX: 82, bodyY: 88, bodyRX: 38, bodyRY: 48,
    headX: 90, headY: 30 + (ly || 0) * 3,
    frontHipX: 90, frontHipY: 88, frontKneeX: 80, frontKneeY: 60, frontPawX: 70, frontPawY: 42,
    backHipX: 76, backHipY: 120, backKneeX: 72, backKneeY: 140, backPawX: 68, backPawY: 152,
    tailBaseX: 48, tailBaseY: 126, tailMidX: 28, tailMidY: 140, tailTipX: 22, tailTipY: 148,
  }),
  looking: (lx, ly) => ({ headX: 130 + lx * 5, headY: 68 + ly * 3 }),
  idle: (t) => {
    const b = Math.sin(t * 0.6) * 1.2;
    return { headY: 68 + b, bodyY: 114 + b, tailMidY: 92 + Math.sin(t * 0.5) * 4, tailTipY: 74 + Math.sin(t * 0.5 + 1) * 5 };
  },
};

/**
 * 将基础骨骼与姿势偏移合并
 * @param {object} base - 基础骨骼值
 * @param {object|function} pose - 姿势对象或返回姿势的函数
 * @param {number} blend - 混合系数 0..1
 */
export function blendPose(base, pose, blend = 1) {
  const offsets = typeof pose === 'function' ? pose : pose;
  const result = { ...base };
  for (const [key, val] of Object.entries(offsets)) {
    if (typeof val === 'number') {
      result[key] = base[key] + (val - base[key]) * blend;
    }
  }
  return result;
}

/**
 * 在两个骨骼姿势之间线性插值
 */
export function lerpSkeleton(a, b, t) {
  const result = {};
  for (const key of Object.keys(a)) {
    if (typeof a[key] === 'number' && typeof b[key] === 'number') {
      result[key] = a[key] + (b[key] - a[key]) * t;
    } else {
      result[key] = a[key];
    }
  }
  return result;
}
