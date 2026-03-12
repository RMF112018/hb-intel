import { useEffect, useMemo, useState } from 'react';
import {
  HbcBanner,
  HbcButton,
  HbcCheckbox,
  HbcForm,
  HbcFormRow,
  HbcFormSection,
  HbcPanel,
  HbcTextField,
  HbcTypography,
} from '@hbc/ui-kit';

import type { IHealthMetric } from '../types/index.js';

export interface IHealthMetricInlineEditSavePayload {
  metric: IHealthMetric;
}

export interface HealthMetricInlineEditProps {
  metric: IHealthMetric | null;
  open: boolean;
  onClose: () => void;
  onSave: (payload: IHealthMetricInlineEditSavePayload) => void;
  requiresApproval: boolean;
  maxOverrideAgeDays: number;
  actorId: string;
  now?: () => Date;
}

interface LocalValidationState {
  value?: string;
  reason?: string;
}

const toInitialValue = (metric: IHealthMetric | null): string =>
  metric?.value === null || metric === null ? '' : `${metric.value}`;

export const HealthMetricInlineEdit = ({
  metric,
  open,
  onClose,
  onSave,
  requiresApproval,
  maxOverrideAgeDays,
  actorId,
  now = () => new Date(),
}: HealthMetricInlineEditProps) => {
  const [valueInput, setValueInput] = useState<string>(toInitialValue(metric));
  const [reasonInput, setReasonInput] = useState<string>(
    metric?.manualOverride?.reason ?? ''
  );
  const [requiresApprovalInput, setRequiresApprovalInput] =
    useState<boolean>(requiresApproval);
  const [validation, setValidation] = useState<LocalValidationState>({});

  useEffect(() => {
    if (!open) return;
    setValueInput(toInitialValue(metric));
    setReasonInput(metric?.manualOverride?.reason ?? '');
    setRequiresApprovalInput(requiresApproval);
    setValidation({});
  }, [metric, open, requiresApproval]);

  const enteredAt = useMemo(() => now().toISOString(), [now, open]);

  const validate = (): boolean => {
    const next: LocalValidationState = {};

    const parsed = Number(valueInput);
    if (!Number.isFinite(parsed)) {
      next.value = 'Metric value must be a finite number.';
    }

    const reasonRequired = requiresApprovalInput || requiresApproval;
    if (reasonRequired && reasonInput.trim().length === 0) {
      next.reason = 'A reason is required for governed manual overrides.';
    }

    setValidation(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (): void => {
    if (!metric) return;
    if (!validate()) return;

    onSave({
      metric: {
        ...metric,
        value: Number(valueInput),
        isManualEntry: true,
        isStale: false,
        lastUpdatedAt: enteredAt,
        manualOverride: {
          reason: reasonInput.trim(),
          enteredBy: actorId,
          enteredAt,
          requiresApproval: requiresApprovalInput,
          approvedBy:
            metric.manualOverride?.approvedBy ??
            (requiresApprovalInput ? null : actorId),
          approvedAt:
            metric.manualOverride?.approvedAt ??
            (requiresApprovalInput ? null : enteredAt),
        },
      },
    });
    onClose();
  };

  const footer = (
    <div style={{ display: 'flex', gap: 8 }}>
      <HbcButton variant="secondary" onClick={onClose}>
        Cancel
      </HbcButton>
      <HbcButton variant="primary" onClick={handleSubmit} disabled={!metric}>
        Save override
      </HbcButton>
    </div>
  );

  return (
    <HbcPanel
      open={open}
      onClose={onClose}
      title={metric ? `Edit metric: ${metric.label}` : 'Edit metric'}
      size="md"
      footer={footer}
    >
      <HbcForm
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <HbcFormSection
          title="Manual Override"
          description="Governed inline override for metric correction."
        >
          <HbcTextField
            label="Metric value"
            value={valueInput}
            onChange={setValueInput}
            validationMessage={validation.value}
            required
          />
          <HbcTextField
            label="Reason"
            value={reasonInput}
            onChange={setReasonInput}
            validationMessage={validation.reason}
            required={requiresApprovalInput || requiresApproval}
          />
          <HbcFormRow>
            <HbcCheckbox
              label="Requires approval"
              checked={requiresApprovalInput}
              onChange={setRequiresApprovalInput}
            />
          </HbcFormRow>
        </HbcFormSection>
      </HbcForm>

      <HbcBanner variant="warning">
        Overrides older than {maxOverrideAgeDays} days must be reviewed by
        governance policy.
      </HbcBanner>
      <HbcTypography intent="bodySmall">
        Override actor: {actorId} | Entered at: {enteredAt}
      </HbcTypography>
    </HbcPanel>
  );
};
