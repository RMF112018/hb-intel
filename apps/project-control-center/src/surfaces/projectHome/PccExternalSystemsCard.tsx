import type { FC } from 'react';
import { SAMPLE_EXTERNAL_SYSTEM_LINKS } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

function mappingTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'configured':
      return 'success';
    case 'not-configured':
      return 'warning';
    default:
      return 'neutral';
  }
}

function healthTone(status?: string): 'success' | 'warning' | 'danger' | 'neutral' {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'unreachable':
      return 'danger';
    default:
      return 'neutral';
  }
}

/**
 * Document Control boundary preserved: this card renders posture and
 * mapping/health metadata only. URLs from the fixture are intentionally
 * NOT rendered as <a href> launch links — Wave 2 has no live navigation.
 */
const ExternalSystemsBody: FC = () => (
  <ul className={styles.list} data-pcc-external-systems-body="">
    {SAMPLE_EXTERNAL_SYSTEM_LINKS.map((link) => (
      <li
        key={link.systemId}
        className={styles.listRow}
        data-pcc-external-system-id={link.systemId}
        data-pcc-external-system-posture={link.posture}
        data-pcc-external-system-mapping={link.mappingStatus}
      >
        <div className={styles.listRowMain}>
          <span className={styles.listRowTitle}>{link.systemId}</span>
          <span className={styles.listRowMeta}>
            <span>{link.posture}</span>
            {link.integrationHealthStatus ? (
              <span className={styles.listRowMetaSep}>{link.integrationHealthStatus}</span>
            ) : null}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--pcc-space-xs)', flexWrap: 'wrap' }}>
          <PccStatusPill tone={mappingTone(link.mappingStatus)}>{link.mappingStatus}</PccStatusPill>
          {link.integrationHealthStatus ? (
            <PccStatusPill tone={healthTone(link.integrationHealthStatus)}>
              {link.integrationHealthStatus}
            </PccStatusPill>
          ) : null}
        </div>
      </li>
    ))}
  </ul>
);

export const PccExternalSystemsCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard footprint="standard" eyebrow="Integrations" title="External Platforms">
    {state === 'preview' ? <ExternalSystemsBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccExternalSystemsCard;
