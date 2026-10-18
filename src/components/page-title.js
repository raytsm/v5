import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import site from '@lib/site';

const PageTitle = ({ title }) => (
  <Head>
    <title>{title ? `${title} | ${site.title}` : site.title}</title>
  </Head>
);

PageTitle.propTypes = {
  title: PropTypes.string,
};

export default PageTitle;
