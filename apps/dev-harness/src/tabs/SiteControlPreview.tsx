/**
 * SiteControlPreview — Mobile viewport wrapper (max-width 428px).
 * Foundation Plan Phase 3.
 */
import { useEffect } from 'react';
import { ShellLayout, useNavStore } from '@hbc/shell';
import { WorkspacePlaceholder } from '../pages/WorkspacePlaceholder.js';

export function SiteControlPreview() {
  const setActiveWorkspace = useNavStore((s) => s.setActiveWorkspace);

  useEffect(() => {
    setActiveWorkspace('site-control');
  }, [setActiveWorkspace]);

  return (
    <div className="harness-mobile-viewport">
      <ShellLayout mode="simplified">
        <WorkspacePlaceholder workspaceId="site-control" />
      </ShellLayout>
    </div>
  );
}
