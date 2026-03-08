/**
 * RiskManagementTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as RiskManagementApp } from '../../../risk-management/src/App.js';
import { bootstrapMockEnvironment } from '../../../risk-management/src/bootstrap.js';

let bootstrapped = false;

export function RiskManagementTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <RiskManagementApp />
    </div>
  );
}
