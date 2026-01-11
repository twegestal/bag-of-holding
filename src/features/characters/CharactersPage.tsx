import { Button, Group, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreateCharacterModal } from './CreateCharacterModal';

export function CharactersPage() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Group justify="space-between" mb="sm">
        <Title order={2}>Characters</Title>
        <Button onClick={open}>Create character</Button>
      </Group>

      <Text c="dimmed">Select a character in the navbar to view items.</Text>

      <CreateCharacterModal opened={opened} onClose={close} />
    </>
  );
}
