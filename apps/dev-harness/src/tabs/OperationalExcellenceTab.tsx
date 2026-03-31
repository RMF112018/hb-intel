/**
 * OperationalExcellenceTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as OperationalExcellenceApp } from '../../../operational-excellence/src/App.js';
import { bootstrapMockEnvironment } from '../../../operational-excellence/src/bootstrap.js';
import { usePreviewShellStyles } from './usePreviewShellStyles.js';

let bootstrapped = false;

export function OperationalExcellenceTab(): React.ReactNode {
  const styles = usePreviewShellStyles();

  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <OperationalExcellenceApp />
    </div>
  );
}
