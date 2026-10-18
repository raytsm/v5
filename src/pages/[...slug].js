export { default } from '../templates/post';

export async function getStaticPaths() {
  const { getCollection } = require('@lib/content.cjs');
  const posts = await getCollection('posts');
  return {
    paths: posts.map(node => ({
      params: { slug: node.frontmatter.slug.split('/').filter(Boolean) },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { getCollection } = require('@lib/content.cjs');
  const slug = `/${params.slug.join('/')}`;
  const post = (await getCollection('posts')).find(
    node => node.frontmatter.slug.replace(/\/$/, '') === slug,
  );
  return post ? { props: { data: { markdownRemark: post } } } : { notFound: true };
}
