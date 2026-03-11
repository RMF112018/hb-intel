import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseApprovalAuthorityResult } from '../types/UseApprovalAuthorityResult.js';
import type { IApprovalAuthorityRule } from '../types/IApprovalAuthorityRule.js';
import type { ApprovalContext } from '../types/ApprovalContext.js';
import { ApprovalAuthorityApi } from '../api/ApprovalAuthorityApi.js';
import { APPROVAL_RULES_QUERY_KEY } from '../constants/index.js';

const api = new ApprovalAuthorityApi();

/**
 * Hook for managing approval authority rules.
 *
 * @design D-05, D-06, SF17-T04
 */
export function useApprovalAuthority(): UseApprovalAuthorityResult {
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: [...APPROVAL_RULES_QUERY_KEY],
    queryFn: () => api.getRules(),
  });

  const upsertMutation = useMutation({
    mutationFn: (rule: IApprovalAuthorityRule) =>
      api.upsertRule({
        approvalContext: rule.approvalContext,
        approverUserIds: rule.approverUserIds,
        approverGroupIds: rule.approverGroupIds,
        approvalMode: rule.approvalMode,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...APPROVAL_RULES_QUERY_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ruleId: string) => api.deleteRule(ruleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...APPROVAL_RULES_QUERY_KEY] });
    },
  });

  const ruleByContext = useCallback(
    (context: ApprovalContext) =>
      (rules as readonly IApprovalAuthorityRule[]).find(
        (r) => r.approvalContext === context,
      ),
    [rules],
  );

  const upsertRule = useCallback(
    async (rule: IApprovalAuthorityRule) => {
      await upsertMutation.mutateAsync(rule);
    },
    [upsertMutation],
  );

  const deleteRule = useCallback(
    async (ruleId: string) => {
      await deleteMutation.mutateAsync(ruleId);
    },
    [deleteMutation],
  );

  const testEligibility = useCallback(
    async (context: ApprovalContext, userId: string) => {
      return api.testEligibility(context, userId);
    },
    [],
  );

  return {
    rules: rules as readonly IApprovalAuthorityRule[],
    ruleByContext,
    upsertRule,
    deleteRule,
    testEligibility,
    isLoading,
    error: error as Error | null,
  };
}
