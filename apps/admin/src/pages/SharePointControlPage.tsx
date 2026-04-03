import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcButton,
  HbcCard,
  HbcStatusBadge,
  HbcTypography,
  HBC_SPACE_XS,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  HBC_SPACE_LG,
  HBC_STATUS_COLORS,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type {
  ISharePointComparisonResult,
  ISharePointDriftFinding,
  ISharePointAreaComparisonSummary,
  IAdminPreviewResponse,
  IAdminPreviewImpactItem,
} from '@hbc/models';

/**
 * Display-facing posture types matching the backend IPostureValidationResult
 * and IPostureCheckFinding shapes. Defined locally because posture types
 * live in the backend service layer, not in @hbc/models shared contracts.
 * These will be promoted to shared models if cross-surface consumption grows.
 */
interface IPostureCheckFinding {
  readonly category: 'app-catalog' | 'api-access';
  readonly checkId: string;
  readonly label: string;
  readonly status: 'healthy' | 'degraded' | 'missing' | 'unknown';
  readonly severity: 'critical' | 'warning' | 'info';
  readonly detail: string;
  readonly advisoryOnly: boolean;
  readonly recommendedAction: string | null;
}

interface IPostureValidationResult {
  readonly validatedAt: string;
  readonly overallHealth: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  readonly findings: readonly IPostureCheckFinding[];
  readonly appCatalogCheckCount: number;
  readonly apiAccessCheckCount: number;
  readonly healthyCount: number;
  readonly degradedCount: number;
  readonly missingCount: number;
  readonly unknownCount: number;
}

/**
 * P8-08: SharePoint Control lane page.
 *
 * Operator-facing surface for the SharePoint control lane. Provides:
 * - Managed-asset scoping (project site selection)
 * - Drift detection results browsing
 * - Preview / dry-run review
 * - Repair initiation
 * - App catalog and API posture visibility
 *
 * The page is a command-and-review surface only. All privileged
 * execution happens through backend APIs.
 */

// ─── Styles ─────────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_LG}px`,
  },
  section: {
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  cardPadding: {
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  areaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    borderBottom: `1px solid ${HBC_STATUS_COLORS.neutral}`,
  },
  areaInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  findingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
  },
  impactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
  },
  actions: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_MD}px`,
  },
  postureRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    borderBottom: `1px solid ${HBC_STATUS_COLORS.neutral}`,
  },
  postureDetail: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
  },
  warningText: {
    color: HBC_STATUS_COLORS.warning,
  },
  errorText: {
    color: HBC_STATUS_COLORS.error,
  },
  infoText: {
    color: HBC_STATUS_COLORS.neutral,
  },
  summaryRow: {
    display: 'flex',
    gap: `${HBC_SPACE_LG}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  summaryCard: {
    flex: 1,
    textAlign: 'center',
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
  },
  summaryValue: {
    fontWeight: 700,
  },
  summaryLabel: {
    color: HBC_STATUS_COLORS.neutral,
    marginTop: `${HBC_SPACE_XS}px`,
  },
  sectionSpacerTop: {
    marginTop: `${HBC_SPACE_MD}px`,
  },
  sectionSpacerTopSm: {
    marginTop: `${HBC_SPACE_SM}px`,
  },
});

// ─── Status Helpers ─────────────────────────────────────────────────────────────

type StatusVariant = 'success' | 'error' | 'warning' | 'inProgress' | 'neutral';

function outcomeToVariant(outcome: string): StatusVariant {
  switch (outcome) {
    case 'compliant': case 'healthy': case 'passed': return 'success';
    case 'drifted': case 'unhealthy': case 'missing': return 'error';
    case 'degraded': case 'warning': return 'warning';
    case 'unknown': return 'neutral';
    default: return 'neutral';
  }
}

function severityToVariant(severity: string): StatusVariant {
  switch (severity) {
    case 'critical': return 'error';
    case 'warning': return 'warning';
    case 'info': return 'neutral';
    default: return 'neutral';
  }
}

