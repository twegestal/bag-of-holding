import {
  AppShell,
  NavLink,
  Stack,
  Skeleton,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CiLogout, CiBag1 } from 'react-icons/ci';
import { FaCoins } from 'react-icons/fa6';
import { GiAxeSword } from 'react-icons/gi';
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
  const { logout } = useAuth();

  const [openedCharacterId, setOpenedCharacterId] = useState<string | null>(
    null
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

  return (
    <>
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
