/**
 * Canonical health-indicator runtime primitives.
 *
 * Runtime logic is deterministic and side-effect free to support adapter-level
 * reuse across shared features without duplicating scoring engines.
 *
 * @design D-SF18-T06
 */
export type HealthIndicatorStatus = 'ready' | 'nearly-ready' | 'attention-needed' | 'not-ready';
export type HealthIndicatorScoringBand = 'excellent' | 'strong' | 'moderate' | 'weak';
export interface IHealthIndicatorVersionedRecord {
    readonly recordId: string;
    readonly version: number;
    readonly updatedAt: string;
    readonly updatedBy: string;
    readonly source: string;
    readonly correlationId: string;
}
export interface IHealthIndicatorGovernanceMetadata {
    readonly governanceState: string;
    readonly recordedAt: string;
    readonly recordedBy: string;
    readonly traceId: string;
    readonly immutableSnapshotId: string;
    readonly telemetryKeys: readonly string[];
}
export interface IHealthIndicatorCompletenessMetadata {
    readonly requiredCount: number;
    readonly completedCount: number;
    readonly missingCount: number;
    readonly completionPercent: number;
}
export interface IHealthIndicatorCriterion {
    readonly criterionId: string;
    readonly label: string;
    readonly weight: number;
    readonly isBlocker: boolean;
    readonly isComplete: boolean;
    readonly actionHref: string;
    readonly completeness: IHealthIndicatorCompletenessMetadata;
    readonly assignee?: {
        readonly userId: string;
    } | null;
    readonly risk?: {
        readonly confidence: 'low' | 'medium' | 'high';
    };
}
export interface IHealthIndicatorProfile {
    readonly profileId: string;
    readonly criteria: readonly IHealthIndicatorCriterion[];
    readonly thresholds: {
        readonly readyMinScore: number;
        readonly nearlyReadyMinScore: number;
        readonly attentionNeededMinScore: number;
    };
}
export interface IHealthIndicatorCriterionOverride {
    readonly criterionId: string;
    readonly label?: string;
    readonly weight?: number;
    readonly isBlocker?: boolean;
    readonly actionHref?: string;
}
export interface IHealthIndicatorAdminOverride {
    readonly profileId?: string;
    readonly criteria?: readonly IHealthIndicatorCriterionOverride[];
    readonly thresholds?: Partial<IHealthIndicatorProfile['thresholds']>;
    readonly governance?: Partial<IHealthIndicatorGovernanceMetadata>;
    readonly version?: IHealthIndicatorVersionedRecord;
}
export interface IHealthIndicatorResolvedConfig {
    readonly profile: IHealthIndicatorProfile;
    readonly governance: IHealthIndicatorGovernanceMetadata;
    readonly version: IHealthIndicatorVersionedRecord;
    readonly source: 'baseline' | 'admin-override' | 'fallback';
    readonly fallbackApplied: boolean;
    readonly validationErrors: readonly string[];
}
export interface IHealthIndicatorReadinessScore {
    readonly value: number;
    readonly status: HealthIndicatorStatus;
    readonly band: HealthIndicatorScoringBand;
    readonly computedAt: string;
}
export interface IHealthIndicatorCategoryBreakdown {
    readonly categoryId: string;
    readonly label: string;
    readonly dimension: string;
    readonly score: number;
    readonly maxScore: number;
    readonly completionPercent: number;
    readonly blockerCount: number;
}
export interface IHealthIndicatorRecommendationAction {
    readonly actionId: string;
    readonly label: string;
    readonly actionHref: string;
    readonly ownerUserId?: string;
}
export interface IHealthIndicatorRecommendation {
    readonly recommendationId: string;
    readonly category: string;
    readonly priority: 'critical' | 'high' | 'medium' | 'low';
    readonly title: string;
    readonly summary: string;
    readonly actions: readonly IHealthIndicatorRecommendationAction[];
}
export interface IHealthIndicatorSummary {
    readonly score: IHealthIndicatorReadinessScore;
    readonly completeness: IHealthIndicatorCompletenessMetadata;
    readonly categoryBreakdown: readonly IHealthIndicatorCategoryBreakdown[];
    readonly recommendations: readonly IHealthIndicatorRecommendation[];
    readonly governance: IHealthIndicatorGovernanceMetadata;
}
/**
 * Resolves effective profile config with deterministic validation and fallback.
 *
 * @design D-SF18-T06
 */
export declare function resolveHealthIndicatorProfileConfig(params: {
    baseline: IHealthIndicatorProfile;
    override?: IHealthIndicatorAdminOverride | null;
    telemetryKeys: readonly string[];
    defaultVersion: IHealthIndicatorVersionedRecord;
    defaultGovernance: Omit<IHealthIndicatorGovernanceMetadata, 'telemetryKeys'>;
}): IHealthIndicatorResolvedConfig;
/**
 * Builds deterministic readiness summary from criteria and resolved config.
 *
 * @design D-SF18-T06
 */
export declare function buildHealthIndicatorSummary(criteria: readonly IHealthIndicatorCriterion[], config: Pick<IHealthIndicatorResolvedConfig, 'profile' | 'governance'>, computedAt?: string): IHealthIndicatorSummary;
//# sourceMappingURL=runtime.d.ts.map