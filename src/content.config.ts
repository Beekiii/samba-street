import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Journal posts: one Markdown file per post in src/content/journal/,
// written in Pages CMS (see .pages.yml). Photos live in src/assets/journal/.
const journal = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/journal" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      summary: z.string().nullish(),
      cover: image(),
      coverAlt: z.string().nullish(),
      // Drafts are saved in the repo but never shown on the site.
      draft: z.boolean().nullish().default(false),
    }),
});

export const collections = { journal };
