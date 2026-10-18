import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../styles/images.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(error => console.error('Offline worker:', error));
    } else {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.active?.scriptURL.endsWith('/sw.js')) registration.unregister();
        });
      });
    }
  }, []);

  const router = useRouter();
  const [pathname, hash = ''] = router.asPath.split('#');
  const location = {
    pathname: pathname.split('?')[0],
    hash: hash ? `#${hash}` : '',
  };

  return (
    <>
      <Component {...pageProps} location={location} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

App.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
