import { Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { CharacterMagicItemRow } from '../../types/items';
import type { ItemCard } from '../../types/items';
import { useUpdateMagicItem } from './magicItems.mutations';
import { MagicItemForm } from './MagicItemForm';

type Props = {
  opened: boolean;
  onClose: () => void;
  item: CharacterMagicItemRow | null;
  characterId: string;
};

export function EditMagicItemModal({
  opened,
  onClose,
  item,
  characterId,
}: Props) {
  const update = useUpdateMagicItem(characterId);

  if (!item) return null;

  const initial: Partial<ItemCard> = {
    name: item.card.name,
    type: item.card.type,
    slot: item.card.slot,
    value: item.card.value,
    attunement: {
      required: item.card.attunement_required,
      note: item.card.attunement_note,
    },
    sections: item.card.sections,
  };

  const onSubmit = async (card: ItemCard) => {
    try {
      await update.mutateAsync({ cardId: item.card.id, card });
      notifications.show({ title: 'Saved', message: `${card.name} updated.` });
      onClose();
    } catch (e: any) {
      notifications.show({
        title: 'Failed to save',
        message: e?.message ?? 'Unknown error',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit magic item"
      size="lg"
      centered
    >
      <MagicItemForm
        initial={initial}
        onSubmit={onSubmit}
        onCancel={onClose}
        submitLabel="Save changes"
        isLoading={update.isPending}
      />
    </Modal>
  );
}
