import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../util/authClient';
import type { Party, PartyMember } from '../../types/party';

export function useCharacterParty(characterId: string | undefined) {
  return useQuery({
    queryKey: ['character-party', characterId],
    enabled: Boolean(characterId),
    queryFn: async (): Promise<Party | null> => {
      const { data: member, error: memberError } = await supabase
        .from('party_members')
        .select('party_id')
        .eq('character_id', characterId)
        .maybeSingle();

      if (memberError) throw memberError;
      if (!member) return null;

      const { data: party, error: partyError } = await supabase
        .from('parties')
        .select('id, name, owner_user_id, invite_code, created_at')
        .eq('id', member.party_id)
        .maybeSingle();

      if (partyError) throw partyError;
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
