import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useCreateCharacter } from './mutations';

type Props = {
  opened: boolean;
  onClose: () => void;
};

export function CreateCharacterModal({ opened, onClose }: Props) {
  const navigate = useNavigate();
  const createCharacter = useCreateCharacter();

  const form = useForm({
    initialValues: { name: '' },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Name is required' : null),
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const created = await createCharacter.mutateAsync({ name: values.name });

      notifications.show({
        title: 'Character created',
        message: `${created.name} is ready.`,
      });

      form.reset();
      onClose();
      navigate(`/characters/${created.id}`);
    } catch (e: any) {
      notifications.show({
        title: 'Failed to create character',
        message: e?.message ?? 'Unknown error',
      });
    }
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Create character" centered>
      <form onSubmit={onSubmit}>
        <TextInput
          label="Name"
          placeholder="e.g. Thorne Ironfist"
          {...form.getInputProps('name')}
          autoFocus
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createCharacter.isPending}>
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
