import { Stack, Title, Paper } from '@mantine/core';
import { CardImagePicker } from './CardImagePicker';

export function MagicItemsPage() {
  return (
    <Stack>
      <Title order={2}>Magic items</Title>

      <Paper withBorder p="md" radius="md">
        <CardImagePicker />
      </Paper>
    </Stack>
  );
}
