/**
 * AccountingTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as AccountingApp } from '../../../accounting/src/App.js';
import { bootstrapMockEnvironment } from '../../../accounting/src/bootstrap.js';

let bootstrapped = false;

export function AccountingTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <AccountingApp />
    </div>
  );
}
