import Fuse from 'fuse.js';

interface SearchField {
  name: string;
  weight: number;
  getValue: (item: any) => string;
}

/**
 * Fuzzy search using fuse.js, matching the previous semanticSearch API.
 * @param query The search query string
 * @param items The array of items to search
 * @param fields The fields to search in, with weights
 * @param threshold The minimum score to include (0 = perfect match, 1 = match all)
 * @returns Array of { item, score }
 */
export async function semanticSearch<T>(
  query: string,
  items: T[],
  fields: SearchField[],
  threshold: number = 0.5
): Promise<{ item: T; score: number }[]> {
  if (!query || !items.length) return [];

  // Build fuse.js options
  const fuseOptions = {
    keys: fields.map(f => ({ name: f.name, weight: f.weight })),
    includeScore: true,
    threshold: 0.4, // Lower = stricter
    minMatchCharLength: 2,
    ignoreLocation: true,
    useExtendedSearch: true,
  };

  // Map items to a flat object for fuse.js
  const mappedItems = items.map(item => {
    const obj: any = {};
    fields.forEach(f => {
      obj[f.name] = f.getValue(item);
    });
    return obj;
  });

  const fuse = new Fuse(mappedItems, fuseOptions);
  const results = fuse.search(query);

  // Map back to original items and normalize score
  return results
    .filter(r => (1 - (r.score ?? 1)) >= threshold)
    .map(r => ({ item: items[r.refIndex], score: 1 - (r.score ?? 1) }));
} 