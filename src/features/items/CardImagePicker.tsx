import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Image,
  LoadingOverlay,
  Stack,
  Text,
  Title,
  Box,
} from '@mantine/core';
import type { ItemCard } from '../../types/items';
import { useAuth } from '../../contexts/auth';
import { useSaveMagicItem } from './magicItems.mutations';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

type Props = {
  characterId: string;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export function CardImagePicker({ characterId }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ItemCard | null>(null);

  const [imgMeta, setImgMeta] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const { token } = useAuth();
  const saveMagicItem = useSaveMagicItem(characterId);

  // IMPORTANT:
  // Always call relative "/api" so requests are same-origin in prod once you add a Vercel rewrite.
  // In dev, Vite can proxy "/api" to your microservice (see files below).
  const apiBase = useMemo(() => '/api', []);
  const scanUrl = useMemo(() => `${apiBase}/scan`, [apiBase]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!previewUrl) {
      setImgMeta(null);
      return;
    }

    let cancelled = false;
    const img = new window.Image();

    img.onload = () => {
      if (cancelled) return;
      setImgMeta({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      if (cancelled) return;
      setImgMeta(null);
    };

    img.src = previewUrl;

    return () => {
      cancelled = true;
    };
  }, [previewUrl]);

  const onPick = (f: File | null) => {
    if (isScanning) return;

    setFile(f);
    setError(null);
    setResult(null);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const openPicker = () => inputRef.current?.click();

  const onScan = async () => {
    if (!file) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      let uploadFile = file;

      if (isLikelyMobileHugeImage(file, imgMeta)) {
        uploadFile = await downscaleImageToJpeg(file, {
          maxSide: 1600,
          quality: 0.7,
        });
      }

      const form = new FormData();
      form.append('image', uploadFile);

      const res = await fetch(scanUrl, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type') ?? '';
        const text = await res.text().catch(() => '');
        throw new Error(
          JSON.stringify(
            {
              status: res.status,
              statusText: res.statusText,
              contentType,
              bodyPreview: text.slice(0, 500),
            },
            null,
            2
          )
        );
      }

      const data = (await res.json()) as ItemCard;
      setResult(data);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsScanning(false);
    }
  };

  const onSave = async () => {
    if (!result) return;

    try {
      await saveMagicItem.mutateAsync({
        characterId,
        card: result,
        quantity: 1,
        isEquipped: false,
      });

      onDiscard();
      navigate('..', { relative: 'path' });
    } catch (e) {
      notifications.show({
        title: 'Failed to save',
        message: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const onPing = async () => {
    const res = await fetch(`${apiBase}/health`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const text = await res.text();

    notifications.show({
      title: text,
      message: '',
      color: 'green',
    });

    console.log(res.status, text);
  };

  const onDiscard = () => {
    if (isScanning) return;

    setError(null);
    setResult(null);
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImgMeta(null);
  };

  async function downscaleImageToJpeg(
    file: File,
    opts?: { maxSide?: number; quality?: number }
  ): Promise<File> {
    const maxSide = opts?.maxSide ?? 1600;
    const quality = opts?.quality ?? 0.7;

    // Decode
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

  function isLikelyMobileHugeImage(
    file: File,
    meta: { width: number; height: number } | null
  ) {
    if (!meta) return false;
    // Heuristik: typiska iPhone-foton
    return meta.width >= 2500 && meta.height >= 2500 && file.size > 500_000;
  }

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={isScanning}
        zIndex={1000}
        overlayProps={{ blur: 2 }}
        loaderProps={{ size: 'lg' }}
      />

      <Stack>
        {!result && (
          <>
            <Text>
              Take a photo of a magic item card or upload an existing image.
            </Text>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />

            <Group>
              <Button onClick={openPicker} disabled={isScanning}>
                Take photo / Upload image
              </Button>

              <Button
                onClick={() => onPick(null)}
                variant="default"
                disabled={!file || isScanning}
              >
                Clear
              </Button>

              <Button onClick={onPing}>Ping</Button>

              <Button onClick={onScan} disabled={!file || isScanning}>
                Scan
              </Button>
            </Group>

            {(file || error) && (
              <Card withBorder radius="md" p="md">
                <Stack gap={6}>
                  <Text fw={600}>Debug</Text>

                  <Text size="sm">
                    <b>Scan URL:</b> {scanUrl}
                  </Text>

                  <Text size="sm">
                    <b>Auth token:</b>{' '}
                    {token ? `present (${token.length} chars)` : 'missing'}
                  </Text>

                  {file && (
                    <>
                      <Text size="sm">
                        <b>Filename:</b> {file.name}
                      </Text>
                      <Text size="sm">
                        <b>MIME type:</b> {file.type || '(empty)'}
                      </Text>
                      <Text size="sm">
                        <b>Size:</b> {formatBytes(file.size)} ({file.size}{' '}
                        bytes)
                      </Text>
                      <Text size="sm">
                        <b>Last modified:</b>{' '}
                        {new Date(file.lastModified).toISOString()}
                      </Text>
                      <Text size="sm">
                        <b>Dimensions:</b>{' '}
                        {imgMeta
                          ? `${imgMeta.width}×${imgMeta.height}`
                          : '(unknown)'}
                      </Text>
                    </>
                  )}

                  {error && <Text c="red">{error}</Text>}
                </Stack>
              </Card>
            )}

            <Text size="sm">
              <b>API_BASE:</b> {apiBase}
            </Text>
            <Text size="sm">
              <b>Window origin:</b> {window.location.origin}
            </Text>

            {previewUrl && (
              <Image
                src={previewUrl}
                alt="Selected image preview"
                radius="md"
              />
            )}
          </>
        )}

        {result && (
          <Card withBorder radius="md" p="md">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Title order={3}>{result.name}</Title>

                <Group gap="xs">
                  {result.type && <Badge variant="light">{result.type}</Badge>}
                  {result.slot && <Badge variant="light">{result.slot}</Badge>}
                  {result.value && (
                    <Badge variant="light">{result.value}</Badge>
                  )}

                  <Badge
                    color={result.attunement.required ? 'orange' : 'gray'}
                    variant="light"
                  >
                    {result.attunement.required
                      ? 'Requires attunement'
                      : 'Does not require attunement'}
                  </Badge>
                </Group>
              </Stack>

              <Badge variant="light">
                {(result.confidence.overall * 100).toFixed(0)}%
              </Badge>
            </Group>

            <Divider my="sm" />

            <Stack gap="sm">
              {result.sections.map((s, idx) => (
                <Stack key={idx} gap={4}>
                  <Text fw={600}>{s.title || '—'}</Text>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{s.body}</Text>
                </Stack>
              ))}
            </Stack>

            <Divider my="sm" />

            <Group justify="flex-end">
              <Button variant="default" onClick={onDiscard}>
                Discard
              </Button>
              <Button onClick={onSave} loading={saveMagicItem.isPending}>
                Save
              </Button>
            </Group>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
