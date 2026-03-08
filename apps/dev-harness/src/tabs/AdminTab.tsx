/**
 * AdminTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as AdminApp } from '../../../admin/src/App.js';
import { bootstrapMockEnvironment } from '../../../admin/src/bootstrap.js';

let bootstrapped = false;

export function AdminTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <AdminApp />
    </div>
  );
}
