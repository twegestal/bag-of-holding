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

type UpdateItemInput = {
  id: string;
  name: string;
  notes: string | null;
  categoryId: string | null;
  weight?: number | null;
};

export function useDeleteCharacterItem(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('character_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['character-items', characterId],
      });
    },
  });
}

export function useUpdateCharacterItem(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateItemInput): Promise<CharacterItem> => {
      const { data, error } = await supabase
        .from('character_items')
        .update({
          name: input.name.trim(),
          notes: input.notes?.trim() ? input.notes.trim() : null,
          category_id: input.categoryId,
          ...(input.weight !== undefined ? { weight: input.weight } : {}),
        })
        .eq('id', input.id)
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

export function useIncrementItemQuantity(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: { id: string; quantity: number }) => {
      const { error } = await supabase
        .from('character_items')
        .update({ quantity: item.quantity + 1 })
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['character-items', characterId],
      });
    },
  });
}

export function useDecrementItemQuantity(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: { id: string; quantity: number }) => {
      if (item.quantity <= 1) {
        const { error } = await supabase
          .from('character_items')
          .delete()
          .eq('id', item.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase
        .from('character_items')
        .update({ quantity: item.quantity - 1 })
        .eq('id', item.id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['character-items', characterId],
      });
    },
  });
}
