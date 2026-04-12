/**
 * Host-chrome detection for the kudos composer flyout.
 *
 * Measures the bottom edge of persistent SharePoint host chrome
 * (suite bar) so the panel can offset below it. Returns 0 when not
 * running inside SharePoint or when the suite bar element is absent.
 */
import * as React from 'react';

function measureHostChromeTop(): number {
  if (typeof document === 'undefined') return 0;
  const suiteNav = document.getElementById('SuiteNavPlaceholder');
  if (suiteNav) return suiteNav.getBoundingClientRect().bottom;
  const suiteBarTop = document.getElementById('suiteBarTop');
  if (suiteBarTop) return suiteBarTop.getBoundingClientRect().bottom;
  return 0;
}

/**
 * Track SharePoint host chrome height while the flyout is active.
 * Re-measures on resize so the panel adapts if the suite bar reflows.
 */
export function useHostChromeOffset(active: boolean): number {
  const [offset, setOffset] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const measure = () => setOffset(measureHostChromeTop());
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active]);
  return offset;
}
