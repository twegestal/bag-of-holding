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
  };

  const openPicker = () => inputRef.current?.click();

  const onScan = async () => {
    if (!file) return;

    setIsScanning(true);
    setResult(null);

    try {
      let uploadFile = file;

      if (shouldDownscale(file)) {
        try {
          uploadFile = await downscaleImageToJpeg(file, {
            maxSide: 1600,
            quality: 0.7,
          });
        } catch {
          uploadFile = file;
        }
      }

      const form = new FormData();
      form.append('image', uploadFile);

      const res = await fetch(scanUrl, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Scan failed (${res.status})`);
      }

      const data = (await res.json()) as ItemCard;
      setResult(data);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setFile(null);
    } catch (e) {
      notifications.show({
        title: 'Scan failed',
        message: e instanceof Error ? e.message : String(e),
      });
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
