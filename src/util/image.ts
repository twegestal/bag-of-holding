export async function downscaleImageToJpeg(
  file: File,
  opts?: { maxSide?: number; quality?: number },
): Promise<File> {
  const maxSide = opts?.maxSide ?? 1600;
  const quality = opts?.quality ?? 0.7;

  const decoded = await decodeImage(file);

  const scale = Math.min(1, maxSide / Math.max(decoded.width, decoded.height));
  const targetW = Math.max(1, Math.round(decoded.width * scale));
  const targetH = Math.max(1, Math.round(decoded.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  await decoded.draw(ctx, targetW, targetH);

  const blob = await canvasToJpegBlob(canvas, quality);

  const outName =
    file.name.replace(/\.(heic|heif|png|webp|jpg|jpeg)$/i, '') + '.jpg';

  return new File([blob], outName, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

export async function getImageMeta(
  file: File,
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);

  try {
    const img = new window.Image();
    return await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        img.onload = () =>
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      },
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function shouldDownscale(
  file: File,
  meta: { width: number; height: number } | null,
) {
  if (!meta) return file.size > 500_000;
  return meta.width >= 2500 && meta.height >= 2500 && file.size > 500_000;
}

async function decodeImage(file: File): Promise<{
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => Promise<void>;
}> {
  // Prefer createImageBitmap when it works
  try {
    if (typeof createImageBitmap === 'function') {
      const bitmap = await createImageBitmap(file);

      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: async (ctx, w, h) => {
          ctx.drawImage(bitmap, 0, 0, w, h);
          bitmap.close?.();
        },
      };
    }
  } catch {
    // fall through to <img> path
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new window.Image();
    const { width, height } = await new Promise<{
      width: number;
      height: number;
    }>((resolve, reject) => {
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });

    return {
      width,
      height,
      draw: async (ctx, w, h) => {
        ctx.drawImage(img, 0, 0, w, h);
      },
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
  });

  if (blob) return blob;

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const res = await fetch(dataUrl);
  return await res.blob();
}
