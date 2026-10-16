export async function prepareProxyPhoto(file: File): Promise<Blob> {
  if (file.size > 30*1024*1024) throw new Error('照片超過 30MB，請先選擇較小的照片。');
  if (!file.type.startsWith('image/')) throw new Error('請選擇照片檔案。');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();image.src = url;
    try { await image.decode(); } catch { throw new Error('無法讀取照片，請改選 JPEG、PNG 或 WebP 圖片。'); }
    let edge = 1600;
    for (let attempt = 0; attempt < 4; attempt++) {
      const scale = Math.min(1,edge/Math.max(image.naturalWidth,image.naturalHeight));
      const canvas = document.createElement('canvas');canvas.width = Math.max(1,Math.round(image.naturalWidth*scale));canvas.height = Math.max(1,Math.round(image.naturalHeight*scale));
      const context = canvas.getContext('2d');if (!context) throw new Error('瀏覽器無法處理照片，請改用其他瀏覽器。');
      context.fillStyle = '#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
      const blob = await new Promise<Blob>((resolve,reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('照片處理失敗，請重試。')),'image/jpeg',.82-attempt*.08));
      if (blob.size <= 1024*1024) return blob;
      edge = Math.round(edge*.8);
    }
    throw new Error('照片過大，請裁切後重新選擇。');
  } finally { URL.revokeObjectURL(url); }
}
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve,reject) => {
    const reader = new FileReader();reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('無法讀取照片。'));reader.onerror = () => reject(reader.error);reader.readAsDataURL(blob);
  });
}
