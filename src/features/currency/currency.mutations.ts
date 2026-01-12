import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../util/authClient';
import type { CharacterCurrency } from '../../types/character';

type UpdateCurrencyInput = {
  id: string;
  pp: number;
  gp: number;
  ep: number;
  sp: number;
  cp: number;
};

export function useUpdateCharacterCurrency(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: UpdateCurrencyInput
    ): Promise<CharacterCurrency> => {
      const { data, error } = await supabase
        .from('character_currency')
        .update({
          pp: input.pp,
          gp: input.gp,
          ep: input.ep,
          sp: input.sp,
          cp: input.cp,
        })
        .eq('id', input.id)
        .select('id,character_id,pp,gp,ep,sp,cp')
        .single();

      if (error) throw error;
      return data;
    },

    onSuccess: async (updatedRow) => {
      queryClient.setQueryData(['character-currency', characterId], updatedRow);

      await queryClient.invalidateQueries({
        queryKey: ['character-currency', characterId],
      });
    },
  });
}
