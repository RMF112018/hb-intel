/**
 * Emit phase-start marker to the registered startup timing bridge.
 */
export function startStartupPhase(phase, metadata) {
    getBridge()?.startPhase(phase, metadata);
}
/**
 * Emit phase-end marker to the registered startup timing bridge.
 */
export function endStartupPhase(phase, metadata) {
    getBridge()?.endPhase(phase, metadata);
}
/**
 * Emit direct phase-duration record to the registered startup timing bridge.
 */
export function recordStartupPhase(phase, durationMs, metadata) {
    getBridge()?.recordPhase(phase, durationMs, metadata);
}
function getBridge() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return globalThis.__HBC_STARTUP_TIMING_BRIDGE__;
}
//# sourceMappingURL=startupTimingBridge.js.map