import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useJoinParty } from '../party.mutations';

export function JoinPartyModal({
  opened,
  onClose,
  characterId,
}: {
  opened: boolean;
  onClose: () => void;
  characterId: string;
}) {
  const form = useForm({ initialValues: { code: '' } });
  const join = useJoinParty();

  const onSubmit = async (values: { code: string }) => {
    try {
      await join.mutateAsync({ inviteCode: values.code, characterId });
      notifications.show({
        title: 'Joined!',
        message: 'Your character is now in the party.',
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
    <Modal opened={opened} onClose={onClose} title="Join party" centered>
      <Stack>
        <TextInput
          label="Invite code"
          placeholder="abc12345"
          {...form.getInputProps('code')}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => form.onSubmit(onSubmit)()}
            loading={join.isPending}
            disabled={!form.values.code.trim()}
          >
            Join
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
