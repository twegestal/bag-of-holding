import { Table, Text, Stack, Card, Group, Badge, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { CharacterItem } from '../../../types/character';
import { CharacterItemActionsMenu } from './CharacterItemActionsMenu';

type Props = {
  items: CharacterItem[];
  categoryMap: Map<string, string>;
  actionsDisabled: boolean;
  onEdit: (item: CharacterItem) => void;
  onAddOne: (item: CharacterItem) => void;
  onRemoveOne: (item: CharacterItem) => void;
  onDelete: (item: CharacterItem) => void;
  onSendTo: (item: CharacterItem) => void;
};

export function CharacterItemsTable(props: Props) {
  const {
    items,
    categoryMap,
    actionsDisabled,
    onEdit,
    onAddOne,
    onRemoveOne,
    onDelete,
    onSendTo,
  } = props;
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (items.length === 0) {
    return <Text c="dimmed">No items match your search.</Text>;
  }

  if (isMobile) {
    return (
      <Stack gap="sm">
        {items.map((i) => (
          <Card key={i.id} withBorder radius="md" p="sm">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                <Text fw={600} truncate>
                  {i.name}
                </Text>

                <Group gap="xs">
                  <Badge variant="light" size="sm">
                    ×{i.quantity}
                  </Badge>
                  {i.category_id && categoryMap.get(i.category_id) && (
                    <Badge variant="outline" size="sm">
                      {categoryMap.get(i.category_id)}
                    </Badge>
                  )}
                  {i.value_gp != null && (
                    <Badge variant="outline" size="sm" color="yellow">
                      {i.value_gp} gp
                    </Badge>
                  )}
                </Group>

                {i.notes && (
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {i.notes}
                  </Text>
                )}
              </Stack>

              <Box style={{ flexShrink: 0 }}>
                <CharacterItemActionsMenu
                  item={i}
                  disabled={actionsDisabled}
                  onEdit={onEdit}
                  onAddOne={onAddOne}
                  onRemoveOne={onRemoveOne}
                  onDelete={onDelete}
                  onSendTo={onSendTo}
                />
              </Box>
            </Group>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Item</Table.Th>
          <Table.Th w={90}>Qty</Table.Th>
          <Table.Th w={160}>Category</Table.Th>
          <Table.Th w={160}>Value</Table.Th>
          <Table.Th>Notes</Table.Th>
          <Table.Th w={44}></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {items.map((i) => (
          <Table.Tr key={i.id}>
            <Table.Td>{i.name}</Table.Td>
            <Table.Td>{i.quantity}</Table.Td>
            <Table.Td>
              {i.category_id ? categoryMap.get(i.category_id) : ''}
            </Table.Td>
            <Table.Td>{i.value_gp ?? ''}</Table.Td>
            <Table.Td>{i.notes ?? ''}</Table.Td>
            <Table.Td>
              <CharacterItemActionsMenu
                item={i}
                disabled={actionsDisabled}
                onEdit={onEdit}
                onAddOne={onAddOne}
                onRemoveOne={onRemoveOne}
                onDelete={onDelete}
                onSendTo={onSendTo}
              />
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
