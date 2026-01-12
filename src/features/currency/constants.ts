import type { CoinMeta } from '../../types/currency';

export const COINS: CoinMeta[] = [
  {
    key: 'pp',
    label: 'Platinum (pp)',
    sublabel: '1 pp = 10 gp',
    color: 'gray',
  },
  {
    key: 'gp',
    label: 'Gold (gp)',
    sublabel: '',
    color: 'yellow',
  },
  {
    key: 'ep',
    label: 'Electrum (ep)',
    sublabel: '1 gp = 2 ep',
    color: 'teal',
  },
  {
    key: 'sp',
    label: 'Silver (sp)',
    sublabel: '1 gp = 10 sp',
    color: 'gray',
  },
  {
    key: 'cp',
    label: 'Copper (cp)',
    sublabel: '1 gp = 100 cp',
    color: 'orange',
  },
];
