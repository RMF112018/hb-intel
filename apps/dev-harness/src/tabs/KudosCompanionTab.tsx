/**
 * Dev-harness Kudos companion tab — phase-16a/02.
 *
 * Mounts the real `HbKudosCompanion` component under
 * `?tab=kudos-companion` against the harness data adapter.
 */
import { useEffect } from 'react';
import { HbKudosCompanion } from '../../../hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.js';
import { installKudosHarness } from '../harness/kudosHarness.js';
import { usePreviewShellStyles } from './usePreviewShellStyles.js';

export function KudosCompanionTab(): React.ReactNode {
  const styles = usePreviewShellStyles();

  useEffect(() => {
    installKudosHarness();
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <HbKudosCompanion
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
