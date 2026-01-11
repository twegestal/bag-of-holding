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
  created_at: string;
  category_id: string | null;
};

export type Category = {
  id: string;
  name: string;
};
