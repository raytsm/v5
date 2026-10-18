export { default } from '../../templates/blog-post';

export async function getStaticPaths() {
  const { getBlogPosts } = require('@lib/blog.cjs');
  const posts = getBlogPosts({ includeDrafts: process.env.NODE_ENV === 'development' });
  return {
    paths: posts.map(post => ({ params: { slug: post.slug } })),
    // Dev workers can cache the path list. Resolve newly written files on demand.
    fallback: process.env.NODE_ENV === 'development' ? 'blocking' : false,
  };
}

export async function getStaticProps({ params }) {
  const { getBlogPosts, getBlogPost } = require('@lib/blog.cjs');
  const options = { includeDrafts: process.env.NODE_ENV === 'development' };
  const post = await getBlogPost(params.slug, options);
  if (!post) return { notFound: true };
  const posts = getBlogPosts(options);
  const index = posts.findIndex(item => item.slug === post.slug);
  return { props: { post, previous: posts[index + 1] || null, next: posts[index - 1] || null } };
}
