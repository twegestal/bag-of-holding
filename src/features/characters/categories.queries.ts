import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../util/authClient';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id,name')
        .order('name', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}
