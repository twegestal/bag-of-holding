import { Paper } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { CardImagePicker } from './CardImagePicker';

export function MagicItemsNewPage() {
  const { characterId } = useParams<{ characterId: string }>();
  if (!characterId) return null;

  return (
    <Paper withBorder p="md" radius="md">
      <CardImagePicker characterId={characterId} />
    </Paper>
  );
}
