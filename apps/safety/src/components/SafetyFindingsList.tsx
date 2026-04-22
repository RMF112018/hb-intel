import type { ReactNode } from 'react';
import { HbcRiskBadge, HbcTypography, HbcEmptyState } from '@hbc/ui-kit';
import type { RiskLevel } from '@hbc/ui-kit';
import type { SafetyFinding } from '@hbc/features-safety';

/** Domain severity → ui-kit risk tier. Keeps severity a first-class visual channel. */
function riskLevelFor(severity: SafetyFinding['severity']): RiskLevel {
  switch (severity) {
    case 'high':
      return 'high';
    case 'medium':
      return 'moderate';
    case 'info':
    default:
      return 'low';
  }
}

export interface SafetyFindingsListProps {
  findings: ReadonlyArray<SafetyFinding>;
}

export function SafetyFindingsList({ findings }: SafetyFindingsListProps): ReactNode {
  if (findings.length === 0) {
    return (
      <HbcEmptyState
        title="No findings extracted"
        description="Nothing was flagged during parsing. This is the expected state for a clean inspection."
      />
    );
  }
  return (
    <ul className="safety-findings" data-safety-ui="findings">
      {findings.map((f) => (
        <li key={f.id} className="safety-findings__row">
          <HbcRiskBadge riskLevel={riskLevelFor(f.severity)} size="small" />
          <div className="safety-findings__row-body">
            <HbcTypography intent="body">{f.findingSummary}</HbcTypography>
            <div className="safety-findings__row-meta">
              <HbcTypography intent="bodySmall">{f.sectionName}</HbcTypography>
              <HbcTypography intent="bodySmall">Row {f.checklistRowNumber}</HbcTypography>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
