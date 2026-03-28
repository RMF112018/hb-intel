/**
 * PublicationPage — Publication / Export workspace.
 *
 * Route: /project-hub/:projectId/financial/publication
 * Governance: Report-candidate designation, P3-F1 handoff, export runs.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcStatusBadge, HbcCard, HbcButton, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { usePublicationSurface } from '../hooks/usePublicationSurface.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

const useStyles = makeStyles({
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: `${HBC_SPACE_MD}px`, paddingBottom: `${HBC_SPACE_MD}px`, paddingLeft: `${HBC_SPACE_MD}px`, paddingRight: `${HBC_SPACE_MD}px`, borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--colorNeutralStroke1)' },
  eligibilityBanner: { display: 'flex', alignItems: 'center', gap: `${HBC_SPACE_SM}px`, paddingTop: `${HBC_SPACE_SM}px`, paddingBottom: `${HBC_SPACE_SM}px`, paddingLeft: `${HBC_SPACE_MD}px`, paddingRight: `${HBC_SPACE_MD}px` },
  eligible: { backgroundColor: HBC_STATUS_COLORS.success + '18', borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: HBC_STATUS_COLORS.success },
  blocked: { backgroundColor: HBC_STATUS_COLORS.warning + '18', borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: HBC_STATUS_COLORS.warning },
  section: { paddingTop: `${HBC_SPACE_MD}px`, paddingBottom: `${HBC_SPACE_MD}px`, paddingLeft: `${HBC_SPACE_MD}px`, paddingRight: `${HBC_SPACE_MD}px` },
  recordRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: `${HBC_SPACE_SM}px`, paddingBottom: `${HBC_SPACE_SM}px`, borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--colorNeutralStroke2)' },
});

export interface PublicationPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack?: () => void;
}

export function PublicationPage({ projectId: _projectId, viewerRole, complexityTier, onBack }: PublicationPageProps): ReactNode {
  const styles = useStyles();
  const data = usePublicationSurface({ viewerRole, complexityTier });

  return (
    <>
      <div className={styles.header} data-testid="publication-header">
        <div>
          <Text size={400} weight="semibold">Publication & Export</Text>
          <Text size={200} style={{ marginLeft: 8 }}>{data.reportingMonth}</Text>
        </div>
        {onBack && <HbcButton variant="secondary" onClick={onBack}>Back</HbcButton>}
      </div>

      <div className={`${styles.eligibilityBanner} ${data.eligibility.isEligible ? styles.eligible : styles.blocked}`} data-testid="publication-eligibility">
        <HbcStatusBadge variant={data.eligibility.isEligible ? 'success' : 'warning'} label={data.eligibility.isEligible ? 'Eligible for Publication' : 'Not Eligible'} size="medium" />
        {!data.eligibility.isEligible && data.eligibility.blockers.length > 0 && (
          <Text size={200}>{data.eligibility.blockers.join('; ')}</Text>
        )}
        {data.eligibility.hasReportCandidate && (
          <Text size={200}>Report candidate: Version {data.eligibility.candidateVersionNumber}</Text>
        )}
      </div>

      <div className={styles.section}>
        <Text size={300} weight="semibold">Publication History</Text>
        {data.publications.map((pub) => (
          <div key={pub.id} className={styles.recordRow} data-testid={`publication-record-${pub.id}`}>
            <div>
              <Text size={200} weight="semibold">Version {pub.versionNumber} — {pub.reportingMonth}</Text>
              <Text size={100} style={{ opacity: 0.6 }}>Published by {pub.publishedBy} on {new Date(pub.publishedAt).toLocaleDateString()}</Text>
            </div>
            <HbcStatusBadge variant={pub.status === 'Published' ? 'completed' : 'neutral'} label={pub.status} size="small" />
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <Text size={300} weight="semibold">Export Runs</Text>
        {data.exportRuns.map((exp) => (
          <div key={exp.id} className={styles.recordRow} data-testid={`export-run-${exp.id}`}>
            <div>
              <Text size={200} weight="semibold">{exp.exportType}</Text>
              <Text size={100} style={{ opacity: 0.6 }}>Created by {exp.createdBy} on {new Date(exp.createdAt).toLocaleDateString()}</Text>
            </div>
            <HbcStatusBadge variant={exp.status === 'Complete' ? 'success' : exp.status === 'Failed' ? 'error' : 'inProgress'} label={exp.status} size="small" />
          </div>
        ))}
      </div>
    </>
  );
}
