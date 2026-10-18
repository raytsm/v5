import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import anime from 'animejs';
import styled from 'styled-components';
import { IconLoader } from '@components/icons';

const StyledLoader = styled.div`
  ${({ theme }) => theme.mixins.flexCenter};
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: var(--dark-navy);
  color: var(--green);
  --logo-fill: var(--dark-navy);
  z-index: 99;

  .logo-wrapper {
    width: 116px;
    transition: var(--transition);
    opacity: ${props => (props.isMounted ? 1 : 0)};
    svg {
      display: block;
      width: 100%;
      height: 100%;
      margin: 0 auto;
      fill: none;
      user-select: none;
    }
  }
`;

const Loader = ({ finishLoading }) => {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);

  const animate = container => {
    const loader = anime.timeline({
      complete: () => finishLoading(),
    });

    loader
      .add({
        targets: container.querySelector('svg'),
        delay: 2600,
        duration: 300,
        easing: 'easeInOutQuart',
        opacity: 0,
        scale: 0.1,
      })
      .add({
        targets: container,
        duration: 200,
        easing: 'easeInOutQuart',
        opacity: 0,
        zIndex: -1,
      });

    return loader;
  };

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishLoading();
      return;
    }

    document.body.classList.add('hidden');
    const timeout = setTimeout(() => setIsMounted(true), 10);
    const animation = animate(containerRef.current);
    return () => {
      clearTimeout(timeout);
      animation.pause();
      document.body.classList.remove('hidden');
    };
  }, []);

  return (
    <StyledLoader className="loader" isMounted={isMounted} ref={containerRef}>
      <div className="logo-wrapper">
        <IconLoader />
      </div>
    </StyledLoader>
  );
};

Loader.propTypes = {
  finishLoading: PropTypes.func.isRequired,
};

export default Loader;
