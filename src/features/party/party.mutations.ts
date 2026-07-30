import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../util/authClient';

// Skapa party
export function useCreateParty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      characterId,
    }: {
      name: string;
      characterId: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error('Not authenticated');

      const { data: party, error: partyError } = await supabase
        .from('parties')
        .insert({ name, owner_user_id: user.id })
        .select('id, invite_code')
        .single();

      if (partyError) throw partyError;

      const { error: memberError } = await supabase
        .from('party_members')
        .insert({
          party_id: party.id,
          character_id: characterId,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      return party;
    },
    onSuccess: (_data, { characterId }) => {
      queryClient.invalidateQueries({
        queryKey: ['character-party', characterId],
      });
    },
  });
}

export function useJoinParty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      inviteCode,
      characterId,
    }: {
      inviteCode: string;
      characterId: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error('Not authenticated');

      const { data: partyId, error: partyError } = await supabase.rpc(
        'get_party_by_invite_code',
        { p_code: inviteCode.trim().toLowerCase() },
      );

      if (partyError || !partyId) throw new Error('Invalid invite code');

      const { error: memberError } = await supabase
        .from('party_members')
        .insert({
          party_id: partyId,
          character_id: characterId,
          user_id: user.id,
        });

      if (memberError) throw memberError;
    },
    onSuccess: (_data, { characterId }) => {
      queryClient.invalidateQueries({
        queryKey: ['character-party', characterId],
      });
    },
  });
}

// Lämna party
export function useLeaveParty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      partyId,
      characterId,
    }: {
      partyId: string;
      characterId: string;
    }) => {
      const { error } = await supabase
        .from('party_members')
        .delete()
        .eq('party_id', partyId)
        .eq('character_id', characterId);
      if (error) throw error;
    },
    onSuccess: (_data, { characterId }) => {
      queryClient.invalidateQueries({
        queryKey: ['character-party', characterId],
      });
      queryClient.invalidateQueries({ queryKey: ['party-members'] });
    },
  });
}

// Skicka item
export function useTransferItem(fromCharacterId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      toCharacterId,
      quantity,
    }: {
      itemId: string;
      toCharacterId: string;
      quantity: number;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('transfer_item', {
        p_item_id: itemId,
        p_from_character: fromCharacterId,
        p_to_character: toCharacterId,
        p_quantity: quantity,
        p_user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['character-items', fromCharacterId],
      });
    },
  });
}
