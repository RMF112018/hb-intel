/**
 * HumanResourcesTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as HumanResourcesApp } from '../../../human-resources/src/App.js';
import { bootstrapMockEnvironment } from '../../../human-resources/src/bootstrap.js';

let bootstrapped = false;

export function HumanResourcesTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <HumanResourcesApp />
    </div>
  );
}
