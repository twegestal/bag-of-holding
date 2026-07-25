import {
  SimpleGrid,
  Text,
  Card,
  Badge,
  Group,
  Stack,
  Divider,
  ActionIcon,
  Menu,
} from '@mantine/core';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useParams } from 'react-router-dom';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { HiDotsVertical } from 'react-icons/hi';
import { CiEdit } from 'react-icons/ci';
import { HiOutlineTrash } from 'react-icons/hi2';
import {
  useCharacterMagicItems,
  useDeleteMagicItem,
} from './magicItems.mutations';
import { EditMagicItemModal } from './EditMagicItemModal';
import type { CharacterMagicItemRow } from '../../types/items';

export function MagicItemsGrid() {
  const { characterId } = useParams<{ characterId: string }>();
  if (!characterId) return null;

  const { data, isLoading, error } = useCharacterMagicItems(characterId);
  const deleteMagicItem = useDeleteMagicItem(characterId);

  const [selectedItem, setSelectedItem] =
    useState<CharacterMagicItemRow | null>(null);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const onEdit = (row: CharacterMagicItemRow) => {
    setSelectedItem(row);
    openEdit();
  };

  const onDelete = (row: CharacterMagicItemRow) => {
    modals.openConfirmModal({
      title: 'Delete magic item',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{row.card.name}</strong>?
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteMagicItem.mutateAsync(row.id);
          notifications.show({
            title: 'Deleted',
            message: `${row.card.name} removed.`,
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

  if (isLoading) return <Text>Loading…</Text>;
  if (error) return <Text c="red">{(error as Error).message}</Text>;
  if (!data?.length) return <Text>No magic items yet.</Text>;

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {data.map((row) => (
          <Card key={row.id} withBorder radius="md" p="md">
            <Stack gap="sm">
              <Group justify="space-between" align="flex-start">
                <Text fw={700}>{row.card.name}</Text>

                <Group gap="xs">
                  {row.is_equipped && (
                    <Badge color="green" variant="light">
                      Equipped
                    </Badge>
                  )}

                  <Menu shadow="md" width={160} position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" aria-label="Item actions">
                        <HiDotsVertical />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<CiEdit size={16} />}
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        color="red"
                        leftSection={<HiOutlineTrash size={16} />}
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>

              <Group gap="xs">
                {row.card.type && (
                  <Badge variant="light">{row.card.type}</Badge>
                )}
                {row.card.slot && (
                  <Badge variant="light">{row.card.slot}</Badge>
                )}
                {row.card.value && (
                  <Badge variant="light">{row.card.value}</Badge>
                )}
                <Badge
                  color={row.card.attunement_required ? 'orange' : 'red'}
                  variant="light"
                >
                  {row.card.attunement_required
                    ? 'Requires attunement'
                    : 'Does not require attunement'}
                </Badge>
              </Group>

              <Divider />

              <Stack gap="xs">
                {row.card.sections.map((section, idx) => (
                  <Stack key={idx} gap={2}>
                    {section.title && (
                      <Text fw={600} size="sm">
                        {section.title}
                      </Text>
                    )}
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {section.body}
                    </Text>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <EditMagicItemModal
        opened={editOpened}
        onClose={() => {
          closeEdit();
          setSelectedItem(null);
        }}
        item={selectedItem}
        characterId={characterId}
      />
    </>
  );
}
