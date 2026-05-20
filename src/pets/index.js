/**
 * 宠物注册表 — 按 petType + petStyle 分发绘制
 */
import { CatRealistic } from './cat/Realistic.js';
import { CatRobot } from './cat/Robot.js';
import { CatBlock } from './cat/Block.js';
import { CatDemon } from './cat/Demon.js';

const REGISTRY = {
  cat: {
    realistic: CatRealistic,
    robot: CatRobot,
    block: CatBlock,
    demon: CatDemon,
  },
  // 未来扩展: dog, rabbit, hamster, bird ...
};

export function getPetRenderer(petType, petStyle) {
  const typeMap = REGISTRY[petType];
  if (!typeMap) return new REGISTRY.cat.realistic(); // 兜底
  const Cls = typeMap[petStyle] || typeMap.realistic;
  return new Cls();
}
