import { useEffect } from 'react';
import {
  Button,
  Group,
  Modal,
  Select,
  TextInput,
  Textarea,
  NumberInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import type { CharacterItem } from '../../types/character';
import { useCategories } from '../categories/categories.queries';
import { useUpdateCharacterItem } from '../items/items.mutations';

type Props = {
  opened: boolean;
  onClose: () => void;
  characterId: string;
  item: CharacterItem | null;
};

export function EditItemModal({ opened, onClose, characterId, item }: Props) {
  const { data: categories } = useCategories();
  const updateItem = useUpdateCharacterItem(characterId);

  const form = useForm({
    initialValues: {
      name: '',
      notes: '',
      categoryId: null as string | null,
      valueGp: null as number | null,
    },
    validate: {
      name: (v) => (v.trim().length === 0 ? 'Item name is required' : null),
      valueGp: (v) => (v != null && v < 0 ? 'Value must be 0 or higher' : null),
    },
  });

  useEffect(() => {
    if (!opened || !item) return;

    form.setValues({
      name: item.name,
      notes: item.notes ?? '',
      categoryId: item.category_id,
      valueGp: item.value_gp,
    });

    form.resetDirty();
  }, [opened, item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = form.onSubmit(async (values) => {
    if (!item) return;

    try {
      await updateItem.mutateAsync({
        id: item.id,
        name: values.name,
        notes: values.notes || null,
        categoryId: values.categoryId,
        value_gp: values.valueGp,
      });

      onClose();
    } catch (e: any) {
      notifications.show({
        title: 'Failed to update item',
        message: e?.message ?? 'Unknown error',
      });
    }
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Edit item" centered>
      <form onSubmit={onSubmit}>
        <TextInput label="Name" {...form.getInputProps('name')} autoFocus />

        <Select
          label="Category"
          placeholder="Optional"
          clearable
          mt="sm"
          data={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
          {...form.getInputProps('categoryId')}
        />

        <NumberInput
          label="Value (gp)"
          placeholder="Optional"
          mt="sm"
          min={0}
          allowNegative={false}
          thousandSeparator
          hideControls
          {...form.getInputProps('valueGp')}
        />

        <Textarea
          label="Notes"
          placeholder="Optional"
          mt="sm"
          autosize
          minRows={2}
          {...form.getInputProps('notes')}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={updateItem.isPending} disabled={!item}>
            Save
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
