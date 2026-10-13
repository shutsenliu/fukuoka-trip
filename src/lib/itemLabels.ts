import type { ItemType } from '../types';
export const itemLabels: Record<ItemType, { name: string; goal: string; done: string; icon: string }> = {
  shopping: { name: '購物', goal: '想買', done: '已購買', icon: '🛍' },
  food: { name: '美食', goal: '想吃', done: '已吃過', icon: '🍡' },
  experience: { name: '體驗', goal: '想體驗', done: '已體驗', icon: '✨' },
};
