import { useEffect, useMemo, useState } from 'react';
import type {
  MyProjectLinksReadModel,
  MyWorkReadModelEnvelope,
  MyWorkReadModelSourceStatus,
} from '@hbc/models/myWork';
import { createMyWorkReadModelClient } from '../../api/myWorkReadModelClientFactory.js';
import { MyWorkCard } from '../../layout/MyWorkCard.js';
import styles from './MyProjectsHomeCard.module.css';

export interface MyProjectsHomeCardProps {
  readonly getApiToken?: () => Promise<string>;
}

interface MetricVm {
  readonly assignedProjectCount: number;
  readonly dualLaunchReadyCount: number;
  readonly sharePointReadyCount: number;
  readonly procoreReadyCount: number;
}

const EMPTY_METRICS: MetricVm = Object.freeze({
  assignedProjectCount: 0,
  dualLaunchReadyCount: 0,
  sharePointReadyCount: 0,
  procoreReadyCount: 0,
});

const EMPTY_ITEMS: readonly unknown[] = Object.freeze([]);

function selectBannerText(
  sourceStatus: MyWorkReadModelSourceStatus,
  warningCodes: readonly string[],
): string | null {
  if (sourceStatus === 'backend-unavailable') {
    return 'Project links are using fallback data while backend access is unavailable.';
  }
  if (sourceStatus === 'principal-unresolved') {
    return 'We could not resolve your user principal for project assignments.';
  }
  if (sourceStatus === 'partial' || sourceStatus === 'source-unavailable') {
    return 'Project sources returned partial or unavailable data. Some launches may be missing.';
  }
  if (warningCodes.includes('assignment-source-bounded')) {
    return 'Project source reads are bounded in this view; some assignments may be omitted.';
  }
  return null;
}

export function MyProjectsHomeCard({ getApiToken }: MyProjectsHomeCardProps) {
  const client = useMemo(() => createMyWorkReadModelClient({ getApiToken }), [getApiToken]);
  const [isLoading, setIsLoading] = useState(true);
  const [envelope, setEnvelope] = useState<MyWorkReadModelEnvelope<MyProjectLinksReadModel> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void client
      .getMyProjectLinks()
      .then((result) => {
        if (!cancelled) {
          setEnvelope(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEnvelope(null);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const sourceStatus: MyWorkReadModelSourceStatus = envelope?.sourceStatus ?? 'backend-unavailable';
  const summary = envelope?.data.summary ?? EMPTY_METRICS;
  const items = envelope?.data.items ?? EMPTY_ITEMS;
  const warningCodes = envelope?.warnings.map((warning) => warning.code) ?? [];
  const bannerText = selectBannerText(sourceStatus, warningCodes);

  return (
    <MyWorkCard
      role="my-projects-home"
      footprint="full"
      eyebrow="My Work"
      title="My Projects"
      extraDataAttributes={{
        'data-my-project-links-source-status': sourceStatus,
      }}
    >
      <p className={styles.purpose}>
        Your assigned projects, ready to open in SharePoint and Procore.
      </p>

      <div className={styles.metrics}>
        <div className={styles.metricTile}>
          <span className={styles.metricLabel}>Assigned Projects</span>
          <span className={styles.metricValue}>{summary.assignedProjectCount}</span>
        </div>
        <div className={styles.metricTile}>
          <span className={styles.metricLabel}>Dual Launch Ready</span>
          <span className={styles.metricValue}>{summary.dualLaunchReadyCount}</span>
        </div>
        <div className={styles.metricTile}>
          <span className={styles.metricLabel}>SharePoint Ready</span>
          <span className={styles.metricValue}>{summary.sharePointReadyCount}</span>
        </div>
        <div className={styles.metricTile}>
          <span className={styles.metricLabel}>Procore Ready</span>
          <span className={styles.metricValue}>{summary.procoreReadyCount}</span>
        </div>
      </div>

      {bannerText ? (
        <div className={styles.banner} data-my-projects-readiness-banner={sourceStatus}>
          <p className={styles.bannerText}>{bannerText}</p>
        </div>
      ) : null}

      <div className={styles.launchRegion} data-my-projects-launch-region="">
        <p className={styles.launchTitle}>Launch List</p>
        <p className={styles.launchBody}>
          {isLoading
            ? 'Loading project launches…'
            : `${items.length} project link records are loaded. Detailed row actions arrive in Prompt 13.`}
        </p>
      </div>
    </MyWorkCard>
  );
}

export default MyProjectsHomeCard;
