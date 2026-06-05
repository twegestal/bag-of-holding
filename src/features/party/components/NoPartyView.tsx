import { useState } from 'react';
import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreatePartyModal } from './CreatePartyModal';
import { JoinPartyModal } from './JoinPartyModal';

export function NoPartyView({ characterId }: { characterId: string }) {
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [joinOpened, { open: openJoin, close: closeJoin }] =
    useDisclosure(false);

  return (
    <>
      <Title order={2}>Party</Title>
      <Text c="dimmed">This character is not in a party yet.</Text>

      <Group>
        <Button onClick={openCreate}>Create party</Button>
        <Button variant="default" onClick={openJoin}>
          Join with invite code
        </Button>
      </Group>

      <CreatePartyModal
        opened={createOpened}
        onClose={closeCreate}
        characterId={characterId}
      />
      <JoinPartyModal
        opened={joinOpened}
        onClose={closeJoin}
        characterId={characterId}
      />
    </>
  );
}
