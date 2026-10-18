import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: no-preference)';

const subscribe = callback => {
  const query = window.matchMedia(QUERY);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};

const getSnapshot = () => !window.matchMedia(QUERY).matches;
const getServerSnapshot = () => true;

export default function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
