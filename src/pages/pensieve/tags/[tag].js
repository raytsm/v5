export { default } from '../../../templates/tag';

export async function getStaticPaths() {
  const { getTagGroups } = require('@lib/content.cjs');
  const tags = await getTagGroups({ includeDrafts: true });
  return { paths: tags.map(tag => ({ params: { tag: tag.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const { getCollection, getTagGroups, edges } = require('@lib/content.cjs');
  const tag = (await getTagGroups({ includeDrafts: true })).find(item => item.slug === params.tag);
  if (!tag) return { notFound: true };
  const posts = (await getCollection('posts')).filter(node =>
    node.frontmatter.tags?.includes(tag.fieldValue),
  );
  return {
    props: {
      pageContext: { tag: tag.fieldValue },
      data: { allMarkdownRemark: { ...edges(posts), totalCount: posts.length } },
    },
  };
}
