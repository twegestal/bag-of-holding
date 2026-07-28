import {
  AppShell,
  Avatar,
  Divider,
  NavLink,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CiLogout, CiBag1 } from 'react-icons/ci';
import { FaCoins } from 'react-icons/fa6';
import { GiAxeSword } from 'react-icons/gi';
import { RiGroupLine } from 'react-icons/ri';
import { useCharacters } from './queries';
import { useAuth } from '../../contexts/auth';
import { useEffect, useState } from 'react';

type Props = {
  onNavigate?: () => void;
};

export function CharactersNavbar({ onNavigate }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { characterId } = useParams();
  const { data, isLoading } = useCharacters();
  const { logout, user } = useAuth();

  const [openedCharacterId, setOpenedCharacterId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (characterId) setOpenedCharacterId(characterId);
  }, [characterId]);

  const goTo = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const isItemsRoute = location.pathname.includes('/items');
  const isCurrencyRoute = location.pathname.includes('/currency');
  const isMagicItemsRoute = location.pathname.includes('/magic-items');
  const isPartyRoute = location.pathname.includes('/party');

  const displayName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email;
  const avatarUrl =
    user?.user_metadata?.picture ?? user?.user_metadata?.avatar_url;

  return (
    <>
      <AppShell.Section p="sm">
        <Stack gap={4}>
          <Avatar src={avatarUrl} radius="xl" size="md" />
          <Text size="sm" fw={600} truncate>
            {displayName}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {user?.email}
          </Text>
        </Stack>
        <Divider mt="sm" />
      </AppShell.Section>

      <AppShell.Section>
        <NavLink
          label="Characters"
          fw={700}
          onClick={() => goTo('/characters')}
        />
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea} offsetScrollbars>
        <Stack gap="sm">
          {isLoading && (
            <>
              <Skeleton h={28} />
              <Skeleton h={28} />
              <Skeleton h={28} />
            </>
          )}

          {(data ?? []).map((c) => {
            const isOpen = openedCharacterId === c.id;
            const isActiveCharacter = characterId === c.id;

            return (
              <NavLink
                key={c.id}
                label={c.name}
                active={isActiveCharacter}
                opened={isOpen}
                onChange={() => setOpenedCharacterId(isOpen ? null : c.id)}
              >
                <NavLink
                  label="Items"
                  leftSection={<CiBag1 size={16} />}
                  active={isActiveCharacter && isItemsRoute}
                  onClick={() => goTo(`/characters/${c.id}/items`)}
                />
                <NavLink
                  label="Currency"
                  leftSection={<FaCoins size={16} />}
                  active={isActiveCharacter && isCurrencyRoute}
                  onClick={() => goTo(`/characters/${c.id}/currency`)}
                />
                <NavLink
                  label="Magic items"
                  leftSection={<GiAxeSword size={16} />}
                  active={isActiveCharacter && isMagicItemsRoute}
                  onClick={() => goTo(`/characters/${c.id}/magic-items`)}
                />
                <NavLink
                  label="Party"
                  leftSection={<RiGroupLine size={16} />}
                  active={isActiveCharacter && isPartyRoute}
                  onClick={() => goTo(`/characters/${c.id}/party`)}
                />
              </NavLink>
            );
          })}
        </Stack>
      </AppShell.Section>

      <AppShell.Section>
        <Divider my="sm" />
        <NavLink
          label="Log out"
          leftSection={<CiLogout size={16} />}
          color="red"
          onClick={() => {
            logout();
            onNavigate?.();
          }}
        />
      </AppShell.Section>
    </>
  );
}
