import { type FC, useState, useCallback } from 'react';
import { HbcButton, HbcBanner } from '@hbc/ui-kit';
import type { IApprovalAuthorityRule } from '../types/IApprovalAuthorityRule.js';

export interface ApprovalRuleEditorProps {
  readonly rule?: IApprovalAuthorityRule;
  readonly onSave: (rule: IApprovalAuthorityRule) => Promise<void>;
  readonly onCancel: () => void;
}

/**
 * Editor component for creating and modifying approval authority rules.
 *
 * @design D-05, D-06, SF17-T06
 */
export const ApprovalRuleEditor: FC<ApprovalRuleEditorProps> = ({
  rule,
  onSave,
  onCancel,
}) => {
  const [approverUserIds, setApproverUserIds] = useState(
    rule?.approverUserIds.join(', ') ?? '',
  );
  const [approverGroupIds, setApproverGroupIds] = useState(
    rule?.approverGroupIds.join(', ') ?? '',
  );
  const [approvalMode, setApprovalMode] = useState<'any' | 'all'>(
    rule?.approvalMode ?? 'any',
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const userIds = approverUserIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const groupIds = approverGroupIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (userIds.length === 0 && groupIds.length === 0) {
      setValidationError('At least one approver user or group is required.');
      return;
    }

    setValidationError(null);
    setIsSaving(true);
    try {
      await onSave({
        ruleId: rule?.ruleId ?? '',
        approvalContext: rule?.approvalContext ?? 'provisioning-task-completion',
        approverUserIds: userIds,
        approverGroupIds: groupIds,
        approvalMode,
        lastModifiedBy: rule?.lastModifiedBy ?? '',
        lastModifiedAt: rule?.lastModifiedAt ?? new Date().toISOString(),
      });
    } finally {
      setIsSaving(false);
    }
  }, [approverUserIds, approverGroupIds, approvalMode, rule, onSave]);

  return (
    <form
      aria-label="Approval rule editor"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSave();
      }}
    >
      <div>
        <label htmlFor="approverUserIds">
          Approver User IDs <span aria-hidden="true">*</span>
        </label>
        <input
          id="approverUserIds"
          type="text"
          value={approverUserIds}
          onChange={(e) => setApproverUserIds(e.target.value)}
          placeholder="Comma-separated user IDs"
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="approverGroupIds">
          Approver Group IDs <span aria-hidden="true">*</span>
        </label>
        <input
          id="approverGroupIds"
          type="text"
          value={approverGroupIds}
          onChange={(e) => setApproverGroupIds(e.target.value)}
          placeholder="Comma-separated group IDs"
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="approvalMode">Approval Mode</label>
        <select
          id="approvalMode"
          value={approvalMode}
          onChange={(e) => setApprovalMode(e.target.value as 'any' | 'all')}
        >
          <option value="any">Any (one approver sufficient)</option>
          <option value="all">All (all approvers required)</option>
        </select>
      </div>

      {validationError && (
        <div role="alert">
          <HbcBanner variant="error">
            {validationError}
          </HbcBanner>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <HbcButton type="submit" variant="primary" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </HbcButton>
        <HbcButton type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </HbcButton>
      </div>
    </form>
  );
};
