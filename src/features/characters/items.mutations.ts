import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../util/authClient';
import type { CharacterItem } from '../../types/character';

type CreateItemInput = {
  characterId: string;
  name: string;
  quantity: number;
  notes: string | null;
  categoryId: string | null;
};

export function useCreateCharacterItem(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateItemInput): Promise<CharacterItem> => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const user = userData.user;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('character_items')
        .insert({
          user_id: user.id,
          character_id: input.characterId,
          name: input.name.trim(),
          quantity: input.quantity,
          notes: input.notes?.trim() ? input.notes.trim() : null,
          category_id: input.categoryId,
        })
        .select(
          'id,character_id,name,quantity,notes,weight,category_id,created_at'
        )
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['character-items', characterId],
      });
    },
  });
}
