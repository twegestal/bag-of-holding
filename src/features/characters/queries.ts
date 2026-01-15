import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../util/authClient';
import type { Character, CharacterItem } from '../../types/character';

export function useCharacters() {
  return useQuery({
    queryKey: ['characters'],
    queryFn: async (): Promise<Character[]> => {
      const { data, error } = await supabase
        .from('characters')
        .select('id,name,created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCharacterItems(characterId: string | undefined) {
  return useQuery({
    queryKey: ['character-items', characterId],
    enabled: Boolean(characterId),
    queryFn: async (): Promise<CharacterItem[]> => {
      const { data, error } = await supabase
        .from('character_items')
        .select(
          'id,character_id,name,quantity,notes,weight,created_at,category_id, value_gp'
        )
        .eq('character_id', characterId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}
