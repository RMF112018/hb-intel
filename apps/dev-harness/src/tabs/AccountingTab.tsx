/**
 * AccountingTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as AccountingApp } from '../../../accounting/src/App.js';
import { bootstrapMockEnvironment } from '../../../accounting/src/bootstrap.js';
import { usePreviewShellStyles } from './usePreviewShellStyles.js';

let bootstrapped = false;

export function AccountingTab(): React.ReactNode {
  const styles = usePreviewShellStyles();

  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <AccountingApp />
    </div>
  );
}
