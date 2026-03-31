/**
 * LeadershipTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as LeadershipApp } from '../../../leadership/src/App.js';
import { bootstrapMockEnvironment } from '../../../leadership/src/bootstrap.js';
import { usePreviewShellStyles } from './usePreviewShellStyles.js';

let bootstrapped = false;

export function LeadershipTab(): React.ReactNode {
  const styles = usePreviewShellStyles();

  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <LeadershipApp />
    </div>
  );
}
