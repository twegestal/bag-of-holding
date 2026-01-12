import {
  AppShell,
  NavLink,
  Stack,
  Skeleton,
  Divider,
  ScrollArea,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { CiLogout, CiUser } from 'react-icons/ci';
import { useCharacters } from './queries';
import { useAuth } from '../../contexts/auth';

type Props = {
  onNavigate?: () => void;
};

export function CharactersNavbar({ onNavigate }: Props) {
  const navigate = useNavigate();
  const { characterId } = useParams();
  const { data, isLoading } = useCharacters();
  const { logout } = useAuth();

  const goTo = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <>
      <AppShell.Section>
        <NavLink
          label="Characters"
          leftSection={<CiUser size={16} />}
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

          {(data ?? []).map((c) => (
            <NavLink
              key={c.id}
              label={c.name}
              active={c.id === characterId}
              onClick={() => goTo(`/characters/${c.id}`)}
            />
          ))}
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
