/**
 * ProjectHubTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as ProjectHubApp } from '../../../project-hub/src/App.js';
import { bootstrapMockEnvironment } from '../../../project-hub/src/bootstrap.js';

let bootstrapped = false;

export function ProjectHubTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <ProjectHubApp />
    </div>
  );
}
