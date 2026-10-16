type IconName = 'itinerary' | 'checklist' | 'shopping' | 'food' | 'convenience' | 'protein' | 'drugstore';
const paths: Record<IconName, string[]> = {
  itinerary: ['M7 4h12v16H5V4h2M8 2v4m8-4v4M9 10h6m-6 4h6'],
  checklist: ['M7 3h10l2 3v15H5V6l2-3Zm2 0v3h6V3M8 11l2 2 5-5m-7 9h7'],
  shopping: ['M5 8h14l1 12H4L5 8Zm3 1V6a4 4 0 0 1 8 0v3'],
  food: ['M3 11h18c-1 6-4 9-9 9s-8-3-9-9Zm3 10h12M8 7c-3-3 3-3 0-6m5 6c-3-3 3-3 0-6m5 6c-3-3 3-3 0-6'],
  convenience: ['M4 10v11h16V10M3 4h18l-2 6H5L3 4Zm6 17v-7h6v7M7 4l1 6m9-6-1 6'],
  protein: ['M7 7h10l-1 14H8L7 7Zm0 0L6 3h12l-1 4M9 3V1h6v2m-6 9h6'],
  drugstore: ['M9 3h6v4H9V3Zm-2 6 2-2h6l2 2v12H7V9Zm3 5h4m-2-2v4'],
};
export function DoodleIcon({name}: {name: IconName}) {
  return <svg className="doodle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name].map(path => <path key={path} d={path}/>)}</svg>;
}
export function EggMark() {
  return <svg className="egg-mark" viewBox="0 0 48 48" aria-hidden="true"><path d="M8 15C4 9 15 4 22 8c9-7 21 2 17 10 9 8 2 20-7 19-7 10-19 5-20-1C1 35 0 23 8 15Z" fill="#fffdf6" stroke="#a47740" strokeWidth="1.5"/><path d="M13 25c0-8 5-13 12-13s12 5 12 12c0 7-4 12-12 12S13 32 13 25Z" fill="#ffc43f"/><path d="m20 24 3 1m5-1 3-1m-7 7h3" fill="none" stroke="#66462c" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
