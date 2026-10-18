import React from 'react';
import { viewBox, outline } from '@lib/logo.cjs';

const IconHex = () => (
  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox={viewBox}>
    <polygon
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      points={outline}
      fill="currentColor"
    />
  </svg>
);

export default IconHex;
