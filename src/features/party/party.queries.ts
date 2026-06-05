import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../util/authClient';
import type { Party, PartyMember } from '../../types/party';

export function useCharacterParty(characterId: string | undefined) {
  return useQuery({
    queryKey: ['character-party', characterId],
    enabled: Boolean(characterId),
    queryFn: async (): Promise<Party | null> => {
      const { data, error } = await supabase
        .from('party_members')
        .select(
          'party:parties(id, name, owner_user_id, invite_code, created_at)',
        )
        .eq('character_id', characterId)
        .maybeSingle();

      if (error) throw error;
      if (!data?.party) return null;

      const party = Array.isArray(data.party) ? data.party[0] : data.party;
      return (party as Party) ?? null;
    },
  });
}

export function usePartyMembers(
  partyId: string | undefined,
  excludeCharacterId: string,
) {
  return useQuery({
    queryKey: ['party-members', partyId],
    enabled: Boolean(partyId),
    queryFn: async (): Promise<PartyMember[]> => {
      const { data, error } = await supabase
        .from('party_members')
        .select(
          `
          id, party_id, character_id, user_id, joined_at,
          character:characters!inner(id, name)
        `,
        )
        .eq('party_id', partyId)
        .neq('character_id', excludeCharacterId);

      if (error) throw error;
      return (data ?? []) as unknown as PartyMember[];
    },
  });
}
