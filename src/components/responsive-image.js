import React from 'react';
import PropTypes from 'prop-types';

// Keep the existing image geometry and CSS hooks while serving framework-independent assets.
export default function ResponsiveImage({ image, alt, className = '' }) {
  if (!image) {
    return null;
  }

  const { width, height, images, backgroundColor, placeholder } = image;
  const spacer = `data:image/svg+xml;charset=utf-8,%3Csvg height='${height}' width='${width}' xmlns='http://www.w3.org/2000/svg' version='1.1'%3E%3C/svg%3E`;

  return (
    <div className={`gatsby-image-wrapper gatsby-image-wrapper-constrained ${className}`}>
      <div style={{ maxWidth: width, display: 'block' }}>
        <img
          alt=""
          role="presentation"
          aria-hidden="true"
          src={spacer}
          style={{ maxWidth: '100%', display: 'block', position: 'static' }}
        />
      </div>
      {placeholder?.fallback ? (
        <img
          aria-hidden="true"
          data-placeholder-image=""
          src={placeholder.fallback}
          alt=""
          style={{ opacity: 0, transition: 'opacity 500ms linear', objectFit: 'cover' }}
        />
      ) : backgroundColor ? (
        <div
          aria-hidden="true"
          data-placeholder-image=""
          style={{
            opacity: 0,
            transition: 'opacity 500ms linear',
            backgroundColor,
            position: 'absolute',
            inset: 0,
            objectFit: 'cover',
          }}
        />
      ) : null}
      <picture>
        {images.sources?.map(source => (
          <source key={source.type} {...source} />
        ))}
        <img
          {...images.fallback}
          width={width}
          height={height}
          alt={alt}
          loading="eager"
          decoding="async"
          data-main-image=""
          style={{ objectFit: 'cover', opacity: 1 }}
        />
      </picture>
    </div>
  );
}

ResponsiveImage.propTypes = {
  image: PropTypes.object,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
};
