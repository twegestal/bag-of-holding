import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../util/authClient';

type CreateCharacterInput = {
  name: string;
};

type CreatedCharacter = {
  id: string;
  name: string;
};

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: CreateCharacterInput
    ): Promise<CreatedCharacter> => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const user = userData.user;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('characters')
        .insert({
          user_id: user.id,
          name: input.name.trim(),
        })
        .select('id,name')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (characterId: string) => {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}
