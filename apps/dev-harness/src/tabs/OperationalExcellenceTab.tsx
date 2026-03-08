/**
 * OperationalExcellenceTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as OperationalExcellenceApp } from '../../../operational-excellence/src/App.js';
import { bootstrapMockEnvironment } from '../../../operational-excellence/src/bootstrap.js';

let bootstrapped = false;

export function OperationalExcellenceTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <OperationalExcellenceApp />
    </div>
  );
}
