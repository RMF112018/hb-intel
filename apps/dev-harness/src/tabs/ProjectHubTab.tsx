/**
 * ProjectHubTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as ProjectHubApp } from '../../../project-hub/src/App.js';
import { bootstrapMockEnvironment } from '../../../project-hub/src/bootstrap.js';
import { usePreviewShellStyles } from './usePreviewShellStyles.js';

let bootstrapped = false;

export function ProjectHubTab(): React.ReactNode {
  const styles = usePreviewShellStyles();

  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <ProjectHubApp />
    </div>
  );
}
