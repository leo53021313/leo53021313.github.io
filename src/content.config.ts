import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  // schema is a function so we can use the `image()` helper: `cover` resolves to an
  // optimizable asset (astro:assets emits AVIF/WebP + responsive srcset + intrinsic dims).
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      oneLiner: z.string(),
      role: z.string(),
      status: z.enum(['done', 'wip']),
      timeframe: z.string(),
      tech: z.array(z.string()),
      repoUrl: z.url().optional(),
      demoUrl: z.url().optional(),
      evidence: z.string().optional(),
      metrics: z.array(z.string()).default([]),
      // case-study narrative (incl. the "踩坑 / Lessons" section) lives in the Markdown body
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      order: z.number().default(0),
      cover: image().optional(), // path relative to the .md file → src/assets/…
      coverAlt: z.string().optional(), // descriptive alt for the cover screenshot
    }),
});
export const collections = { projects };
