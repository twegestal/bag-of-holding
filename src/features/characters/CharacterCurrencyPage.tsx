import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Group,
  Loader,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Divider,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { RiCoinLine } from 'react-icons/ri';

import { useCharacterCurrency } from '../currency/currency.queries';
import { useUpdateCharacterCurrency } from '../currency/currency.mutations';
import { applyDelta } from '../currency/currency.math';
import { COINS } from '../currency/constants';
import type { AdjustCoins, Coins } from '../../types/currency';

const EMPTY: AdjustCoins = { pp: '', gp: '', ep: '', sp: '', cp: '' };

export function CharacterCurrencyPage() {
  const { characterId } = useParams();
  if (!characterId) return <Text c="dimmed">No character selected.</Text>;

  const { data, isLoading, isError } = useCharacterCurrency(characterId);
  const update = useUpdateCharacterCurrency(characterId);

  const current = useMemo<Coins | null>(() => {
    if (!data) return null;
    return { pp: data.pp, gp: data.gp, ep: data.ep, sp: data.sp, cp: data.cp };
  }, [data]);

  const adjustForm = useForm<AdjustCoins>({
    initialValues: EMPTY,
    validate: {
      pp: (v) => (v !== '' && v < 0 ? 'Must be 0 or higher' : null),
      gp: (v) => (v !== '' && v < 0 ? 'Must be 0 or higher' : null),
      ep: (v) => (v !== '' && v < 0 ? 'Must be 0 or higher' : null),
      sp: (v) => (v !== '' && v < 0 ? 'Must be 0 or higher' : null),
      cp: (v) => (v !== '' && v < 0 ? 'Must be 0 or higher' : null),
    },
  });

  useEffect(() => {
    adjustForm.setValues(EMPTY);
    adjustForm.resetDirty();
  }, [characterId]);

  const doAdjust = async (mode: 'add' | 'spend') => {
    if (!data || !current) return;

    const delta: Coins = {
      pp: adjustForm.values.pp === '' ? 0 : adjustForm.values.pp,
      gp: adjustForm.values.gp === '' ? 0 : adjustForm.values.gp,
      ep: adjustForm.values.ep === '' ? 0 : adjustForm.values.ep,
      sp: adjustForm.values.sp === '' ? 0 : adjustForm.values.sp,
      cp: adjustForm.values.cp === '' ? 0 : adjustForm.values.cp,
    };

    const nothingEntered = Object.values(delta).every((v) => v === 0);
    if (nothingEntered) {
      return;
    }

    const { next, errors } = applyDelta(current, delta, mode);

    if (errors.length > 0) {
      notifications.show({
        title: 'Not enough coins',
        message: errors.join(', '),
      });
      return;
    }

    try {
      await update.mutateAsync({ id: data.id, ...next });

      adjustForm.setValues(EMPTY);
      adjustForm.resetDirty();
    } catch (e: any) {
      notifications.show({
        title: 'Failed',
        message: e?.message ?? 'Unknown error',
      });
    }
  };

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="sm">
          <Title order={2}>Currency</Title>
        </Group>

        {isLoading ? (
          <Loader />
        ) : isError || !data ? (
          <Text c="dimmed">Could not load currency.</Text>
        ) : (
          <Stack gap="xs">
            {COINS.map((c) => (
              <Group key={c.key} justify="space-between" align="center" py={6}>
                <Group gap="sm" align="center">
                  <ThemeIcon
                    variant="light"
                    radius="xl"
                    size="lg"
                    color={c.color}
                  >
                    <RiCoinLine size={18} />
                  </ThemeIcon>

                  <div>
                    <Text fw={600}>{c.label}</Text>
                    {c.sublabel ? (
                      <Text size="sm" c="dimmed">
                        {c.sublabel}
                      </Text>
                    ) : null}
                  </div>
                </Group>

                <Text fw={700} size="xl">
                  {data[c.key]}
                </Text>
              </Group>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper p="md" withBorder>
        <Title order={3} mb="sm">
          Adjust coin
        </Title>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="sm">
            <NumberInput
              label="PP"
              type="tel"
              inputMode="numeric"
              min={0}
              hideControls
              {...adjustForm.getInputProps('pp')}
            />
            <NumberInput
              label="GP"
              type="tel"
              inputMode="numeric"
              min={0}
              hideControls
              {...adjustForm.getInputProps('gp')}
            />
            <NumberInput
              label="EP"
              type="tel"
              inputMode="numeric"
              min={0}
              hideControls
              {...adjustForm.getInputProps('ep')}
            />
            <NumberInput
              label="SP"
              type="tel"
              inputMode="numeric"
              min={0}
              hideControls
              {...adjustForm.getInputProps('sp')}
            />
            <NumberInput
              label="CP"
              type="tel"
              inputMode="numeric"
              min={0}
              hideControls
              {...adjustForm.getInputProps('cp')}
            />
          </SimpleGrid>

          <Divider my="md" />

          <Group justify="center">
            <Button
              color="green"
              variant="light"
              onClick={() => doAdjust('add')}
              loading={update.isPending}
            >
              + Add
            </Button>

            <Button
              color="red"
              variant="light"
              onClick={() => doAdjust('spend')}
              loading={update.isPending}
            >
              − Remove
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                adjustForm.setValues(EMPTY);
                adjustForm.resetDirty();
              }}
              disabled={update.isPending}
            >
              Clear
            </Button>
          </Group>
        </form>
      </Paper>
    </Stack>
  );
}
