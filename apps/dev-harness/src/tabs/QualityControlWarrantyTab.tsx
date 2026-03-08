/**
 * QualityControlWarrantyTab — Direct-import SPFx webpart preview.
 * @decision D-PH7-BW-8
 */
import { useEffect } from 'react';
import { App as QualityControlWarrantyApp } from '../../../quality-control-warranty/src/App.js';
import { bootstrapMockEnvironment } from '../../../quality-control-warranty/src/bootstrap.js';

let bootstrapped = false;

export function QualityControlWarrantyTab(): React.ReactNode {
  useEffect(() => {
    if (!bootstrapped) {
      bootstrapMockEnvironment();
      bootstrapped = true;
    }
  }, []);

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <QualityControlWarrantyApp />
    </div>
  );
}
