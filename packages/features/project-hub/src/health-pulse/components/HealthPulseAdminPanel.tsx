import { useEffect, useMemo, useState } from 'react';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig } from '@hbc/smart-empty-state';
import {
  HbcBanner,
  HbcButton,
  HbcCard,
  HbcCheckbox,
  HbcForm,
  HbcFormRow,
  HbcFormSection,
  HbcPanel,
  HbcSelect,
  HbcSpinner,
  HbcTextField,
  HbcTypography,
} from '@hbc/ui-kit';
import { usePermission } from '@hbc/auth';

import { HEALTH_PULSE_TRIAGE_BUCKETS } from '../constants/index.js';
import {
  useHealthPulseAdminConfig,
  type IHealthPulseAdminConfigValidationIssue,
} from '../hooks/index.js';
import type { IHealthPulseAdminConfig } from '../types/index.js';
import {
  toAdminConfigFromFormState,
  toAdminFormState,
  type HealthPulseAdminFormState,
} from './displayModel.js';

export interface HealthPulseAdminPanelProps {
  initialConfig: IHealthPulseAdminConfig;
  open?: boolean;
  onClose?: () => void;
  onSaved?: (config: IHealthPulseAdminConfig) => void;
}

const TRIAGE_SORT_OPTIONS = [
  { value: 'deterioration-velocity', label: 'Deterioration velocity' },
  { value: 'compound-risk-severity', label: 'Compound-risk severity' },
  { value: 'unresolved-action-backlog', label: 'Unresolved action backlog' },
] as const;

const parseInteger = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const ADMIN_PERMISSION_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'permission-empty',
    heading: 'Admin access required',
    description: 'hbc-admin permission is required to edit health pulse configuration.',
    coachingTip: 'Contact your system administrator to request health pulse configuration access.',
  }),
};

