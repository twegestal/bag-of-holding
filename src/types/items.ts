export type ItemCard = {
  name: string;

  type: string;
  slot: string;
  value: string;

  attunement: {
    required: boolean;
    note: string;
  };

  sections: Array<{
    title: string;
    body: string;
  }>;

  image: {
    hasArt: boolean;
  };

  confidence: {
    overall: number;
    warnings: string[];
  };
};

export type CharacterMagicItemRow = {
  id: string;
  character_id: string;
  card_id: string;
  quantity: number;
  is_equipped: boolean;
  created_at: string;

  card: {
    id: string;
    name: string;
    type: string;
    slot: string;
    value: string;
    attunement_required: boolean;
    has_art: boolean;
    sections: Array<{ title: string; body: string }>;
  };
};
