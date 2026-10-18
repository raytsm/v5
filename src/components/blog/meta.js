import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: var(--slate);
  font-family: var(--font-mono);
  font-size: var(--fz-xxs);
  line-height: 1.75;

  .draft {
    padding: 1px 7px;
    border: 1px solid var(--green);
    border-radius: var(--border-radius);
    color: var(--green);
  }
`;

const BlogMeta = ({ date, readingTime, draft = false }) => (
  <StyledMeta>
    <time dateTime={date}>
      {new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}
    </time>
    <span aria-hidden="true">·</span>
    <span>{readingTime} min read</span>
    {draft && <span className="draft">Draft</span>}
  </StyledMeta>
);

BlogMeta.propTypes = {
  date: PropTypes.string.isRequired,
  readingTime: PropTypes.number.isRequired,
  draft: PropTypes.bool,
};

export default BlogMeta;
