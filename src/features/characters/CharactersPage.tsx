import {
  ActionIcon,
  Button,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Text,
  Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { HiOutlineTrash } from 'react-icons/hi2';

import { CreateCharacterModal } from './CreateCharacterModal';
import { useCharacters } from './queries';
import { useDeleteCharacter } from './mutations';

export function CharactersPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  const { data: characters, isLoading } = useCharacters();
  const deleteCharacter = useDeleteCharacter();

  const onDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();

    modals.openConfirmModal({
      title: 'Delete character',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{name}</strong>?<br />
          This will permanently remove the character and all their items.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteCharacter.mutateAsync(id);
          notifications.show({
            title: 'Character deleted',
            message: `${name} was removed.`,
          });
        } catch (err: any) {
          notifications.show({
            title: 'Failed to delete character',
            message: err?.message ?? 'Unknown error',
          });
        }
      },
    });
  };

  return (
    <>
      <Group justify="space-between" mb="sm">
        <Title order={2}>Characters</Title>
        <Button variant="light" onClick={open}>
          Create character
        </Button>
      </Group>

      {isLoading ? (
        <Loader />
      ) : (characters?.length ?? 0) === 0 ? (
        <Text c="dimmed">No characters yet. Create your first one.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {characters!.map((c) => (
            <Card
              key={c.id}
              withBorder
              radius="md"
              padding="md"
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => navigate(`/characters/${c.id}`)}
            >
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                style={{ position: 'absolute', top: 8, right: 8 }}
                onClick={(e) => onDelete(e, c.id, c.name)}
                loading={deleteCharacter.isPending}
                aria-label="Delete character"
              >
                <HiOutlineTrash size={16} />
              </ActionIcon>

              <Title order={4}>{c.name}</Title>
              <Text c="dimmed" size="sm" mt={4}>
                Open inventory
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <CreateCharacterModal opened={opened} onClose={close} />
    </>
  );
}
