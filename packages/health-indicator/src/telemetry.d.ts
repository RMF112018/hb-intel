/**
 * Canonical health-indicator telemetry projection helpers.
 *
 * @design D-SF18-T06
 */
export type HealthIndicatorComplexity = 'Essential' | 'Standard' | 'Expert';
export type HealthIndicatorTelemetryAudience = 'canvas' | 'governance' | 'admin';
export interface IHealthIndicatorTelemetrySnapshot {
    readonly timeToReadinessMs: number | null;
    readonly blockerResolutionLatencyMs: number | null;
    readonly readyToBidRate: number | null;
    readonly submissionErrorRateReduction: number | null;
    readonly checklistCes: number | null;
    readonly emittedAt: string;
}
export declare function createHealthIndicatorKpiSnapshot(metrics: Partial<Omit<IHealthIndicatorTelemetrySnapshot, 'emittedAt'>>, emittedAt?: string): IHealthIndicatorTelemetrySnapshot;
export declare function getHealthIndicatorTelemetryView(snapshot: IHealthIndicatorTelemetrySnapshot, params: {
    complexity: HealthIndicatorComplexity;
    audience: HealthIndicatorTelemetryAudience;
}): IHealthIndicatorTelemetrySnapshot;
export declare const healthIndicatorKpiEmitter: {
    emit(snapshot: Partial<Omit<IHealthIndicatorTelemetrySnapshot, "emittedAt">>): IHealthIndicatorTelemetrySnapshot;
    getLatest(): IHealthIndicatorTelemetrySnapshot;
    getView(params: {
        complexity: HealthIndicatorComplexity;
        audience: HealthIndicatorTelemetryAudience;
    }): IHealthIndicatorTelemetrySnapshot;
    reset(): void;
};
//# sourceMappingURL=telemetry.d.ts.map