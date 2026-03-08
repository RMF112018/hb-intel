/**
 * BusinessDevelopmentTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as BusinessDevelopmentApp } from '../../../business-development/src/App.js';
import { bootstrapMockEnvironment } from '../../../business-development/src/bootstrap.js';

let bootstrapped = false;

export function BusinessDevelopmentTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <BusinessDevelopmentApp />
    </div>
  );
}
