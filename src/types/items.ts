export type ItemCard = {
  name: string;

  type?: string;

  slot?: string;

  attunement?: {
    required: boolean;
    note?: string;
  };

  value?: string;

  sections: Array<{
    title?: string;
    body: string;
  }>;

  image?: {
    hasArt: boolean;
  };

  confidence?: {
    overall: number;
    warnings?: string[];
  };
};
