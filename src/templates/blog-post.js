import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Layout from '@components/layout';
import SiteHead from '@components/head';
import BlogMeta from '@components/blog/meta';

const StyledPost = styled.main`
  max-width: 1000px;
  padding: 170px 80px 120px;
  overflow-wrap: anywhere;

  @media (max-width: 768px) {
    padding: 140px 40px 100px;
  }

  @media (max-width: 480px) {
    padding: 120px 24px 80px;
  }

  > header {
    margin-bottom: 50px;
    h1 {
      margin: 20px 0;
      font-size: clamp(36px, 5vw, 60px);
      line-height: 1.05;
    }
    .description {
      margin: 24px 0;
      color: var(--light-slate);
      font-size: var(--fz-xxl);
      line-height: 1.5;
    }
    .draft-note {
      padding: 15px;
      border: 1px solid var(--green);
      color: var(--green);
      font-family: var(--font-mono);
      font-size: var(--fz-xs);
      line-height: 1.6;
    }
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin: 24px 0;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }

  .post-navigation {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin-top: 70px;
    padding-top: 30px;
    border-top: 1px solid var(--lightest-navy);
    a {
      padding: 20px;
      border-radius: var(--border-radius);
      background: var(--light-navy);
      color: var(--lightest-slate);
      &:hover,
      &:focus-visible {
        color: var(--green);
      }
    }
    span {
      display: block;
      margin-bottom: 12px;
      color: var(--slate);
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
    }
    @media (max-width: 480px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }
`;

const StyledProse = styled.div`
  color: var(--light-slate);
  font-size: 22px;
  line-height: 1.75;

  @media (max-width: 768px) {
    font-size: var(--fz-xl);
  }

  > :first-child {
    margin-top: 0;
  }
  p,
  ul,
  ol,
  blockquote {
    margin: 1.15em 0;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1.6em 0 0.65em;
    color: var(--lightest-slate);
    line-height: 1.2;
    scroll-margin-top: 100px;
  }
  h2 {
    font-size: 32px;
  }
  h3 {
    font-size: 26px;
  }
  ul,
  ol {
    padding-left: 26px;
  }
  li {
    padding-left: 4px;
    margin: 8px 0;
  }
  a {
    ${({ theme }) => theme.mixins.inlineLink};
  }
  img {
    border-radius: var(--border-radius);
  }
  blockquote {
    padding: 15px 25px;
    border-left: 2px solid var(--green);
    background: var(--green-tint);
    p {
      margin: 0;
    }
  }
  code {
    padding: 0.2em 0.4em;
    border-radius: var(--border-radius);
    background: var(--lightest-navy);
    color: var(--lightest-slate);
    font-family: var(--font-mono);
    font-size: 0.75em;
  }
  pre code {
    padding: 0;
    background: transparent;
  }
  table {
    display: block;
    max-width: 100%;
    margin: 2em 0;
    overflow-x: auto;
    border-collapse: collapse;
    font-size: var(--fz-lg);
  }
  th,
  td {
    padding: 12px 16px;
    border: 1px solid var(--lightest-navy);
    text-align: left;
  }
  th {
    color: var(--lightest-slate);
    background: var(--light-navy);
  }
  hr {
    margin: 3em 0;
    border: 0;
    border-top: 1px solid var(--lightest-navy);
  }
`;

const BlogPost = ({ location, post, previous, next }) => (
  <Layout location={location}>
    <SiteHead title={post.title} description={post.description} />
    <StyledPost>
      <Link className="breadcrumb" href="/blog/">
        <span className="arrow" aria-hidden="true">
          &larr;
        </span>
        All posts
      </Link>
      <header>
        {post.draft && (
          <p className="draft-note">
            Draft preview — this post is excluded from the production site.
          </p>
        )}
        <h1>{post.title}</h1>
        <BlogMeta date={post.date} readingTime={post.readingTime} draft={post.draft} />
        <p className="description">{post.description}</p>
        <div className="tags">
          {post.tags.map(tag => (
            <Link key={tag} href={`/blog/?tag=${encodeURIComponent(tag)}`} className="inline-link">
              #{tag}
            </Link>
          ))}
        </div>
      </header>
      <StyledProse className="blog-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      {(previous || next) && (
        <nav className="post-navigation" aria-label="More posts">
          {previous && (
            <Link href={previous.url}>
              <span>← Older post</span>
              {previous.title}
            </Link>
          )}
          {next && (
            <Link href={next.url}>
              <span>Newer post →</span>
              {next.title}
            </Link>
          )}
        </nav>
      )}
    </StyledPost>
  </Layout>
);

BlogPost.propTypes = {
  location: PropTypes.object.isRequired,
  post: PropTypes.object.isRequired,
  previous: PropTypes.object,
  next: PropTypes.object,
};

export default BlogPost;
