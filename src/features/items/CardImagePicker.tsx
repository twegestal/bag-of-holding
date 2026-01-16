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

  const apiBase = useMemo(() => {
    return import.meta.env.DEV
      ? '/api'
      : (import.meta.env.VITE_API_URL as string).replace(/\/$/, '');
  }, []);

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
      const form = new FormData();
      form.append('image', file);

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

  const onDiscard = () => {
    if (isScanning) return;

    setError(null);
    setResult(null);
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImgMeta(null);
  };

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
