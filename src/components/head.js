import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { useRouter } from 'next/router';
import site from '@lib/site';

const SiteHead = ({ title, description, image }) => {
  const { asPath } = useRouter();
  const seo = {
    title: title || site.title,
    description: description || site.description,
    image: `${site.siteUrl}${image || site.image}`,
    url: `${site.siteUrl}${asPath.split(/[?#]/)[0]}`,
  };

  return (
    <Head>
      <title>{title ? `${title} | ${site.title}` : site.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={site.twitterUsername} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="google-site-verification" content="DCl7VAf9tcz6eD9gb67NfkNnJ1PKRNcg8qQiwpbx9Lk" />
    </Head>
  );
};

SiteHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
};

export default SiteHead;
