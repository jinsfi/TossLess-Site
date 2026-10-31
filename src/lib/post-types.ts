export const postTypes = {
  'app-intent': 'Apps',
  'date-labels': 'Date labels',
  fridge: 'Fridge',
  freezer: 'Freezer',
  habits: 'Habits',
  seasonal: 'Seasonal',
  resource: 'Resources',
  tool: 'Tools',
} as const;

export type PostType = keyof typeof postTypes;

/** Types whose articles state storage times, so a published article must cite sources. */
export const typesNeedingSources: PostType[] = ['fridge', 'freezer', 'date-labels', 'seasonal'];
