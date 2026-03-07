/**
 * Overall status of the provisioning saga orchestrator.
 */
export type ProvisioningOverallStatus = 'NotStarted' | 'InProgress' | 'BaseComplete' | 'Completed' | 'Failed' | 'WebPartsPending';
/**
 * Execution status of an individual saga step.
 */
export type SagaStepStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Failed' | 'Skipped' | 'DeferredToTimer';
//# sourceMappingURL=ProvisioningEnums.d.ts.map