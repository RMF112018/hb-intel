/**
 * Track which editorial section is currently in view so the spine
 * can mark it active. Observes `id="section-<id>"` nodes via
 * IntersectionObserver and returns the topmost section whose marker
 * has crossed into the viewport's upper third.
 *
 * Falls back to the first section id when no sections are observed
 * yet (e.g. empty canvas) or when IntersectionObserver is unavailable
 * (SSR / older SharePoint host shells).
 */
import * as React from 'react';

export function useActiveSection(
  sectionIds: readonly string[],
): string | undefined {
  const [active, setActive] = React.useState<string | undefined>(
    sectionIds[0],
  );

  React.useEffect(() => {
    if (sectionIds.length === 0) return;
    if (typeof IntersectionObserver === 'undefined') {
      setActive(sectionIds[0]);
      return;
    }

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id.replace(/^section-/, '');
          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio);
          } else {
            visible.delete(id);
          }
        }
        if (visible.size === 0) return;
        // Pick the earliest section in declared order that is visible.
        const first = sectionIds.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    const nodes: Element[] = [];
    for (const id of sectionIds) {
      const node = document.getElementById(`section-${id}`);
      if (node) {
        observer.observe(node);
        nodes.push(node);
      }
    }

    return () => {
      observer.disconnect();
      nodes.length = 0;
    };
  }, [sectionIds]);

  return active;
}
