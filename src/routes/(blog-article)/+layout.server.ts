import { filteredPosts } from '$lib/data/blog-posts';

export async function load({ url }: { url: { pathname: string } }) {
  const { pathname } = url;
  const slug = pathname.replace(/^\/|\/$/g, ''); // Remove leading and trailing slashes

  console.log('=== DEBUG ===');
  console.log('Pathname:', pathname);
  console.log('Slug:', slug);
  console.log('Total posts found:', filteredPosts.length);
  console.log('Available slugs:', filteredPosts.map(p => p.slug));

  const post = filteredPosts.find((post) => post.slug === slug);
  console.log('Post found:', !!post);
  console.log('=============');

  return {
    post
  };
}
