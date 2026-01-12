export type CoinMeta = {
  key: keyof Coins;
  label: string;
  sublabel: string;
  color: string;
};

export type Coins = {
  pp: number;
  gp: number;
  ep: number;
  sp: number;
  cp: number;
};
