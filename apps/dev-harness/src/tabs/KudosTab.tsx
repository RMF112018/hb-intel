/**
 * Dev-harness Kudos tab — phase-16a/02.
 *
 * Mounts the real `HbKudos` component under `?tab=kudos`. Data
 * transport is served by the harness adapter (see
 * `../harness/kudosHarness.ts`), so the runtime seams above the
 * `fetch` boundary are exercised exactly as in production.
 */
import { useEffect } from 'react';
import { HbKudos } from '../../../hb-webparts/src/webparts/hbKudos/HbKudos.js';
import { installKudosHarness } from '../harness/kudosHarness.js';
import { usePreviewShellStyles } from './usePreviewShellStyles.js';

export function KudosTab(): React.ReactNode {
  const styles = usePreviewShellStyles();

  useEffect(() => {
    installKudosHarness();
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <HbKudos
        identity={{
          displayName: 'Harness Viewer',
          email: 'user-unrelated@harness.local',
        }}
        getGraphToken={async () => 'harness-graph-token'}
      />
    </div>
  );
}
