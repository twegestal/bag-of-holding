import {
  SimpleGrid,
  Text,
  Card,
  Badge,
  Group,
  Stack,
  Divider,
} from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useCharacterMagicItems } from './magicItems.mutations';

export function MagicItemsGrid() {
  const { characterId } = useParams<{ characterId: string }>();
  if (!characterId) return null;

  const { data, isLoading, error } = useCharacterMagicItems(characterId);

  if (isLoading) return <Text>Loading…</Text>;
  if (error) return <Text c="red">{(error as Error).message}</Text>;
  if (!data?.length) return <Text>No magic items yet.</Text>;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
      {data.map((row) => (
        <Card key={row.id} withBorder radius="md" p="md">
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <Text fw={700}>{row.card.name}</Text>

              {row.is_equipped && (
                <Badge color="green" variant="light">
                  Equipped
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              {row.card.type && <Badge variant="light">{row.card.type}</Badge>}
              {row.card.slot && <Badge variant="light">{row.card.slot}</Badge>}
              {row.card.value && (
                <Badge variant="light">{row.card.value}</Badge>
              )}

              <Badge
                color={row.card.attunement_required ? 'orange' : 'red'}
                variant="light"
              >
                {row.card.attunement_required
                  ? 'Requires attunement'
                  : 'Does not require attunement'}
              </Badge>
            </Group>

            <Divider />

            <Stack gap="xs">
              {row.card.sections.map((section, idx) => (
                <Stack key={idx} gap={2}>
                  {section.title && (
                    <Text fw={600} size="sm">
                      {section.title}
                    </Text>
                  )}

                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {section.body}
                  </Text>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}
