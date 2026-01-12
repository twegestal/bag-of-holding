import { useMemo } from 'react';
import type { CharacterItem } from '../../../types/character';

export function useFilteredItems({
  items,
  search,
  categoryMap,
}: {
  items: CharacterItem[] | undefined;
  search: string;
  categoryMap: Map<string, string>;
}) {
  return useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items ?? [];

    return (items ?? []).filter((i) => {
      const categoryName = i.category_id
        ? categoryMap.get(i.category_id) ?? ''
        : '';
      const haystack = `${i.name} ${
        i.notes ?? ''
      } ${categoryName}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, search, categoryMap]);
}
