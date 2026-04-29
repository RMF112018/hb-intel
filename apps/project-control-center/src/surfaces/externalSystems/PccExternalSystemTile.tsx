import type { FC } from 'react';
import {
  EXTERNAL_SYSTEM_CATALOG,
  SAMPLE_EXTERNAL_SYSTEM_LINKS,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  type ExternalSystemId,
  type IExternalSystemLink,
  type IExternalSystemMissingConfig,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from '../projectHome/shared';
import styles from './PccExternalSystemsSurface.module.css';

export type PccExternalSystemState = 'configured' | 'missing' | 'unavailable-fixture';

function resolveSystemState(systemId: ExternalSystemId): {
  state: PccExternalSystemState;
  link?: IExternalSystemLink;
  missing?: IExternalSystemMissingConfig;
} {
  const link = SAMPLE_EXTERNAL_SYSTEM_LINKS.find((l) => l.systemId === systemId);
  if (link) return { state: 'configured', link };
  const missing = SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS.find((m) => m.systemId === systemId);
  if (missing) return { state: 'missing', missing };
  return { state: 'unavailable-fixture' };
}

function severityTone(severity: string): 'info' | 'warning' | 'danger' | 'neutral' {
  switch (severity) {
    case 'Blocking':
    case 'Security Risk':
    case 'Repair Required':
      return 'danger';
    case 'Warning':
      return 'warning';
    case 'Info':
      return 'info';
    default:
      return 'neutral';
  }
}

export interface PccExternalSystemTileProps extends PccProjectHomeCardProps {
  systemId: ExternalSystemId;
}

export const PccExternalSystemTile: FC<PccExternalSystemTileProps> = ({
  systemId,
  state: cardState = 'preview',
}) => {
  const entry = EXTERNAL_SYSTEM_CATALOG[systemId];
  const resolved = resolveSystemState(systemId);

  if (cardState !== 'preview') {
    return (
      <PccDashboardCard footprint="standard" eyebrow="External System" title={entry.displayName}>
        <div data-pcc-external-system-id={systemId} data-pcc-external-system-state={resolved.state}>
          <PccPreviewState state={cardState} />
        </div>
      </PccDashboardCard>
    );
  }

  const body = (() => {
    if (resolved.state === 'configured' && resolved.link) {
      return (
        <div className={styles.body}>
          <span className={styles.metaRow}>
            <PccStatusPill tone="success" filled>
              configured
            </PccStatusPill>
            {resolved.link.integrationHealthStatus ? (
              <PccStatusPill tone={resolved.link.integrationHealthStatus === 'healthy' ? 'success' : 'warning'}>
                {resolved.link.integrationHealthStatus}
              </PccStatusPill>
            ) : null}
          </span>
          <span className={styles.message}>Mapping status: {resolved.link.mappingStatus}</span>
          <span className={styles.previewCue}>Preview · launch link not active</span>
        </div>
      );
    }
    if (resolved.state === 'missing' && resolved.missing) {
      return (
        <div className={styles.body}>
          <span className={styles.metaRow}>
            <PccStatusPill tone={severityTone(resolved.missing.severity)} filled>
              missing config
            </PccStatusPill>
          </span>
          <span className={styles.message}>{resolved.missing.message}</span>
          <span className={styles.metaRow}>
            <span>Required before: {resolved.missing.requiredBefore}</span>
          </span>
          <span className={styles.metaRow}>
            <span>Owner: {resolved.missing.ownerPersona}</span>
          </span>
        </div>
      );
    }
    return (
      <div className={styles.body}>
        <PccPreviewState state="unavailable-fixture" />
      </div>
    );
  })();

  return (
    <PccDashboardCard
      footprint="standard"
      eyebrow={entry.posture}
      title={entry.displayName}
    >
      <div
        data-pcc-external-system-id={systemId}
        data-pcc-external-system-state={resolved.state}
        data-pcc-external-system-posture={entry.posture}
      >
        {body}
      </div>
    </PccDashboardCard>
  );
};

export default PccExternalSystemTile;
