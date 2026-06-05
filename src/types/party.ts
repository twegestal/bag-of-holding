export type Party = {
  id: string;
  name: string;
  owner_user_id: string;
  invite_code: string;
  created_at: string;
};

export type PartyMember = {
  id: string;
  party_id: string;
  character_id: string;
  user_id: string;
  joined_at: string;
  character: {
    id: string;
    name: string;
  };
};
