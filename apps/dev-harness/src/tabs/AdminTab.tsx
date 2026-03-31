/**
 * AdminTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as AdminApp } from '../../../admin/src/App.js';
import { bootstrapMockEnvironment } from '../../../admin/src/bootstrap.js';
import { usePreviewShellStyles } from './usePreviewShellStyles.js';

let bootstrapped = false;

export function AdminTab(): React.ReactNode {
  const styles = usePreviewShellStyles();

  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <AdminApp />
    </div>
  );
}
