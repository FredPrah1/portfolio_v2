import { useEffect } from 'react';

/**
 * Adds the 'visible' class to any .reveal element once it scrolls into view.
 * Re-runs whenever `deps` changes (e.g. after data loads and new .reveal
 * elements are added to the DOM).
 */
export function useReveal(deps = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal:not(.visible)').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
