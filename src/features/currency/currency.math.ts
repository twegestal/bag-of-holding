import type { Coins } from '../../types/currency';

export function applyDelta(
  current: Coins,
  delta: Coins,
  mode: 'add' | 'spend'
) {
  const sign = mode === 'add' ? 1 : -1;

  const next: Coins = {
    pp: current.pp + sign * delta.pp,
    gp: current.gp + sign * delta.gp,
    ep: current.ep + sign * delta.ep,
    sp: current.sp + sign * delta.sp,
    cp: current.cp + sign * delta.cp,
  };

  const errors: string[] = [];
  (Object.entries(next) as [keyof Coins, number][]).forEach(([k, v]) => {
    if (v < 0) errors.push(`Not enough ${k.toUpperCase()}`);
  });

  return { next, errors };
}