function changeTypeToVariant(changeType: string): StatusVariant {
  switch (changeType) {
    case 'create': return 'inProgress';
    case 'no-change': return 'neutral';
    case 'delete': return 'error';
    default: return 'neutral';
  }
}

// ─── Section Components ─────────────────────────────────────────────────────────

function DriftSummarySection({ comparison }: { comparison: ISharePointComparisonResult | null }): ReactNode {
  const styles = useStyles();

  if (!comparison) {
    return (
      <HbcCard className={styles.cardPadding}>
        <HbcTypography intent="heading3">Drift Detection</HbcTypography>
        <HbcTypography intent="bodySmall">
          Run drift detection to compare a managed site against HB Intel standards.
        </HbcTypography>
      </HbcCard>
    );
  }

  return (
    <HbcCard className={styles.cardPadding}>
      <div className={styles.sectionHeader}>
        <HbcTypography intent="heading3">
          Drift Detection — {comparison.asset.projectNumber}
        </HbcTypography>
        <HbcStatusBadge variant={outcomeToVariant(comparison.outcome)} label={comparison.outcome} />
      </div>

      <div className={styles.summaryRow}>
        <HbcCard className={styles.summaryCard}>
          <div className={styles.summaryValue}>{comparison.totalExpectations}</div>
          <div className={styles.summaryLabel}>Checked</div>
        </HbcCard>
        <HbcCard className={styles.summaryCard}>
          <div className={styles.summaryValue}>{comparison.totalPassed}</div>
          <div className={styles.summaryLabel}>Passed</div>
        </HbcCard>
        <HbcCard className={styles.summaryCard}>
          <div className={styles.summaryValue}>{comparison.totalDriftCount}</div>
          <div className={styles.summaryLabel}>Drift</div>
        </HbcCard>
        <HbcCard className={styles.summaryCard}>
          <div className={styles.summaryValue}>{comparison.totalRepairableCount}</div>
          <div className={styles.summaryLabel}>Repairable</div>
        </HbcCard>
      </div>

      <HbcTypography intent="heading4">Area Breakdown</HbcTypography>
      {comparison.areaSummaries.map((area: ISharePointAreaComparisonSummary) => (
        <div key={area.area} className={styles.areaRow}>
          <div className={styles.areaInfo}>
            <HbcStatusBadge variant={outcomeToVariant(area.outcome)} label={area.areaLabel} />
            <span className={styles.infoText}>
              {area.expectationsPassed}/{area.expectationsChecked} passed
              {area.driftCount > 0 && ` · ${area.driftCount} drift`}
              {area.repairableCount > 0 && ` · ${area.repairableCount} repairable`}
            </span>
          </div>
        </div>
      ))}

      {comparison.findings.length > 0 && (
        <>
          <HbcTypography intent="heading4" className={styles.sectionSpacerTop}>
            Drift Findings
          </HbcTypography>
          {comparison.findings.map((finding: ISharePointDriftFinding, i: number) => (
            <div key={`${finding.expectationId}-${i}`} className={styles.findingRow}>
              <HbcStatusBadge variant={severityToVariant(finding.severity)} label={finding.severity} />
              <span>{finding.label}</span>
              {finding.repairable && <HbcStatusBadge variant="inProgress" label="repairable" />}
              {!finding.repairable && <HbcStatusBadge variant="neutral" label="advisory" />}
            </div>
          ))}
        </>
      )}

      <div className={`${styles.infoText} ${styles.sectionSpacerTopSm}`}>
        Standards: {comparison.standardsVersion} ({comparison.standardsSource}) · Compared: {new Date(comparison.comparedAt).toLocaleString()}
      </div>
    </HbcCard>
  );
}

