import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, Paper, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

import type { CharacterItem } from '../../types/character';
import { useCharacterItems } from './queries';
import { CreateItemModal } from '../items/CreateItemModal';
import { EditItemModal } from './EditItemModal';

import {
  useDecrementItemQuantity,
  useDeleteCharacterItem,
  useIncrementItemQuantity,
} from '../items/items.mutations';

import { CharacterItemsHeader } from './components/CharacterItemsHeader';
import { CharacterItemsTable } from './components/CharacterItemsTable';
import { useCategoryMap } from './hooks/useCategoryMap';
import { useFilteredItems } from './hooks/useFilteredItems';

export function CharacterItemsPage() {
  const { characterId } = useParams();

  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<CharacterItem | null>(null);

  if (!characterId) {
    return <Text c="dimmed">No character selected.</Text>;
  }

  const categoryMap = useCategoryMap();

  const { data: items, isLoading } = useCharacterItems(characterId);
  const filteredItems = useFilteredItems({ items, search, categoryMap });

  const deleteItem = useDeleteCharacterItem(characterId);
  const incQty = useIncrementItemQuantity(characterId);
  const decQty = useDecrementItemQuantity(characterId);

  const actionsDisabled =
    deleteItem.isPending || incQty.isPending || decQty.isPending;

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

  return (
    <Paper p="md" withBorder>
      <CharacterItemsHeader
        search={search}
        onSearchChange={setSearch}
        onAddItem={openCreate}
      />

      {isLoading ? (
        <Loader />
      ) : (items?.length ?? 0) === 0 ? (
        <Text c="dimmed">No items yet. Add your first item.</Text>
      ) : (
        <CharacterItemsTable
          items={filteredItems}
          categoryMap={categoryMap}
          actionsDisabled={actionsDisabled}
          onEdit={onEdit}
          onAddOne={onAddOne}
          onRemoveOne={onRemoveOne}
          onDelete={onDelete}
        />
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
