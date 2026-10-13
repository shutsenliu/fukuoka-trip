import type { TripDay } from '../types';
import { stores, itinerary } from './data';
export function parseItineraryMarkdown(text: string): TripDay[] {
  const days: TripDay[] = [];
  let current: TripDay | undefined;
  let collectingNotes = false;
  for (const line of text.split(/\r?\n/)) {
    const heading = line.match(/^##\s+.*?(?:(2026)[/\-])?(12)[/\-](1[2-7]).*?Day\s*([1-6])\s*[：:]\s*(.+)$/i);
    if (heading) {
      const day = Number(heading[4]);
      if (Number(heading[3]) !== 11 + day || days.some(d => d.day === day)) throw new Error('日期與 Day 編號不一致，或有重複日期。');
      current = { id: `day-${day}`, day, date: `2026-12-${heading[3]}`, title: heading[5].replace(/\*\*/g, '').trim(), stops: [] };
      days.push(current); collectingNotes = false; continue;
    }
    if (!current) continue;
    const stop = line.match(/^(?:[-*]\s*)?(?:\*\*)?(\d{2}:\d{2})\s*[-–～]\s*(\d{2}:\d{2})\s*[｜|]\s*(.+?)(?:\*\*)?\s*$/);
    if (stop) {
      const validTime = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
      if (!validTime(stop[1]) || !validTime(stop[2]) || stop[2] <= stop[1]) throw new Error('有無效的時間區間，請確認開始與結束時間。');
      const name = stop[3].replace(/\*\*/g, '').trim();
      if (current.stops.some(existing => existing.startTime === stop[1] && existing.endTime === stop[2] && existing.name === name)) { collectingNotes = false; continue; }
      if (current.stops.length && stop[1] < current.stops.at(-1)!.endTime) throw new Error(`Day ${current.day} ${stop[1]} 與上一站 ${current.stops.at(-1)!.endTime} 重疊或順序錯誤。`);
      const store = stores.find(s => name.includes(s.name));
      const group = itinerary.flatMap(day => day.stops).find(entry => entry.storeIds && name.includes(entry.name));
      current.stops.push({ id: `${current.id}-stop-${current.stops.length + 1}`, startTime: stop[1], endTime: stop[2], name, type: store ? '購物' : '行程', ...(store ? { storeId: store.id } : {}), ...(group?.storeIds ? { storeIds: group.storeIds } : {}), notes: '' });
      collectingNotes = true;
    } else if (/^#{1,6}\s|^---/.test(line)) collectingNotes = false;
    else if (collectingNotes && line.trim()) {
      const last = current.stops.at(-1)!;
      last.notes += (last.notes ? '\n' : '') + line.replace(/^\s*[-*]\s*/, '').replace(/\*\*/g, '').trim();
    }
  }
  if (!days.length || days.some(day => !day.stops.length)) throw new Error('找不到有效行程。請使用「## 12/16 Day 5：標題」與「- 09:30 - 11:30｜地點」格式。');
  return days;
}
