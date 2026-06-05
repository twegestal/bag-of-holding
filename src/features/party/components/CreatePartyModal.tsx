import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCreateParty } from '../party.mutations';

export function CreatePartyModal({
  opened,
  onClose,
  characterId,
}: {
  opened: boolean;
  onClose: () => void;
  characterId: string;
}) {
  const form = useForm({ initialValues: { name: '' } });
  const create = useCreateParty();

  const onSubmit = async (values: { name: string }) => {
    try {
      await create.mutateAsync({ name: values.name.trim(), characterId });
      notifications.show({
        title: 'Party created!',
        message: `Welcome to ${values.name}.`,
      });
      form.reset();
      onClose();
    } catch (e: any) {
      notifications.show({
        title: 'Failed',
        message: e?.message ?? 'Unknown error',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create party" centered>
      <Stack>
        <TextInput
          label="Party name"
          placeholder="The Fellowship"
          {...form.getInputProps('name')}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => form.onSubmit(onSubmit)()}
            loading={create.isPending}
            disabled={!form.values.name.trim()}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
