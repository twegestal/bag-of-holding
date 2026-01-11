import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  Menu,
  Paper,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { HiDotsVertical } from 'react-icons/hi';
import { CiEdit } from 'react-icons/ci';
import { GoPlus } from 'react-icons/go';
import { FiMinus } from 'react-icons/fi';
import { HiOutlineTrash } from 'react-icons/hi2';

import { useCharacters, useCharacterItems } from './queries';
import { useCategories } from './categories.queries';
import { CreateItemModal } from './CreateItemModal';
import { EditItemModal } from './EditItemModal';

import type { CharacterItem } from '../../types/character';
import {
  useDecrementItemQuantity,
  useDeleteCharacterItem,
  useIncrementItemQuantity,
} from './items.mutations';

export function CharacterItemsPage() {
  const { characterId } = useParams();
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<CharacterItem | null>(null);

  const { data: characters } = useCharacters();
  const character = characters?.find((c) => c.id === characterId);

  const { data: categories } = useCategories();
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    (categories ?? []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const { data: items, isLoading } = useCharacterItems(characterId);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items ?? [];

    return (items ?? []).filter((i) => {
      const categoryName = i.category_id
        ? categoryMap.get(i.category_id) ?? ''
        : '';
      const haystack = `${i.name} ${
        i.notes ?? ''
      } ${categoryName}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search, categoryMap]);

  if (!characterId) {
    return <Text c="dimmed">No character selected.</Text>;
  }

  const deleteItem = useDeleteCharacterItem(characterId);
  const incQty = useIncrementItemQuantity(characterId);
  const decQty = useDecrementItemQuantity(characterId);

  const onEdit = (item: CharacterItem) => {
    setSelectedItem(item);
    openEdit();
  };

  const onDelete = async (item: CharacterItem) => {
    try {
      await deleteItem.mutateAsync(item.id);
      notifications.show({
        title: 'Deleted',
        message: `${item.name} removed.`,
      });
    } catch (e: any) {
      notifications.show({
        title: 'Failed to delete',
        message: e?.message ?? 'Unknown error',
      });
    }
  };

  const onAddOne = async (item: CharacterItem) => {
    try {
      await incQty.mutateAsync({ id: item.id, quantity: item.quantity });
    } catch (e: any) {
      notifications.show({
        title: 'Failed to update quantity',
        message: e?.message ?? 'Unknown error',
      });
    }
  };

  const onRemoveOne = async (item: CharacterItem) => {
    try {
      await decQty.mutateAsync({ id: item.id, quantity: item.quantity });

      if (item.quantity <= 1) {
        notifications.show({
          title: 'Removed',
          message: `${item.name} removed from inventory.`,
        });
      }
    } catch (e: any) {
      notifications.show({
        title: 'Failed to update quantity',
        message: e?.message ?? 'Unknown error',
      });
    }
  };

  const actionsDisabled =
    deleteItem.isPending || incQty.isPending || decQty.isPending;

  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Button onClick={openCreate}>Add item</Button>
          <Text c="dimmed">{character?.name ?? 'Character'}</Text>
        </Group>

        <TextInput
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          w={320}
        />
      </Group>

      {isLoading ? (
        <Loader />
      ) : (items?.length ?? 0) === 0 ? (
        <Text c="dimmed">No items yet. Add your first item.</Text>
      ) : (filteredItems.length ?? 0) === 0 ? (
        <Text c="dimmed">No items match your search.</Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Item</Table.Th>
              <Table.Th w={90}>Qty</Table.Th>
              <Table.Th w={160}>Category</Table.Th>
              <Table.Th>Notes</Table.Th>
              <Table.Th w={44}></Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {filteredItems.map((i) => (
              <Table.Tr key={i.id}>
                <Table.Td>{i.name}</Table.Td>
                <Table.Td>{i.quantity}</Table.Td>
                <Table.Td>
                  {i.category_id ? categoryMap.get(i.category_id) : ''}
                </Table.Td>
                <Table.Td>{i.notes ?? ''}</Table.Td>
                <Table.Td>
                  <Menu shadow="md" width={180} position="bottom-end">
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        aria-label="Item actions"
                        disabled={actionsDisabled}
                      >
                        <HiDotsVertical />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<CiEdit size={16} />}
                        onClick={() => onEdit(i)}
                      >
                        Edit
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<GoPlus size={16} />}
                        onClick={() => onAddOne(i)}
                      >
                        Add one
                      </Menu.Item>

                      <Menu.Item
                        leftSection={<FiMinus size={16} />}
                        onClick={() => onRemoveOne(i)}
                      >
                        Remove one{i.quantity <= 1 ? ' (deletes)' : ''}
                      </Menu.Item>

                      <Menu.Divider />

                      <Menu.Item
                        color="red"
                        leftSection={<HiOutlineTrash size={16} />}
                        onClick={() => onDelete(i)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <CreateItemModal
        opened={createOpened}
        onClose={closeCreate}
        characterId={characterId}
      />

      <EditItemModal
        opened={editOpened}
        onClose={() => {
          closeEdit();
          setSelectedItem(null);
        }}
        characterId={characterId}
        item={selectedItem}
      />
    </Paper>
  );
}
