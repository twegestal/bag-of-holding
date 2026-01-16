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
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import type { ItemCard } from '../../types/items';
import { useAuth } from '../../contexts/auth';
import { useSaveMagicItem } from './magicItems.mutations';
import { downscaleImageToJpeg, shouldDownscale } from '../../util/image';

type Props = {
  characterId: string;
};

export function CardImagePicker({ characterId }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ItemCard | null>(null);

  const { token } = useAuth();
  const saveMagicItem = useSaveMagicItem(characterId);

  const apiBase = useMemo(() => '/api', []);
  const scanUrl = useMemo(() => `${apiBase}/scan`, [apiBase]);

  const debug = (title: string, message?: string) => {
    notifications.show({
      title,
      message: message ?? '',
      // keep it visible long enough on iPad
      autoClose: 8000,
    });
  };

  const fmtBytes = (n: number) => {
    if (!Number.isFinite(n)) return String(n);
    if (n < 1024) return `${n} B`;
    const kb = n / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  useEffect(() => {
    debug('CardImagePicker mounted', `UA: ${navigator.userAgent}`);
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPick = (f: File | null) => {
    if (isScanning) return;

    setFile(f);
    setResult(null);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);

    if (!f) {
      debug('Image cleared');
      return;
    }

    debug(
      'Image picked',
      `${f.name || '(no name)'} • ${f.type || 'no type'} • ${fmtBytes(f.size)}`,
    );
  };

  const openPicker = () => {
    debug('Open picker', `inputRef: ${inputRef.current ? 'ok' : 'null'}`);
    inputRef.current?.click();
  };

  const onScan = async () => {
    if (!file) {
      debug('Scan aborted', 'No file selected');
      return;
    }

    setIsScanning(true);
    setResult(null);

    debug(
      'Scan start',
      `${file.name || '(no name)'} • ${file.type || 'no type'} • ${fmtBytes(
        file.size,
      )}`,
    );

    try {
      let uploadFile = file;

      const willDownscale = shouldDownscale(file);
      debug('Downscale check', willDownscale ? 'YES' : 'NO');

      if (willDownscale) {
        try {
          debug('Downscaling...', 'maxSide=1600, quality=0.7');
          uploadFile = await downscaleImageToJpeg(file, {
            maxSide: 1600,
            quality: 0.7,
          });

          debug(
            'Downscale done',
            `${uploadFile.name || '(no name)'} • ${uploadFile.type || 'no type'} • ${fmtBytes(
              uploadFile.size,
            )}`,
          );
        } catch (e) {
          debug(
            'Downscale failed (fallback to original)',
            e instanceof Error ? e.message : String(e),
          );
          uploadFile = file;
        }
      }

      const form = new FormData();
      form.append('image', uploadFile);

      debug(
        'POST /scan',
        `url=${scanUrl} • auth=${token ? 'yes' : 'no'} • upload=${uploadFile.type || 'no type'} • ${fmtBytes(
          uploadFile.size,
        )}`,
      );

      const res = await fetch(scanUrl, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });

      debug(
        'Response',
        `${res.status} ${res.statusText || ''} • content-type=${res.headers.get('content-type') || '(none)'}`,
      );

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const msg = text || `Scan failed (${res.status})`;
        debug('Response body (error)', msg.slice(0, 1200));
        throw new Error(msg);
      }

      const data = (await res.json()) as ItemCard;

      debug(
        'Parsed OK',
        `${data?.name || '(no name)'} • sections=${data?.sections?.length ?? 0}`,
      );

      setResult(data);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setFile(null);
    } catch (e) {
      notifications.show({
        title: 'Scan failed',
        message: e instanceof Error ? e.message : String(e),
      });

      debug(
        'Scan exception',
        e instanceof Error ? `${e.name}: ${e.message}` : String(e),
      );
    } finally {
      setIsScanning(false);
      debug('Scan end');
    }
  };

  const onSave = async () => {
    if (!result) {
      debug('Save aborted', 'No scan result');
      return;
    }

    debug('Save start', result.name || '(no name)');

    try {
      await saveMagicItem.mutateAsync({
        characterId,
        card: result,
        quantity: 1,
        isEquipped: false,
      });

      debug('Save success');
      onDiscard();
      navigate('..', { relative: 'path' });
    } catch (e) {
      notifications.show({
        title: 'Failed to save',
        message: e instanceof Error ? e.message : String(e),
      });

      debug(
        'Save failed',
        e instanceof Error ? `${e.name}: ${e.message}` : String(e),
      );
    }
  };

  const onDiscard = () => {
    if (isScanning) return;

    debug('Discard');

    setResult(null);
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
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
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                debug(
                  'Input change',
                  `files=${e.target.files?.length ?? 0} • picked=${f ? `${f.type || 'no type'} • ${fmtBytes(f.size)}` : 'null'}`,
                );
                onPick(f);
              }}
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
