import { Table, Text } from '@mantine/core';
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
      <Table verticalSpacing="sm">
        <Table.Tbody>
          {items.map((i) => (
            <Table.Tr key={i.id}>
              <Table.Td style={{ width: '100%' }}>
                <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                  {i.name}
                </Text>
                {(i.category_id || i.notes || i.value_gp != null) && (
                  <Text size="xs" c="dimmed" style={{ lineHeight: 1.3 }}>
                    {[
                      categoryMap.get(i.category_id ?? ''),
                      i.value_gp != null ? `${i.value_gp} gp` : null,
                      i.notes,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                )}
              </Table.Td>
              <Table.Td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                <Text size="sm" c="dimmed">
                  ×{i.quantity}
                </Text>
              </Table.Td>
              <Table.Td style={{ whiteSpace: 'nowrap', paddingLeft: 0 }}>
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
