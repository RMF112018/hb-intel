/**
 * SF18-T06 BidReadinessAdminConfig component.
 *
 * Provides deterministic admin-editable readiness criteria/checklist/config
 * surfaces with governance metadata and save/cancel flows.
 *
 * @design D-SF18-T06
 */
import {
  useBidReadinessAdminConfig,
  type UseBidReadinessAdminConfigParams,
} from '../hooks/index.js';
import { ReadinessCriteriaEditor } from './ReadinessCriteriaEditor.js';
import { ChecklistDefinitionEditor } from './ChecklistDefinitionEditor.js';
import { ScoringWeightEditor } from './ScoringWeightEditor.js';

export interface BidReadinessAdminConfigProps {
  readonly profileOverride?: UseBidReadinessAdminConfigParams['profileOverride'];
}

export function BidReadinessAdminConfig({
  profileOverride = null,
}: BidReadinessAdminConfigProps): JSX.Element {
  const admin = useBidReadinessAdminConfig({
    profileOverride,
    enabled: true,
  });

  if (admin.state === 'loading' && !admin.draft) {
    return <p data-testid="admin-config-loading">Loading admin readiness configuration...</p>;
  }

  if (admin.state === 'error' && !admin.draft) {
    return <p data-testid="admin-config-error">Unable to load admin readiness configuration.</p>;
  }

  if (!admin.draft) {
    return <p data-testid="admin-config-empty">No admin readiness configuration is available.</p>;
  }

  return (
    <section aria-label="Bid Readiness Admin Configuration" data-testid="bid-readiness-admin-config">
      <h2>Bid Readiness Admin Configuration</h2>
      <p data-testid="admin-governance">
        Governance: {admin.draft.governance.governanceState} · Version: {admin.draft.version.version}
      </p>

      {admin.state === 'degraded' ? (
        <p role="status" data-testid="admin-config-degraded">
          Admin configuration is degraded. Showing best available snapshot.
        </p>
      ) : null}

      <ReadinessCriteriaEditor
        profile={admin.draft.profile}
        onWeightChange={admin.setCriterionWeight}
        onBlockerChange={admin.setCriterionBlocker}
      />

      <ScoringWeightEditor
        profile={admin.draft.profile}
        onThresholdChange={admin.setThreshold}
      />

      <ChecklistDefinitionEditor definitions={admin.draft.checklistDefinitions} />

      {admin.validationErrors.length > 0 ? (
        <ul data-testid="admin-config-validation-errors">
          {admin.validationErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : (
        <p data-testid="admin-config-valid">Configuration is valid.</p>
      )}

      <div>
        <button type="button" onClick={admin.saveDraft} data-testid="admin-config-save">
          Save
        </button>
        <button type="button" onClick={admin.resetDraft} data-testid="admin-config-cancel">
          Cancel
        </button>
      </div>
    </section>
  );
}
