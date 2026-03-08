/**
 * LeadershipTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as LeadershipApp } from '../../../leadership/src/App.js';
import { bootstrapMockEnvironment } from '../../../leadership/src/bootstrap.js';

let bootstrapped = false;

export function LeadershipTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <LeadershipApp />
    </div>
  );
}
