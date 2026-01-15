export type Character = {
  id: string;
  name: string;
  created_at: string;
};

export type CharacterItem = {
  id: string;
  character_id: string;
  name: string;
  quantity: number;
  notes: string | null;
  weight: number | null;
  category_id: string | null;
  value_gp: number | null;
  created_at: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  name: string;
};

export type CharacterCurrency = {
  id: string;
  character_id: string;
  pp: number;
  gp: number;
  ep: number;
  sp: number;
  cp: number;
};
