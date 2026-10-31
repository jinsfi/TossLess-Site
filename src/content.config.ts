import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { postTypes, typesNeedingSources, type PostType } from './lib/post-types';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string().max(160),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        lastChecked: z.coerce.date(),
        type: z.enum(Object.keys(postTypes) as [PostType, ...PostType[]]),
        heroImage: image().optional(),
        heroAlt: z.string().optional(),
        sources: z.array(z.object({ name: z.string().min(1), url: z.string().url() })).default([]),
        draft: z.boolean().default(true),
      })
      .superRefine((data, ctx) => {
        if (data.heroImage && !data.heroAlt) {
          ctx.addIssue({ code: 'custom', path: ['heroAlt'], message: 'heroAlt is required when heroImage is set.' });
        }
        if (!data.draft && typesNeedingSources.includes(data.type) && data.sources.length === 0) {
          ctx.addIssue({
            code: 'custom',
            path: ['sources'],
            message: `A published "${data.type}" article must list at least one official source. Add sources: to the frontmatter, or set draft: true.`,
          });
        }
      }),
});

export const collections = { blog };
