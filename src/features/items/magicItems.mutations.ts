import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../util/authClient';
import type { CharacterMagicItemRow, ItemCard } from '../../types/items';
import { mapItemCardToInsert } from './magicItems.mapper';

type SaveMagicItemInput = {
  characterId: string;
  card: ItemCard;
  quantity?: number;
  isEquipped?: boolean;
};

export function useSaveMagicItem(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveMagicItemInput) => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const user = userData.user;
      if (!user) throw new Error('Not authenticated');

      const cardInsert = {
        user_id: user.id,
        ...mapItemCardToInsert(input.card),
      };

      const { data: createdCard, error: cardError } = await supabase
        .from('magic_item_cards')
        .insert(cardInsert)
        .select('id')
        .single();

      if (cardError) throw cardError;

      const { data: linkRow, error: linkError } = await supabase
        .from('character_magic_items')
        .insert({
          user_id: user.id,
          character_id: input.characterId,
          card_id: createdCard.id,
          quantity: input.quantity ?? 1,
          is_equipped: input.isEquipped ?? false,
        })
        .select('id, character_id, card_id, quantity, is_equipped, created_at')
        .single();

      if (linkError) throw linkError;

      return { cardId: createdCard.id, link: linkRow };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['character-magic-items', characterId],
      });
    },
  });
}

export function useCharacterMagicItems(characterId: string) {
  return useQuery({
    queryKey: ['character-magic-items', characterId],
    queryFn: async (): Promise<CharacterMagicItemRow[]> => {
      const { data, error } = await supabase
        .from('character_magic_items')
        .select(
          `
          id,
          character_id,
          card_id,
          quantity,
          is_equipped,
          created_at,
          card:magic_item_cards!inner (
            id,
            name,
            type,
            slot,
            value,
            attunement_required,
            has_art,
            sections
          )
        `
        )
        .eq('character_id', characterId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []) as unknown as CharacterMagicItemRow[];
    },
  });
}
