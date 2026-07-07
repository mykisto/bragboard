/**
 * Compress an uploaded image before it goes anywhere near localStorage:
 * resize to a bounded long side, re-encode as JPEG. GIFs are passed through
 * untouched (re-encoding would kill the animation) but still size-checked.
 */

const MAX_LONG_SIDE = 1200;
const JPEG_QUALITY = 0.8;
/** Hard per-image ceiling; one oversized GIF can eat the whole storage budget. */
const MAX_DATA_URL_CHARS = 1_500_000;

export type ImageResult = { ok: true; dataUrl: string } | { ok: false; error: string };

export async function prepareImage(file: File): Promise<ImageResult> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'That file is not an image.' };
  }

  if (file.type === 'image/gif') {
    const dataUrl = await readAsDataUrl(file);
    if (dataUrl.length > MAX_DATA_URL_CHARS) {
      return { ok: false, error: 'That GIF is too large to store. Try one under ~1MB.' };
    }
    return { ok: true, dataUrl };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_LONG_SIDE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ok: false, error: 'Could not process that image.' };
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    if (dataUrl.length > MAX_DATA_URL_CHARS) {
      return { ok: false, error: 'That image is too large even after compression.' };
    }
    return { ok: true, dataUrl };
  } catch {
    return { ok: false, error: 'Could not read that image.' };
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
