/**
 * Dev-harness Kudos tab — phase-16a/02.
 *
 * Mounts the real `HbKudos` component under `?tab=kudos`. Data
 * transport is served by the harness adapter (see
 * `../harness/kudosHarness.ts`), so the runtime seams above the
 * `fetch` boundary are exercised exactly as in production.
 */
import { useEffect, useState } from 'react';
import { HbKudos } from '../../../hb-webparts/src/webparts/hbKudos/HbKudos.js';
import { installKudosHarness } from '../harness/kudosHarness.js';
import { usePreviewShellStyles } from './usePreviewShellStyles.js';

// Install before HbKudos renders so usePeopleCultureData's initial
// fetch is intercepted against the seeded store, not the real
// HBCentral URL baked into getKudosListHostUrl().
installKudosHarness();

export function KudosTab(): React.ReactNode {
  const styles = usePreviewShellStyles();
  const [seedTick, setSeedTick] = useState(0);

  useEffect(() => {
    const handler = (): void => setSeedTick((n) => n + 1);
    window.addEventListener('hb-kudos-seeded', handler);
    return () => window.removeEventListener('hb-kudos-seeded', handler);
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <HbKudos
        key={seedTick}
        identity={{
          displayName: 'Harness Viewer',
          email: 'user-unrelated@harness.local',
        }}
        getGraphToken={async () => 'harness-graph-token'}
      />
    </div>
  );
}
