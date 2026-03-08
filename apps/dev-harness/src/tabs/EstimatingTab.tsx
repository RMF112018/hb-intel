/**
 * EstimatingTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as EstimatingApp } from '../../../estimating/src/App.js';
import { bootstrapMockEnvironment } from '../../../estimating/src/bootstrap.js';

let bootstrapped = false;

export function EstimatingTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <EstimatingApp />
    </div>
  );
}
