import { useState } from 'react';
import {
  Badge,
  Button,
  CopyButton,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IoCopyOutline } from 'react-icons/io5';
import type { Party } from '../../../types/party';
import { usePartyMembers } from '../party.queries';
import { useLeaveParty } from '../party.mutations';

export function PartyView({
  party,
  characterId,
}: {
  party: Party;
  characterId: string;
}) {
  const [showCode, setShowCode] = useState(false);
  const { data: members } = usePartyMembers(party.id, characterId);
  const leave = useLeaveParty();

  const onLeave = () => {
    modals.openConfirmModal({
      title: 'Leave party',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to leave <strong>{party.name}</strong>?
        </Text>
      ),
      labels: { confirm: 'Leave', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await leave.mutateAsync({ partyId: party.id, characterId });
          notifications.show({
            title: 'Left party',
            message: `You left ${party.name}.`,
          });
        } catch (e: any) {
          notifications.show({
            title: 'Failed',
            message: e?.message ?? 'Unknown error',
            color: 'red',
          });
        }
      },
    });
  };

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title order={2}>{party.name}</Title>
        <Button
          color="red"
          variant="subtle"
          size="xs"
          onClick={onLeave}
          loading={leave.isPending}
        >
          Leave party
        </Button>
      </Group>

      <Paper withBorder p="md">
        <Stack gap="xs">
          <Text fw={600} size="sm">
            Members
          </Text>
          <Divider />
          {(members ?? []).length === 0 ? (
            <Text c="dimmed" size="sm">
              No other members yet.
            </Text>
          ) : (
            (members ?? []).map((m) => (
              <Text key={m.id} size="sm">
                {m.character.name}
              </Text>
            ))
          )}
        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Stack gap="sm">
          <Text fw={600} size="sm">
            Invite others
          </Text>
          <Text size="sm" c="dimmed">
            Share the invite code with other players so they can add their
            character to this party.
          </Text>

          {showCode ? (
            <Group>
              <Badge
                size="lg"
                variant="outline"
                tt="none"
                style={{ fontFamily: 'monospace', fontSize: 16 }}
              >
                {party.invite_code}
              </Badge>
              <CopyButton value={party.invite_code} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied!' : 'Copy'} withArrow>
                    <Button
                      variant="subtle"
                      size="xs"
                      leftSection={<IoCopyOutline size={14} />}
                      onClick={copy}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          ) : (
            <Button
              variant="default"
              size="xs"
              w="fit-content"
              onClick={() => setShowCode(true)}
            >
              Show invite code
            </Button>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
