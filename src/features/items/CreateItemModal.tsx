import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCategories } from '../categories/categories.queries';
import { useCreateCharacterItem } from '../items/items.mutations';

type Props = {
  opened: boolean;
  onClose: () => void;
  characterId: string;
};

export function CreateItemModal({ opened, onClose, characterId }: Props) {
  const { data: categories } = useCategories();
  const createItem = useCreateCharacterItem(characterId);

  const form = useForm({
    initialValues: {
      name: '',
      quantity: 1,
      categoryId: null as string | null,
      valueGp: null as number | null,
      notes: '',
    },
    validate: {
      name: (v) => (v.trim().length === 0 ? 'Item name is required' : null),
      quantity: (v) => (v < 0 ? 'Quantity must be 0 or higher' : null),
      valueGp: (v) => (v != null && v < 0 ? 'Value must be 0 or higher' : null),
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      await createItem.mutateAsync({
        characterId,
        name: values.name,
        quantity: values.quantity ?? 1,
        categoryId: values.categoryId,
        value_gp: values.valueGp,
        notes: values.notes || null,
      });

      form.reset();
      onClose();
    } catch (e: any) {
      notifications.show({
        title: 'Failed to add item',
        message: e?.message ?? 'Unknown error',
      });
    }
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Add item" centered>
      <form onSubmit={onSubmit}>
        <TextInput
          label="Name"
          type="tel"
          inputMode="numeric"
          placeholder="e.g. Longsword"
          {...form.getInputProps('name')}
          autoFocus
        />

        <Group grow mt="sm">
          <NumberInput
            label="Quantity"
            type="tel"
            inputMode="numeric"
            min={0}
            {...form.getInputProps('quantity')}
          />

          <Select
            label="Category"
            placeholder="Optional"
            clearable
            data={(categories ?? []).map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            {...form.getInputProps('categoryId')}
          />
        </Group>

        <NumberInput
          label="Value (gp)"
          placeholder="Optional"
          mt="sm"
          min={0}
          hideControls
          thousandSeparator
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
          <Button type="submit" loading={createItem.isPending}>
            Add
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
