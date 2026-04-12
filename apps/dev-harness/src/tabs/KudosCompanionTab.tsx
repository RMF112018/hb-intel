/**
 * Dev-harness Kudos companion tab — phase-16a/02.
 *
 * Mounts the real `HbKudosCompanion` component under
 * `?tab=kudos-companion` against the harness data adapter.
 */
import { useEffect, useState } from 'react';
import { HbKudosCompanion } from '../../../hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.js';
import { installKudosHarness } from '../harness/kudosHarness.js';
import { usePreviewShellStyles } from './usePreviewShellStyles.js';

// Install before HbKudosCompanion renders so its data hooks are
// intercepted from the first render.
installKudosHarness();

export function KudosCompanionTab(): React.ReactNode {
  const styles = usePreviewShellStyles();
  const [seedTick, setSeedTick] = useState(0);

  useEffect(() => {
    const handler = (): void => setSeedTick((n) => n + 1);
    window.addEventListener('hb-kudos-seeded', handler);
    return () => window.removeEventListener('hb-kudos-seeded', handler);
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <HbKudosCompanion
        key={seedTick}
        config={{ simulatedRole: 'admin' }}
        identity={{
          displayName: 'Harness Admin',
          email: 'user-admin@harness.local',
        }}
        nowIso={new Date().toISOString()}
      />
    </div>
  );
}
