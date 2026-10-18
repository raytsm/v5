import React from 'react';
import styled, { keyframes } from 'styled-components';
import { viewBox, outline, fragments } from '@lib/logo.cjs';

const draw = keyframes`
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
`;

const breathe = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.65; }
`;

const StyledLogo = styled.svg`
  color: var(--green);
  overflow: visible;

  .logo-outline {
    fill: var(--logo-fill, var(--navy));
  }

  .honeycomb-fragment {
    opacity: 0.5;
  }

  @media (prefers-reduced-motion: no-preference) {
    .logo-outline {
      stroke-dasharray: 1;
      animation: ${draw} 1s ease-in-out both;
    }

    .honeycomb-fragment {
      stroke-dasharray: 1;
      animation: ${draw} 1.2s ease-in-out 0.3s both, ${breathe} 7s ease-in-out 1.5s infinite;

      &:last-child {
        animation-delay: 0.55s, 2.5s;
      }
    }
  }
`;

const IconLogo = () => (
  <StyledLogo
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Roshan Thapa logo"
    viewBox={viewBox}>
    <title>Roshan Thapa logo</title>
    <polygon
      className="logo-outline"
      points={outline}
      pathLength="1"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round">
      {fragments.map((fragment, i) => (
        <path key={i} className="honeycomb-fragment" d={fragment} pathLength="1" />
      ))}
    </g>
  </StyledLogo>
);

export default IconLogo;
