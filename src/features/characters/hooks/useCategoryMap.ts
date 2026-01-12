import { useMemo } from 'react';
import { useCategories } from '../../categories/categories.queries';

export function useCategoryMap() {
  const { data: categories } = useCategories();

  return useMemo(() => {
    const map = new Map<string, string>();
    (categories ?? []).forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);
}
