import type { IInfrastructureProbeDefinition } from '../types/IInfrastructureProbeDefinition.js';
import type { IInfrastructureProbeResult } from '../types/IInfrastructureProbeResult.js';
import type { IProbeSnapshot } from '../types/IProbeSnapshot.js';
import { PROBE_MAX_RETRY } from '../constants/index.js';

/**
 * Orchestrates infrastructure probe execution with retry, ordering, and snapshot building.
 *
 * @design D-04, SF17-T03
 */
export class ProbeScheduler {
  private readonly probes = new Map<
    IInfrastructureProbeResult['probeKey'],
    IInfrastructureProbeDefinition
  >();
  private readonly insertionOrder: IInfrastructureProbeResult['probeKey'][] =
    [];

  register(probe: IInfrastructureProbeDefinition): void {
    if (this.probes.has(probe.probeKey)) {
      throw new Error(`ProbeScheduler: duplicate probeKey "${probe.probeKey}"`);
    }
    this.probes.set(probe.probeKey, probe);
    this.insertionOrder.push(probe.probeKey);
  }

  get size(): number {
    return this.probes.size;
  }

  getAll(): readonly IInfrastructureProbeDefinition[] {
    return this.insertionOrder.map((k) => this.probes.get(k)!);
  }

  async runAll(nowIso: string): Promise<IInfrastructureProbeResult[]> {
    const ordered = this.getAll();
    const results: IInfrastructureProbeResult[] = [];

    for (const probe of ordered) {
      const result = await this.runWithRetry(probe, nowIso);
      results.push(result);
    }

    return results;
  }

  buildSnapshot(
    results: readonly IInfrastructureProbeResult[],
    snapshotId: string,
    capturedAt: string,
  ): IProbeSnapshot {
    return {
      snapshotId,
      capturedAt,
      results: [...results],
    };
  }

  private async runWithRetry(
    probe: IInfrastructureProbeDefinition,
    nowIso: string,
  ): Promise<IInfrastructureProbeResult> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= PROBE_MAX_RETRY; attempt++) {
      try {
        return await probe.run(nowIso);
      } catch (err) {
        lastError = err;
        if (attempt < PROBE_MAX_RETRY) {
          const delayMs = Math.pow(2, attempt - 1) * 100;
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    }

    return {
      probeId: `${probe.probeKey}-error-${nowIso}`,
      probeKey: probe.probeKey,
      status: 'error',
      summary: `Probe failed after ${PROBE_MAX_RETRY} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
      observedAt: nowIso,
      metrics: {},
      anomalies: [],
    };
  }
}
