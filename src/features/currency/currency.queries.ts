import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../util/authClient';
import type { CharacterCurrency } from '../../types/character';

export function useCharacterCurrency(characterId: string | undefined) {
  return useQuery({
    queryKey: ['character-currency', characterId],
    enabled: Boolean(characterId),
    queryFn: async (): Promise<CharacterCurrency> => {
      const { data, error } = await supabase
        .from('character_currency')
        .select('id,character_id,pp,gp,ep,sp,cp')
        .eq('character_id', characterId)
        .single();

      if (error) throw error;
      return data;
    },
  });
}
