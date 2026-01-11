import type { CollectionEntry } from 'astro:content';

export const getPostSlug = (post: CollectionEntry<'posts'>) =>
  post.slug ?? post.id.replace(/\.mdx?$/, '');

export const getPostSlugSegments = (post: CollectionEntry<'posts'>) =>
  getPostSlug(post).split('/');
