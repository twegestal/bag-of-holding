import { useState } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCharacterParty } from '../party/party.queries';
import { usePartyMembers } from '../party/party.queries';
import { useTransferItem } from '../party/party.mutations';
import type { CharacterItem } from '../../types/character';

type Props = {
  opened: boolean;
  onClose: () => void;
  item: CharacterItem;
  characterId: string;
};

export function SendItemModal({ opened, onClose, item, characterId }: Props) {
  const [toCharacterId, setToCharacterId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);

  const { data: party } = useCharacterParty(characterId);
  const { data: members } = usePartyMembers(party?.id, characterId);
  const transfer = useTransferItem(characterId);

  const memberOptions = (members ?? []).map((m) => ({
    value: m.character_id,
    label: m.character.name,
  }));

  const onConfirm = async () => {
    if (!toCharacterId || !quantity) return;
    const qty = Number(quantity);
    if (qty < 1 || qty > item.quantity) return;

    try {
      await transfer.mutateAsync({
        itemId: item.id,
        toCharacterId,
        quantity: qty,
      });
      notifications.show({
        title: 'Item sent',
        message: `${qty}× ${item.name} transferred.`,
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
      title={`Send: ${item.name}`}
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

          <NumberInput
            label={`Quantity (max ${item.quantity})`}
            min={1}
            max={item.quantity}
            value={quantity}
            onChange={setQuantity}
            hideControls={false}
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
