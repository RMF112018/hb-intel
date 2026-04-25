import * as React from 'react';
import {
  FoleonEmbeddedReaderLane,
  createEmbeddedFoleonRuntimeContract,
  type FoleonEmbeddedReaderLaneKey,
  type FoleonEmbeddedReaderStatus,
} from '@hbc/foleon-reader';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';
import {
  HOMEPAGE_EMBEDDED_FOLEON_MANIFEST_ID,
  HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION,
  toEmbeddedFoleonMountConfig,
} from '../wiring/foleonHomepageConfig.js';
import { useReportOccupantContentState } from '../shell/occupantContentState.js';
import type {
  OccupantContentStateKind,
  OccupantContentStateReport,
} from '../shell/occupantContentState.js';
import type { OccupantId } from '../shell/shellTypes.js';
import styles from './FoleonHomepageLaneHost.module.css';

interface FoleonHomepageLaneHostProps extends HbHomepageZoneProps {
  readonly lane: FoleonEmbeddedReaderLaneKey;
  readonly occupantId: Extract<OccupantId, 'project-portfolio-spotlight' | 'company-pulse'>;
}

type EmbeddedLaneProps = React.ComponentProps<typeof FoleonEmbeddedReaderLane>;

export function FoleonHomepageLaneHost(props: FoleonHomepageLaneHostProps): React.JSX.Element {
  const {
    foleonConfig,
    getFoleonApiToken,
    lane,
    occupantId,
    siteUrl,
  } = props;
  const [status, setStatus] = React.useState<FoleonEmbeddedReaderStatus>({ kind: 'loading' });

  const contract = React.useMemo(
    () =>
      createEmbeddedFoleonRuntimeContract({
        hasSpfxContext: Boolean(siteUrl),
        siteUrl,
        config: toEmbeddedFoleonMountConfig(foleonConfig ?? {
          foleonExpectedManifestId: HOMEPAGE_EMBEDDED_FOLEON_MANIFEST_ID,
          foleonExpectedPackageVersion: HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION,
        }, lane),
        packageIdentity: {
          manifestId: HOMEPAGE_EMBEDDED_FOLEON_MANIFEST_ID,
          packageVersion: HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION,
        },
        getAccessToken: getFoleonApiToken,
        telemetryIdentity: {
          correlationId: `hb-homepage-${occupantId}`,
          sessionId: 'hb-homepage-embedded-foleon',
        },
      }),
    [foleonConfig, getFoleonApiToken, lane, occupantId, siteUrl],
  );

  const report = React.useMemo<OccupantContentStateReport>(() => {
    if (!contract.canInitialize) {
      return buildReport(occupantId, 'invalid', contract.blockingReasons.join(',') || 'config-invalid');
    }
    return buildReport(occupantId, mapStatusToContentState(status), statusSummary(status));
  }, [contract.blockingReasons, contract.canInitialize, occupantId, status]);

  useReportOccupantContentState(report);

  const handleOpenArchive = React.useCallback((): void => undefined, []);
  const handleReaderOpen = React.useCallback<EmbeddedLaneProps['onReaderOpen']>(() => undefined, []);
  const handleReaderClose = React.useCallback<EmbeddedLaneProps['onReaderClose']>(() => undefined, []);
  const handleEmbedError = React.useCallback<EmbeddedLaneProps['onEmbedError']>(() => {
    setStatus({ kind: 'error', message: 'embed-error' });
  }, []);
  const handleGateBlocked = React.useCallback<EmbeddedLaneProps['onGateBlocked']>((gateResult) => {
    setStatus({ kind: 'error', message: gateResult });
  }, []);

  if (!contract.canInitialize) {
    return (
      <div
        className={`${styles.host} ${styles.invalid}`}
        role="alert"
        data-hb-homepage-foleon-lane={lane}
        data-hb-homepage-foleon-state="invalid"
      >
        <p className={styles.invalidTitle}>Foleon reader configuration is incomplete.</p>
        <p className={styles.invalidDetail}>
          Update the HB Homepage webpart Foleon list IDs, origins, and expected package values.
        </p>
      </div>
    );
  }

  return (
    <div
      className={styles.host}
      data-hb-homepage-foleon-lane={lane}
      data-hb-homepage-foleon-state={status.kind}
    >
      <FoleonEmbeddedReaderLane
        lane={lane}
        contract={contract}
        onOpenArchive={handleOpenArchive}
        onReaderOpen={handleReaderOpen}
        onReaderClose={handleReaderClose}
        onEmbedError={handleEmbedError}
        onGateBlocked={handleGateBlocked}
        onStatusChange={setStatus}
      />
    </div>
  );
}

function buildReport(
  occupantId: FoleonHomepageLaneHostProps['occupantId'],
  kind: OccupantContentStateKind,
  summary: string,
): OccupantContentStateReport {
  return {
    occupantId,
    kind,
    summary,
    reportedAt: Date.now(),
  };
}

function mapStatusToContentState(status: FoleonEmbeddedReaderStatus): OccupantContentStateKind {
  if (status.kind === 'loading') return 'loading';
  if (status.kind === 'preview') return 'empty';
  if (status.kind === 'ready') return 'strong';
  return 'invalid';
}

function statusSummary(status: FoleonEmbeddedReaderStatus): string {
  if (status.kind === 'preview') return status.resolution.reason;
  if (status.kind === 'ready') return 'live-reader';
  if (status.kind === 'blocked') return status.resolution.reason;
  if (status.kind === 'error') return status.message ?? 'reader-error';
  return 'resolving';
}