export const HealthPulseAdminPanel = ({
  initialConfig,
  open,
  onClose,
  onSaved,
}: HealthPulseAdminPanelProps) => {
  const isAdmin = usePermission('hbc-admin');
  const state = useHealthPulseAdminConfig({ initialConfig });
  const [formState, setFormState] = useState<HealthPulseAdminFormState | null>(null);

  useEffect(() => {
    if (state.draft) {
      setFormState(toAdminFormState(state.draft));
    }
  }, [state.draft]);

  const weightTotal = useMemo(() => {
    if (!formState) return 0;
    return (
      formState.weightsPercent.field +
      formState.weightsPercent.time +
      formState.weightsPercent.cost +
      formState.weightsPercent.office
    );
  }, [formState]);

  const localIssues = useMemo<IHealthPulseAdminConfigValidationIssue[]>(() => {
    if (!formState) return [];
    if (weightTotal === 100) return [];
    return [
      {
        path: 'weightsPercent',
        message: 'Weight percentages must sum to 100.',
        severity: 'error',
      },
    ];
  }, [formState, weightTotal]);

  const allIssues = [...state.validationIssues, ...localIssues];
  const canSave = isAdmin && state.isValid && localIssues.length === 0 && !state.isSaving;

  const save = async (): Promise<void> => {
    if (!formState || !canSave) return;
    const config = toAdminConfigFromFormState(formState);
    await state.save(config);
    onSaved?.(config);
  };

  const panelBody = (
    <div>
      {state.isLoading && <HbcSpinner size="lg" label="Loading admin configuration" />}
      {state.error && (
        <HbcBanner variant="error">
          Unable to load admin configuration: {state.error.message}
        </HbcBanner>
      )}
      {!isAdmin && (
        <HbcSmartEmptyState
          config={ADMIN_PERMISSION_EMPTY_CONFIG}
          context={{
            module: 'project-hub',
            view: 'health-pulse-admin',
            hasActiveFilters: false,
            hasPermission: false,
            isFirstVisit: false,
            currentUserRole: 'user',
            isLoadError: false,
          }}
          variant="inline"
        />
      )}

      {isAdmin && formState && (
        <HbcForm
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <HbcFormSection title="Dimension weights (percent)">
            <HbcFormRow>
              <HbcTextField
                label="Field %"
                value={`${formState.weightsPercent.field}`}
                onChange={(value) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          weightsPercent: {
                            ...current.weightsPercent,
                            field: parseInteger(value),
                          },
                        }
                      : current
                  )
                }
              />
              <HbcTextField
                label="Time %"
                value={`${formState.weightsPercent.time}`}
                onChange={(value) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          weightsPercent: {
                            ...current.weightsPercent,
                            time: parseInteger(value),
                          },
                        }
                      : current
                  )
                }
              />
              <HbcTextField
                label="Cost %"
                value={`${formState.weightsPercent.cost}`}
                onChange={(value) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          weightsPercent: {
                            ...current.weightsPercent,
                            cost: parseInteger(value),
                          },
                        }
                      : current
                  )
                }
              />
              <HbcTextField
                label="Office %"
                value={`${formState.weightsPercent.office}`}
                onChange={(value) =>
                  setFormState((current) =>
                    current
                      ? {
                          ...current,
                          weightsPercent: {
                            ...current.weightsPercent,
                            office: parseInteger(value),
                          },
                        }
                      : current
                  )
                }
              />
            </HbcFormRow>
            <HbcTypography intent="bodySmall">Current sum: {weightTotal}%</HbcTypography>
          </HbcFormSection>

          <HbcFormSection title="Staleness and overrides">
            <HbcTextField
              label="Staleness threshold days"
              value={`${formState.stalenessThresholdDays}`}
              onChange={(value) =>
                setFormState((current) =>
                  current
                    ? { ...current, stalenessThresholdDays: parseInteger(value) }
                    : current
                )
              }
            />
            <HbcTextField
              label="Per-metric staleness overrides"
              placeholder="metric.key=10"
              value={formState.metricStalenessOverridesInput}
              onChange={(value) =>
                setFormState((current) =>
                  current
                    ? { ...current, metricStalenessOverridesInput: value }
                    : current
                )
              }
            />
          </HbcFormSection>

          <HbcFormSection title="Manual governance">
            <HbcTextField
              label="Approval-required metric keys"
              value={formState.approvalRequiredMetricKeysInput}
              onChange={(value) =>
                setFormState((current) =>
                  current
                    ? { ...current, approvalRequiredMetricKeysInput: value }
                    : current
                )
              }
            />
            <HbcFormRow>
              <HbcTextField
                label="Max manual influence %"
                value={`${formState.maxManualInfluencePercent}`}
                onChange={(value) =>
                  setFormState((current) =>
                    current
                      ? { ...current, maxManualInfluencePercent: parseInteger(value) }
                      : current
                  )
                }
              />
              <HbcTextField
                label="Max override age days"
                value={`${formState.maxOverrideAgeDays}`}
                onChange={(value) =>
                  setFormState((current) =>
                    current
                      ? { ...current, maxOverrideAgeDays: parseInteger(value) }
                      : current
                  )
                }
              />
            </HbcFormRow>
          </HbcFormSection>

          <HbcFormSection title="Office suppression policy">
            <HbcCheckbox
              label="Enable low-impact suppression"
              checked={formState.lowImpactSuppressionEnabled}
              onChange={(checked) =>
                setFormState((current) =>
                  current
                    ? { ...current, lowImpactSuppressionEnabled: checked }
                    : current
                )
              }
            />
            <HbcTextField
              label="Duplicate cluster window hours"
              value={`${formState.duplicateClusterWindowHours}`}
              onChange={(value) =>
                setFormState((current) =>
                  current
                    ? { ...current, duplicateClusterWindowHours: parseInteger(value) }
                    : current
                )
              }
            />
            <HbcFormRow>
              <HbcTextField
                label="Minor severity weight"
                value={`${formState.minorSeverityWeight}`}
                onChange={(value) =>
                  setFormState((current) =>
                    current
                      ? { ...current, minorSeverityWeight: parseInteger(value) }
                      : current
                  )
                }
              />
              <HbcTextField
                label="Major severity weight"
                value={`${formState.majorSeverityWeight}`}
                onChange={(value) =>
                  setFormState((current) =>
                    current
                      ? { ...current, majorSeverityWeight: parseInteger(value) }
                      : current
                  )
                }
              />
              <HbcTextField
                label="Critical severity weight"
                value={`${formState.criticalSeverityWeight}`}
                onChange={(value) =>
                  setFormState((current) =>
                    current
                      ? { ...current, criticalSeverityWeight: parseInteger(value) }
                      : current
                  )
                }
              />
            </HbcFormRow>
          </HbcFormSection>

          <HbcFormSection title="Portfolio triage defaults">
            <HbcSelect
              label="Default bucket"
              value={formState.defaultBucket}
              onChange={(value) =>
                setFormState((current) =>
                  current
                    ? {
                        ...current,
                        defaultBucket:
                          value as HealthPulseAdminFormState['defaultBucket'],
                      }
                    : current
                )
              }
              options={HEALTH_PULSE_TRIAGE_BUCKETS.map((bucket) => ({
                value: bucket,
                label: bucket,
              }))}
            />
            <HbcSelect
              label="Default sort"
              value={formState.defaultSort}
              onChange={(value) =>
                setFormState((current) =>
                  current
                    ? {
                        ...current,
                        defaultSort:
                          value as HealthPulseAdminFormState['defaultSort'],
                      }
                    : current
                )
              }
              options={TRIAGE_SORT_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
          </HbcFormSection>

          {allIssues.length > 0 && (
            <HbcBanner variant="warning">
              {allIssues.map((issue) => `${issue.path}: ${issue.message}`).join(' | ')}
            </HbcBanner>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <HbcButton
              variant="secondary"
              onClick={() => {
                state.reset();
                if (state.draft) {
                  setFormState(toAdminFormState(state.draft));
                }
              }}
            >
              Reset
            </HbcButton>
            <HbcButton variant="primary" disabled={!canSave} onClick={() => void save()}>
              Save configuration
            </HbcButton>
          </div>
        </HbcForm>
      )}
    </div>
  );

  if (open !== undefined) {
    return (
      <HbcPanel
        open={open}
        onClose={onClose ?? (() => {})}
        title="Health Pulse Admin Panel"
        size="lg"
      >
        {panelBody}
      </HbcPanel>
    );
  }

  return (
    <HbcCard
      header={<HbcTypography intent="heading3">Health Pulse Admin Panel</HbcTypography>}
    >
      {panelBody}
    </HbcCard>
  );
};
