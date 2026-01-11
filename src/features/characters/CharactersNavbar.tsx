import { NavLink, Stack, Text, Button, Skeleton } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { useCharacters } from './queries';

export function CharactersNavbar() {
  const navigate = useNavigate();
  const { characterId } = useParams();
  const { data, isLoading } = useCharacters();

  return (
    <Stack gap="sm">
      <Text fw={700}>Characters</Text>

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
          onClick={() => navigate(`/characters/${c.id}`)}
        />
      ))}

      <Button variant="light" onClick={() => navigate('/characters')}>
        Manage
      </Button>
    </Stack>
  );
}
