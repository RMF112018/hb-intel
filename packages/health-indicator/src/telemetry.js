/**
 * Canonical health-indicator telemetry projection helpers.
 *
 * @design D-SF18-T06
 */
function normalizeMetric(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return null;
    }
    return Number(value.toFixed(4));
}
export function createHealthIndicatorKpiSnapshot(metrics, emittedAt = new Date().toISOString()) {
    return {
        timeToReadinessMs: normalizeMetric(metrics.timeToReadinessMs),
        blockerResolutionLatencyMs: normalizeMetric(metrics.blockerResolutionLatencyMs),
        readyToBidRate: normalizeMetric(metrics.readyToBidRate),
        submissionErrorRateReduction: normalizeMetric(metrics.submissionErrorRateReduction),
        checklistCes: normalizeMetric(metrics.checklistCes),
        emittedAt,
    };
}
export function getHealthIndicatorTelemetryView(snapshot, params) {
    if (params.complexity === 'Expert' || params.audience === 'admin') {
        return snapshot;
    }
    if (params.complexity === 'Standard') {
        return {
            ...snapshot,
            checklistCes: snapshot.checklistCes,
        };
    }
    return {
        ...snapshot,
        timeToReadinessMs: null,
        blockerResolutionLatencyMs: null,
        submissionErrorRateReduction: null,
        checklistCes: null,
    };
}
let latestSnapshot = createHealthIndicatorKpiSnapshot({});
export const healthIndicatorKpiEmitter = {
    emit(snapshot) {
        latestSnapshot = createHealthIndicatorKpiSnapshot(snapshot);
        return latestSnapshot;
    },
    getLatest() {
        return latestSnapshot;
    },
    getView(params) {
        return getHealthIndicatorTelemetryView(latestSnapshot, params);
    },
    reset() {
        latestSnapshot = createHealthIndicatorKpiSnapshot({});
    },
};
//# sourceMappingURL=telemetry.js.map