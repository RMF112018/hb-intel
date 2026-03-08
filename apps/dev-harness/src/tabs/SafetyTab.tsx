/**
 * SafetyTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as SafetyApp } from '../../../safety/src/App.js';
import { bootstrapMockEnvironment } from '../../../safety/src/bootstrap.js';

let bootstrapped = false;

export function SafetyTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <SafetyApp />
    </div>
  );
}
