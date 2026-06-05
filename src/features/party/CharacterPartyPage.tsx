import { useParams } from 'react-router-dom';
import { Stack, Text } from '@mantine/core';
import { useCharacterParty } from './party.queries';
import { NoPartyView } from './components/NoPartyView';
import { PartyView } from './components/PartyView';

export function CharacterPartyPage() {
  const { characterId } = useParams<{ characterId: string }>();
  if (!characterId) return null;

  const { data: party, isLoading } = useCharacterParty(characterId);

  if (isLoading) return <Text c="dimmed">Loading…</Text>;

  return (
    <Stack>
      {party ? (
        <PartyView party={party} characterId={characterId} />
      ) : (
        <NoPartyView characterId={characterId} />
      )}
    </Stack>
  );
}
