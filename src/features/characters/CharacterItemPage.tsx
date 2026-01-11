import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Group,
  Paper,
  Table,
  Text,
  Title,
  Button,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useCharacters, useCharacterItems } from './queries';
import { useCategories } from './categories.queries';
import { CreateItemModal } from './CreateItemModal';

export function CharacterItemsPage() {
  const { characterId } = useParams();
  const [opened, { open, close }] = useDisclosure(false);

  const { data: characters } = useCharacters();
  const character = characters?.find((c) => c.id === characterId);

  const { data: categories } = useCategories();
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    (categories ?? []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const { data: items, isLoading } = useCharacterItems(characterId);

  if (!characterId) {
    return <Text c="dimmed">No character selected.</Text>;
  }

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={2}>{character?.name ?? 'Character'}</Title>
        <Button onClick={open}>Add item</Button>
      </Group>

      {isLoading ? (
        <Loader />
      ) : (items?.length ?? 0) === 0 ? (
        <Text c="dimmed">No items yet. Add your first item.</Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item</Table.Th>
              <Table.Th w={90}>Qty</Table.Th>
              <Table.Th w={160}>Category</Table.Th>
              <Table.Th>Notes</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {items!.map((i) => (
              <Table.Tr key={i.id}>
                <Table.Td>{i.name}</Table.Td>
                <Table.Td>{i.quantity}</Table.Td>
                <Table.Td>
                  {i.category_id ? categoryMap.get(i.category_id) : ''}
                </Table.Td>
                <Table.Td>{i.notes ?? ''}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <CreateItemModal
        opened={opened}
        onClose={close}
        characterId={characterId}
      />
    </Paper>
  );
}
