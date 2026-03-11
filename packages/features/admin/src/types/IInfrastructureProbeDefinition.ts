import type { IInfrastructureProbeResult } from './IInfrastructureProbeResult.js';

/**
 * Contract for an infrastructure probe that checks a single subsystem.
 *
 * @design D-04, SF17-T03
 */
export interface IInfrastructureProbeDefinition {
  readonly probeKey: IInfrastructureProbeResult['probeKey'];
  run(nowIso: string): Promise<IInfrastructureProbeResult>;
}
