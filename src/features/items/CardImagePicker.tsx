import { useEffect, useRef, useState } from 'react';
import { Button, Group, Image, Stack, Text } from '@mantine/core';

export function CardImagePicker() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPick = (f: File | null) => {
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const openPicker = () => inputRef.current?.click();

  const onScan = async () => {
    console.log(file);
  };

  return (
    <Stack>
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
        <Button onClick={openPicker}>Take photo / Upload image</Button>

        <Button onClick={() => onPick(null)} variant="default" disabled={!file}>
          Clear
        </Button>

        <Button onClick={onScan} disabled={!file}>
          Scan
        </Button>
      </Group>

      {previewUrl && (
        <Image src={previewUrl} alt="Selected image preview" radius="md" />
      )}
    </Stack>
  );
}
