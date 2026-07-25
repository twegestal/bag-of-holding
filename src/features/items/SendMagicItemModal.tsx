import { useState } from 'react';
import { Button, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCharacterParty, usePartyMembers } from '../party/party.queries';
import { useTransferMagicItem } from './magicItems.mutations';
import type { CharacterMagicItemRow } from '../../types/items';

type Props = {
  opened: boolean;
  onClose: () => void;
  item: CharacterMagicItemRow;
  characterId: string;
};

export function SendMagicItemModal({
  opened,
  onClose,
  item,
  characterId,
}: Props) {
  const [toCharacterId, setToCharacterId] = useState<string | null>(null);

  const { data: party } = useCharacterParty(characterId);
  const { data: members } = usePartyMembers(party?.id, characterId);
  const transfer = useTransferMagicItem(characterId);

  const memberOptions = (members ?? []).map((m) => ({
    value: m.character_id,
    label: m.character.name,
  }));

  const onConfirm = async () => {
    if (!toCharacterId) return;

    try {
      await transfer.mutateAsync({ linkId: item.id, toCharacterId });
      notifications.show({
        title: 'Item sent',
        message: `${item.card.name} transferred.`,
      });
      onClose();
    } catch (e: any) {
      notifications.show({
        title: 'Transfer failed',
        message: e?.message ?? 'Unknown error',
        color: 'red',
      });
    }
  };

  const noParty = !party;
  const noMembers = (members ?? []).length === 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Send: ${item.card.name}`}
      centered
    >
      {noParty ? (
        <Text c="dimmed" size="sm">
          Your character is not in a party. Join or create one first.
        </Text>
      ) : noMembers ? (
        <Text c="dimmed" size="sm">
          No other party members yet.
        </Text>
      ) : (
        <Stack>
          <Select
            label="Send to"
            placeholder="Choose character"
            data={memberOptions}
            value={toCharacterId}
            onChange={setToCharacterId}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              loading={transfer.isPending}
              disabled={!toCharacterId}
            >
              Send
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
