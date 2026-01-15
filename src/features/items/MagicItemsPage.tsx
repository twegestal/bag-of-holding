import { Button, Group, Stack, Title } from '@mantine/core';
import { useNavigate, useParams, Outlet, useLocation } from 'react-router-dom';
import { CiCirclePlus } from 'react-icons/ci';

export function MagicItemsPage() {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  if (!characterId) return null;

  const isNewRoute = location.pathname.endsWith('/magic-items/new');

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Title order={2}>Magic items</Title>

        {!isNewRoute && (
          <Button
            leftSection={<CiCirclePlus size={18} />}
            onClick={() => navigate('new')}
          >
            Add
          </Button>
        )}
      </Group>

      <Outlet />
    </Stack>
  );
}
