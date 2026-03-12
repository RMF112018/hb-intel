export interface IHealthPulseAuthContext {
  canWriteProjectHealth: boolean;
  canApproveOverrides: boolean;
  isAdmin: boolean;
}

export interface IHealthPulseInlineEditGateInput {
  auth: IHealthPulseAuthContext;
  metricKey: string;
  editableMetricKeys?: readonly string[];
}

export interface IHealthPulseApprovalVisibilityInput {
  auth: IHealthPulseAuthContext;
  requiresApproval: boolean;
}

/**
 * Explicit deny-by-default gate for inline metric edits.
 */
export const canEditHealthPulseMetric = (input: IHealthPulseInlineEditGateInput): boolean => {
  if (!input.auth.canWriteProjectHealth) {
    return false;
  }

  if (!input.editableMetricKeys || input.editableMetricKeys.length === 0) {
    return false;
  }

  return input.editableMetricKeys.includes(input.metricKey);
};

/**
 * Approval metadata is visible only when required and user has governance visibility.
 */
export const canViewHealthPulseApproval = (input: IHealthPulseApprovalVisibilityInput): boolean => {
  if (!input.requiresApproval) {
    return false;
  }

  return input.auth.canApproveOverrides || input.auth.isAdmin;
};

export const canManageHealthPulseAdminConfig = (auth: IHealthPulseAuthContext): boolean => auth.isAdmin;
