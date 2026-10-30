import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"journal">;

/** All published posts (no drafts), newest first. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("journal", ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function postUrl(post: Post): string {
  return `/journal/${post.id}/`;
}

/** For example "10 March 2027". */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** For the datetime attribute: "2027-03-10". */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
