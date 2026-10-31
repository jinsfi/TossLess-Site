import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(160),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      lastChecked: z.coerce.date(),
      type: z.enum(['app-intent', 'date-labels', 'fridge', 'freezer', 'habits', 'seasonal', 'resource', 'tool']),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      sources: z.array(z.object({ name: z.string(), url: z.string().url() })).default([]),
      draft: z.boolean().default(true),
    }),
});

export const collections = { blog };