function PreviewSection({ preview }: { preview: IAdminPreviewResponse | null }): ReactNode {
  const styles = useStyles();

  if (!preview) return null;

  const creates = preview.impactSummary.filter((i: IAdminPreviewImpactItem) => i.changeType === 'create');
  const noChanges = preview.impactSummary.filter((i: IAdminPreviewImpactItem) => i.changeType === 'no-change');

  return (
    <HbcCard className={styles.cardPadding}>
      <div className={styles.sectionHeader}>
        <HbcTypography intent="heading3">Repair Preview</HbcTypography>
        <HbcStatusBadge
          variant={creates.length > 0 ? 'inProgress' : 'neutral'}
          label={`Risk: ${preview.riskLevel}`}
        />
      </div>

      {creates.length > 0 && (
        <>
          <HbcTypography intent="heading4">Proposed Changes ({creates.length})</HbcTypography>
          {creates.map((item: IAdminPreviewImpactItem, i: number) => (
            <div key={i} className={styles.impactRow}>
              <HbcStatusBadge variant={changeTypeToVariant(item.changeType)} label={item.changeType} />
              <span>{item.resource}</span>
              <span className={styles.infoText}>{item.description}</span>
            </div>
          ))}
        </>
      )}

      {noChanges.length > 0 && (
        <>
          <HbcTypography intent="heading4" className={styles.sectionSpacerTop}>
            Advisory Only ({noChanges.length})
          </HbcTypography>
          {noChanges.map((item: IAdminPreviewImpactItem, i: number) => (
            <div key={i} className={styles.impactRow}>
              <HbcStatusBadge variant="neutral" label="no-change" />
              <span>{item.resource}</span>
              <span className={styles.infoText}>{item.description}</span>
            </div>
          ))}
        </>
      )}

      {preview.warnings.length > 0 && (
        <>
          <HbcTypography intent="heading4" className={styles.sectionSpacerTop}>Warnings</HbcTypography>
          {preview.warnings.map((w: string, i: number) => (
            <div key={i} className={styles.warningText}>{w}</div>
          ))}
        </>
      )}
    </HbcCard>
  );
}

