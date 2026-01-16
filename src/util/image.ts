export async function downscaleImageToJpeg(
  file: File,
  opts?: { maxSide?: number; quality?: number }
): Promise<File> {
  const maxSide = opts?.maxSide ?? 1600;
  const quality = opts?.quality ?? 0.7;

  const bitmap = await createImageBitmap(file);

  const { width, height } = bitmap;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
      'image/jpeg',
      quality
    );
  });

  const outName =
    file.name.replace(/\.(heic|heif|png|webp|jpg|jpeg)$/i, '') + '.jpg';

  return new File([blob], outName, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

export async function getImageMeta(
  file: File
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);

  try {
    const img = new window.Image();
    const meta = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        img.onload = () =>
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      }
    );

    return meta;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function shouldDownscale(
  file: File,
  meta: { width: number; height: number } | null
) {
  if (!meta) return file.size > 500_000;
  return meta.width >= 2500 && meta.height >= 2500 && file.size > 500_000;
}
