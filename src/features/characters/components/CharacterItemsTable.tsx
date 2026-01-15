import { Table, Text } from '@mantine/core';
import type { CharacterItem } from '../../../types/character';
import { CharacterItemActionsMenu } from './CharacterItemActionsMenu';

export function CharacterItemsTable({
  items,
  categoryMap,
  actionsDisabled,
  onEdit,
  onAddOne,
  onRemoveOne,
  onDelete,
}: {
  items: CharacterItem[];
  categoryMap: Map<string, string>;
  actionsDisabled: boolean;
  onEdit: (item: CharacterItem) => void;
  onAddOne: (item: CharacterItem) => void;
  onRemoveOne: (item: CharacterItem) => void;
  onDelete: (item: CharacterItem) => void;
}) {
  if (items.length === 0) {
    return <Text c="dimmed">No items match your search.</Text>;
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
              />
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