function PostureSection({ posture }: { posture: IPostureValidationResult | null }): ReactNode {
  const styles = useStyles();

  if (!posture) {
    return (
      <HbcCard className={styles.cardPadding}>
        <HbcTypography intent="heading3">Package & API Posture</HbcTypography>
        <HbcTypography intent="bodySmall">
          Run posture validation to check app catalog and API access status for HB Intel rollout dependencies.
        </HbcTypography>
      </HbcCard>
    );
  }

  return (
    <HbcCard className={styles.cardPadding}>
      <div className={styles.sectionHeader}>
        <HbcTypography intent="heading3">Package & API Posture</HbcTypography>
        <HbcStatusBadge variant={outcomeToVariant(posture.overallHealth)} label={posture.overallHealth} />
      </div>

      <div className={styles.summaryRow}>
        <HbcCard className={styles.summaryCard}>
          <div className={styles.summaryValue}>{posture.healthyCount}</div>
          <div className={styles.summaryLabel}>Healthy</div>
        </HbcCard>
        <HbcCard className={styles.summaryCard}>
          <div className={styles.summaryValue}>{posture.degradedCount}</div>
          <div className={styles.summaryLabel}>Degraded</div>
        </HbcCard>
        <HbcCard className={styles.summaryCard}>
          <div className={styles.summaryValue}>{posture.missingCount}</div>
          <div className={styles.summaryLabel}>Missing</div>
        </HbcCard>
        <HbcCard className={styles.summaryCard}>
          <div className={styles.summaryValue}>{posture.unknownCount}</div>
          <div className={styles.summaryLabel}>Unknown</div>
        </HbcCard>
      </div>

      <HbcTypography intent="heading4">App Catalog ({posture.appCatalogCheckCount} checks)</HbcTypography>
      {posture.findings
        .filter((f: IPostureCheckFinding) => f.category === 'app-catalog')
        .map((f: IPostureCheckFinding) => (
          <div key={f.checkId} className={styles.postureRow}>
            <div className={styles.postureDetail}>
              <span>{f.label}</span>
              <span className={styles.infoText}>{f.detail}</span>
            </div>
            <div className={styles.areaInfo}>
              <HbcStatusBadge variant={outcomeToVariant(f.status)} label={f.status} />
              {f.recommendedAction && (
                <span className={f.severity === 'critical' ? styles.errorText : styles.warningText}>
                  {f.recommendedAction}
                </span>
              )}
            </div>
          </div>
        ))}

      <HbcTypography intent="heading4" className={styles.sectionSpacerTop}>
        API Access ({posture.apiAccessCheckCount} checks)
      </HbcTypography>
      {posture.findings
        .filter((f: IPostureCheckFinding) => f.category === 'api-access')
        .map((f: IPostureCheckFinding) => (
          <div key={f.checkId} className={styles.postureRow}>
            <div className={styles.postureDetail}>
              <span>{f.label}</span>
              <span className={styles.infoText}>{f.detail}</span>
            </div>
            <div className={styles.areaInfo}>
              <HbcStatusBadge variant={outcomeToVariant(f.status)} label={f.status} />
              {f.recommendedAction && (
                <span className={f.severity === 'critical' ? styles.errorText : styles.warningText}>
                  {f.recommendedAction}
                </span>
              )}
            </div>
          </div>
        ))}

      <div className={`${styles.infoText} ${styles.sectionSpacerTopSm}`}>
        Validated: {new Date(posture.validatedAt).toLocaleString()} · All checks are advisory-only in Phase 8
      </div>
    </HbcCard>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export function SharePointControlPage(): ReactNode {
  const styles = useStyles();

  // State for backend data
  // State will be populated when backend API routes are wired in a later prompt
  const [comparison, _setComparison] = useState<ISharePointComparisonResult | null>(null);
  const [preview, _setPreview] = useState<IAdminPreviewResponse | null>(null);
  const [posture, _setPosture] = useState<IPostureValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder actions — will wire to backend APIs in later prompts
  const handleRunDriftDetection = useCallback(() => {
    setIsLoading(true);
    setError(null);
    // Backend API integration pending — Prompt-08 establishes the UX shell
    // Real integration will call POST /api/admin/sharepoint/drift-detect
    setTimeout(() => {
      setIsLoading(false);
      setError('Drift detection API not yet wired — backend services are ready, API route integration pending.');
    }, 500);
  }, []);

  const handleRunPreview = useCallback(() => {
    if (!comparison || comparison.outcome === 'compliant') return;
    setError('Preview API not yet wired — backend services are ready, API route integration pending.');
  }, [comparison]);

  const handleRunRepair = useCallback(() => {
    if (!preview) return;
    setError('Repair API not yet wired — backend services are ready, API route integration pending.');
  }, [preview]);

  const handleRunPosture = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      setError('Posture validation API not yet wired — backend services are ready, API route integration pending.');
    }, 500);
  }, []);

  return (
    <WorkspacePageShell layout="list" title="SharePoint Control">
      <div className={styles.container}>
        {/* Action Bar */}
        <div className={styles.actions}>
          <HbcButton
            variant="primary"
            onClick={handleRunDriftDetection}
            disabled={isLoading}
          >
            {isLoading ? 'Running...' : 'Run Drift Detection'}
          </HbcButton>
          <HbcButton
            variant="secondary"
            onClick={handleRunPreview}
            disabled={!comparison || comparison.outcome === 'compliant'}
          >
            Preview Repair
          </HbcButton>
          <HbcButton
            variant="secondary"
            onClick={handleRunRepair}
            disabled={!preview}
          >
            Apply Repair
          </HbcButton>
          <HbcButton
            variant="ghost"
            onClick={handleRunPosture}
            disabled={isLoading}
          >
            Check Posture
          </HbcButton>
        </div>

        {error && (
          <HbcCard className={styles.cardPadding}>
            <HbcTypography intent="bodySmall" className={styles.warningText}>{error}</HbcTypography>
          </HbcCard>
        )}

        {/* Drift Detection */}
        <DriftSummarySection comparison={comparison} />

        {/* Preview */}
        <PreviewSection preview={preview} />

        {/* Posture */}
        <PostureSection posture={posture} />

        {/* Info footer */}
        <div className={styles.infoText}>
          SharePoint Control lane — Phase 8. Active control scoped to HB Intel-managed assets only.
          All repairs are idempotent creates. Posture checks are advisory.
        </div>
      </div>
    </WorkspacePageShell>
  );
}
