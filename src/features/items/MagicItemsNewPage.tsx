import { Paper, Tabs } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { CardImagePicker } from './CardImagePicker';
import { MagicItemForm } from './MagicItemForm';
import { useSaveMagicItem } from './magicItems.mutations';
import type { ItemCard } from '../../types/items';

export function MagicItemsNewPage() {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();

  if (!characterId) return null;

  const saveMagicItem = useSaveMagicItem(characterId);

  const onManualSubmit = async (card: ItemCard) => {
    await saveMagicItem.mutateAsync({
      characterId,
      card,
      quantity: 1,
      isEquipped: false,
    });
    notifications.show({ title: 'Saved', message: `${card.name} added.` });
    navigate('..', { relative: 'path' });
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Tabs defaultValue="scan">
        <Tabs.List mb="md">
          <Tabs.Tab value="scan">Scan image</Tabs.Tab>
          <Tabs.Tab value="manual">Enter manually</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="scan">
          <CardImagePicker characterId={characterId} />
        </Tabs.Panel>

        <Tabs.Panel value="manual">
          <MagicItemForm
            onSubmit={onManualSubmit}
            onCancel={() => navigate('..', { relative: 'path' })}
            submitLabel="Add item"
            isLoading={saveMagicItem.isPending}
          />
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
