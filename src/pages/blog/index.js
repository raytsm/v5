import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Layout from '@components/layout';
import SiteHead from '@components/head';
import BlogMeta from '@components/blog/meta';
import { IconBookmark } from '@components/icons';

const StyledMain = styled.main`
  max-width: 1240px;
  padding: 170px 60px 120px;

  @media (max-width: 768px) {
    padding: 140px 40px 100px;
  }

  @media (max-width: 480px) {
    padding: 120px 24px 80px;
  }

  > header {
    margin-bottom: 60px;

    .overline {
      margin: 0 0 20px;
    }

    h1 {
      margin-bottom: 20px;
    }

    .intro {
      max-width: 580px;
      color: var(--light-slate);
      font-size: var(--fz-xxl);
      line-height: 1.5;
    }
  }

  .preview-note {
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }

  .empty {
    padding: 70px 20px;
    text-align: center;
    border: 1px solid var(--lightest-navy);
    border-radius: var(--border-radius);

    h2 {
      color: var(--lightest-slate);
    }
    p {
      color: var(--light-slate);
    }
    button {
      ${({ theme }) => theme.mixins.smallButton};
      margin-top: 15px;
    }
  }
`;

const StyledFilters = styled.div`
  margin-bottom: 35px;

  label {
    display: block;
    margin-bottom: 12px;
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }

  input {
    width: 100%;
    padding: 15px 18px;
    color: var(--lightest-slate);
    background: var(--light-navy);
    border: 1px solid var(--lightest-navy);
    border-radius: var(--border-radius);
    font-size: var(--fz-lg);

    &::placeholder {
      color: var(--slate);
    }
    &:focus-visible {
      border-color: var(--green);
    }
  }

  .topics {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 20px 0;

    button {
      padding: 9px 13px;
      color: var(--light-slate);
      background: transparent;
      border: 1px solid var(--lightest-navy);
      border-radius: var(--border-radius);
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);

      &[aria-pressed='true'],
      &:hover,
      &:focus-visible {
        color: var(--green);
        border-color: var(--green);
        background: var(--green-tint);
      }
    }
  }

  .count {
    margin: 25px 0 0;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
  }
`;

const StyledGrid = styled.ul`
  ${({ theme }) => theme.mixins.resetList};
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 650px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const StyledCard = styled.li`
  ${({ theme }) => theme.mixins.boxShadow};
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 32px;
  border-radius: var(--border-radius);
  background: var(--light-navy);

  @media (prefers-reduced-motion: no-preference) {
    transition: var(--transition);
    &:hover,
    &:focus-within {
      transform: translateY(-5px);
    }
  }

  .post-icon {
    margin-bottom: 28px;
    color: var(--green);
    svg {
      width: 32px;
      height: 32px;
    }
  }

  h2 {
    margin: 0 0 14px;
    color: var(--lightest-slate);
    font-size: 28px;
    line-height: 1.15;

    a::before {
      content: '';
      position: absolute;
      inset: 0;
    }
  }

  .description {
    margin-bottom: 28px;
    color: var(--light-slate);
    font-size: var(--fz-lg);
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  footer {
    margin-top: auto;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 15px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);

    a {
      position: relative;
      z-index: 1;
    }
  }
`;

const BlogPage = ({ location, posts }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  useEffect(() => {
    setActiveTag(typeof router.query.tag === 'string' ? router.query.tag : '');
  }, [router.query.tag]);

  const tags = [...new Set(posts.flatMap(post => post.tags))].sort((a, b) =>
    a.localeCompare(b, 'en'),
  );
  const query = search.trim().toLowerCase();
  const visiblePosts = posts.filter(
    post =>
      (!activeTag || post.tags.includes(activeTag)) &&
      `${post.title} ${post.description} ${post.tags.join(' ')}`.toLowerCase().includes(query),
  );
  const changeTag = tag => {
    setActiveTag(tag);
    router.replace({ pathname: '/blog/', query: tag ? { tag } : {} }, undefined, {
      shallow: true,
      scroll: false,
    });
  };
  const reset = () => {
    setSearch('');
    changeTag('');
  };

  return (
    <Layout location={location}>
      <SiteHead
        title="Blog"
        description="Notes on data engineering, machine learning, and the things I’m building."
      />
      <StyledMain>
        <header>
          <p className="overline">Thoughts &amp; notes</p>
          <h1 className="big-heading">Blog.</h1>
          <p className="intro">
            Notes on data engineering, machine learning, and the things I’m building.
          </p>
          {posts.some(post => post.draft) && (
            <p className="preview-note">Local preview includes unpublished drafts.</p>
          )}
        </header>

        {posts.length > 0 && (
          <StyledFilters>
            <label htmlFor="blog-search">Search posts</label>
            <input
              id="blog-search"
              type="search"
              placeholder="Search by title, topic, or tag…"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
            <div className="topics" role="group" aria-label="Filter posts by topic">
              <button type="button" aria-pressed={!activeTag} onClick={() => changeTag('')}>
                All posts
              </button>
              {tags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={activeTag === tag}
                  onClick={() => changeTag(tag)}>
                  {tag}
                </button>
              ))}
            </div>
            <p className="count" role="status">
              {visiblePosts.length} {visiblePosts.length === 1 ? 'post' : 'posts'}
            </p>
          </StyledFilters>
        )}

        {visiblePosts.length > 0 ? (
          <StyledGrid aria-label="Blog posts">
            {visiblePosts.map(post => (
              <StyledCard key={post.slug}>
                <div className="post-icon" aria-hidden="true">
                  <IconBookmark />
                </div>
                <h2>
                  <Link href={post.url}>{post.title}</Link>
                </h2>
                <p className="description">{post.description}</p>
                <footer>
                  <BlogMeta date={post.date} readingTime={post.readingTime} draft={post.draft} />
                  <div className="tags">
                    {post.tags.map(tag => (
                      <Link
                        key={tag}
                        href={`/blog/?tag=${encodeURIComponent(tag)}`}
                        className="inline-link">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </footer>
              </StyledCard>
            ))}
          </StyledGrid>
        ) : (
          <div className="empty">
            <h2>{posts.length ? 'No matching posts' : 'More to come.'}</h2>
            <p>
              {posts.length
                ? 'Try another search or explore a different topic.'
                : 'New notes will appear here soon.'}
            </p>
            {posts.length > 0 && (
              <button type="button" onClick={reset}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </StyledMain>
    </Layout>
  );
};

BlogPage.propTypes = {
  location: PropTypes.object.isRequired,
  posts: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default BlogPage;

export async function getStaticProps() {
  const { getBlogPosts } = require('@lib/blog.cjs');
  return {
    props: { posts: getBlogPosts({ includeDrafts: process.env.NODE_ENV === 'development' }) },
  };
}
