/**
 * ReviewPage — Review / PER Annotation workspace.
 *
 * Route: /project-hub/:projectId/financial/review
 * Governance: Version-aware annotation, carry-forward, custody transitions.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcStatusBadge, HbcCard, HbcButton, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { useReviewSurface } from '../hooks/useReviewSurface.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

const useStyles = makeStyles({
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${HBC_SPACE_MD}px`, borderBottom: '1px solid var(--colorNeutralStroke1)' },
  custodyBanner: { display: 'flex', alignItems: 'center', gap: `${HBC_SPACE_SM}px`, padding: `${HBC_SPACE_SM}px ${HBC_SPACE_MD}px`, backgroundColor: 'var(--colorBrandBackground2)', borderBottom: '1px solid var(--colorBrandStroke1)' },
  annotationList: { padding: `${HBC_SPACE_MD}px` },
  annotationCard: { marginBottom: `${HBC_SPACE_SM}px` },
  anchorLabel: { fontWeight: 600, fontSize: '12px', color: 'var(--colorBrandForeground1)' },
  inheritedBadge: { backgroundColor: HBC_STATUS_COLORS.info + '22', padding: `${HBC_SPACE_XS}px ${HBC_SPACE_SM}px`, borderRadius: '4px', fontSize: '11px' },
  pendingBadge: { backgroundColor: HBC_STATUS_COLORS.warning + '22', padding: `${HBC_SPACE_XS}px ${HBC_SPACE_SM}px`, borderRadius: '4px', fontSize: '11px', color: HBC_STATUS_COLORS.warning },
});

export interface ReviewPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack?: () => void;
}

export function ReviewPage({ viewerRole, complexityTier, onBack }: ReviewPageProps): ReactNode {
  const styles = useStyles();
  const data = useReviewSurface({ viewerRole, complexityTier });

  return (
    <>
      <div className={styles.header} data-testid="review-header">
        <div>
          <Text size={400} weight="semibold">Review & Annotation</Text>
          <Text size={200} style={{ marginLeft: 8 }}>Version {data.versionNumber} — {data.reportingMonth}</Text>
        </div>
        <div style={{ display: 'flex', gap: `${HBC_SPACE_SM}px`, alignItems: 'center' }}>
          <HbcStatusBadge variant={data.custody.status === 'Approved' ? 'success' : 'info'} label={data.custody.label} size="medium" />
          {data.pendingDispositionCount > 0 && (
            <HbcStatusBadge variant="warning" label={`${data.pendingDispositionCount} pending disposition`} size="small" />
          )}
          {onBack && <HbcButton variant="secondary" onClick={onBack}>Back</HbcButton>}
        </div>
      </div>

      <div className={styles.custodyBanner} data-testid="review-custody-banner">
        <Text size={200}>Custody: <strong>{data.custody.owner}</strong></Text>
        {data.custody.canSubmit && <HbcButton size="sm">Submit for Review</HbcButton>}
        {data.custody.canAnnotate && <HbcButton size="sm">Add Annotation</HbcButton>}
        {data.custody.canReturn && <HbcButton size="sm" variant="secondary">Return for Revision</HbcButton>}
        {data.custody.canApprove && <HbcButton size="sm">Approve</HbcButton>}
      </div>

      <div className={styles.annotationList} data-testid="review-annotation-list">
        <Text size={300} weight="semibold" style={{ marginBottom: `${HBC_SPACE_SM}px` }}>
          Annotations ({data.annotations.length})
        </Text>
        {data.annotations.map((ann) => (
          <HbcCard key={ann.id} className={styles.annotationCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: `${HBC_SPACE_XS}px` }}>
              <span className={styles.anchorLabel}>{ann.anchorType.toUpperCase()}: {ann.anchorLabel}</span>
              <div style={{ display: 'flex', gap: `${HBC_SPACE_XS}px` }}>
                {ann.inheritanceStatus === 'Inherited' && <span className={styles.inheritedBadge}>Inherited</span>}
                {ann.valueChangedFlag && <span className={styles.pendingBadge}>Value Changed</span>}
                {ann.pmDispositionStatus === 'Pending' && <span className={styles.pendingBadge}>Disposition Pending</span>}
              </div>
            </div>
            <Text size={200}>{ann.annotationText}</Text>
            <Text size={100} style={{ marginTop: `${HBC_SPACE_XS}px`, opacity: 0.6 }}>{ann.annotatedBy} — {new Date(ann.annotatedAt).toLocaleDateString()}</Text>
          </HbcCard>
        ))}
      </div>
    </>
  );
}
