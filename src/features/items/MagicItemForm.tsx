import {
  Button,
  Checkbox,
  Divider,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { GoPlus } from 'react-icons/go';
import { HiOutlineTrash } from 'react-icons/hi2';
import type { ItemCard } from '../../types/items';

type Props = {
  initial?: Partial<ItemCard>;
  onSubmit: (card: ItemCard) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
};

const emptySection = () => ({ title: '', body: '' });

function toFormValues(initial?: Partial<ItemCard>) {
  return {
    name: initial?.name ?? '',
    type: initial?.type ?? '',
    slot: initial?.slot ?? '',
    value: initial?.value ?? '',
    attunement_required: initial?.attunement?.required ?? false,
    attunement_note: initial?.attunement?.note ?? '',
    sections: initial?.sections?.length
      ? initial.sections.map((s) => ({ title: s.title, body: s.body }))
      : [emptySection()],
  };
}

type FormValues = ReturnType<typeof toFormValues>;

export function MagicItemForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  isLoading = false,
}: Props) {
  const form = useForm<FormValues>({
    initialValues: toFormValues(initial),
    validate: {
      name: (v) => (v.trim() ? null : 'Name is required'),
      sections: {
        body: (v) => (v.trim() ? null : 'Body is required'),
      },
    },
  });

  const handleSubmit = async (values: FormValues) => {
    const card: ItemCard = {
      name: values.name.trim(),
      type: values.type.trim(),
      slot: values.slot.trim(),
      value: values.value.trim(),
      attunement: {
        required: values.attunement_required,
        note: values.attunement_note.trim(),
      },
      sections: values.sections.map((s) => ({
        title: s.title.trim(),
        body: s.body.trim(),
      })),
      image: { hasArt: false },
      confidence: { overall: 1, warnings: [] },
    };

    await onSubmit(card);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Name"
          placeholder="Artblade"
          withAsterisk
          {...form.getInputProps('name')}
        />

        <Group grow>
          <TextInput
            label="Type"
            placeholder="Magical Sword +2"
            {...form.getInputProps('type')}
          />
          <TextInput
            label="Slot"
            placeholder="Versatile"
            {...form.getInputProps('slot')}
          />
          <TextInput
            label="Value"
            placeholder="Unique"
            {...form.getInputProps('value')}
          />
        </Group>

        <Stack gap={4}>
          <Checkbox
            label="Requires attunement"
            {...form.getInputProps('attunement_required', { type: 'checkbox' })}
          />
          {form.values.attunement_required && (
            <TextInput
              placeholder="Requires attunement by a good-aligned elf-kin"
              {...form.getInputProps('attunement_note')}
            />
          )}
        </Stack>

        <Divider label="Sections" labelPosition="left" />

        <Stack gap="sm">
          {form.values.sections.map((_, idx) => (
            <Stack key={idx} gap="xs">
              <Group justify="space-between" align="center">
                <Text size="sm" fw={500}>
                  Section {idx + 1}
                </Text>
                {form.values.sections.length > 1 && (
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    leftSection={<HiOutlineTrash size={14} />}
                    onClick={() => form.removeListItem('sections', idx)}
                  >
                    Remove
                  </Button>
                )}
              </Group>

              <TextInput
                placeholder="Effects, Lore, Description…"
                label="Title"
                {...form.getInputProps(`sections.${idx}.title`)}
              />
              <Textarea
                placeholder="Write the section body here…"
                label="Body"
                withAsterisk
                autosize
                minRows={3}
                {...form.getInputProps(`sections.${idx}.body`)}
              />
            </Stack>
          ))}

          <Button
            variant="default"
            size="xs"
            leftSection={<GoPlus size={14} />}
            w="fit-content"
            onClick={() => form.insertListItem('sections', emptySection())}
          >
            Add section
          </Button>
        </Stack>

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
