import type { IVersionMetadata } from '@hbc/versioned-record';
import type { PostBidLearningSignal } from '@hbc/post-bid-autopsy';
import {
  BENCHMARK_MIN_SAMPLE_SIZE,
} from '../constants/index.js';
import {
  computeDistanceToWinZone,
  computeZoneRange,
  deriveConfidence,
  hasZoneOverlap,
} from '../model/lifecycle/index.js';
import {
  mapPostBidLearningSignalToRecalibrationSignal,
} from '../model/recalibration/index.js';
import type {
  IBenchmarkFilterContext,
  IPredictiveDriftMonitorResult,
  IPredictiveDriftMonitorWindow,
  IRecalibrationSignal,
  IRecomputeResult,
  IScoreGhostOverlayState,
  ISnapshotFreezeResult,
} from '../types/index.js';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export class ScoreBenchmarkLifecycleApi {
  private overlays: IScoreGhostOverlayState[];
  private emittedSignals: IRecalibrationSignal[] = [];

  constructor(seedOverlays: IScoreGhostOverlayState[] = []) {
    this.overlays = clone(seedOverlays);
  }

  runScheduledRecompute(): IRecomputeResult {
    let updatedBenchmarks = 0;
    let emittedSignals = 0;

    this.overlays = this.overlays.map((overlay) => {
      const recomputedBenchmarks = overlay.benchmarks.map((benchmark) => {
        updatedBenchmarks += 1;

        const confidence = deriveConfidence({
          sampleSize: benchmark.sampleSize,
          similarityScore: benchmark.similarity.overallSimilarity,
          recencyScore: benchmark.confidence.recencyScore,
          completenessScore: benchmark.confidence.completenessScore,
        });

        if (confidence.tier === 'insufficient') {
          emittedSignals += 1;
        }

        return {
          ...benchmark,
          confidence,
        };
      });

      const winZone = computeZoneRange(
        recomputedBenchmarks
          .map((benchmark) => benchmark.winAvg)
          .filter((value): value is number => value !== null)
      );

      const lossZone = computeZoneRange(
        recomputedBenchmarks
          .map((benchmark) => benchmark.lossAvg)
          .filter((value): value is number => value !== null)
      );

      return {
        ...overlay,
        benchmarks: recomputedBenchmarks,
        overallWinZoneMin: winZone.min,
        overallWinZoneMax: winZone.max,
        lossRiskOverlap: hasZoneOverlap(winZone, lossZone),
        distanceToWinZone: computeDistanceToWinZone(overlay.overallWinAvg, winZone.min),
        benchmarkGeneratedAt: new Date().toISOString(),
      };
    });

    return {
      jobType: 'scheduled',
      processedEntities: this.overlays.length,
      updatedBenchmarks,
      emittedSignals,
      computedAt: new Date().toISOString(),
    };
  }

  runOnDemandRecompute(
    filterContext: IBenchmarkFilterContext,
    requestedBy: string
  ): IRecomputeResult {
    const scheduled = this.runScheduledRecompute();

    this.overlays = this.overlays.map((overlay) => ({
      ...overlay,
      filterContext,
      syncStatus: 'queued-to-sync',
      version: {
        ...overlay.version,
        changeSummary: `On-demand recompute requested by ${requestedBy}`,
      },
    }));

    return {
      ...scheduled,
      jobType: 'on-demand',
    };
  }

  runPredictiveDriftMonitor(window: IPredictiveDriftMonitorWindow): IPredictiveDriftMonitorResult {
    const signals: IRecalibrationSignal[] = [];

    for (const overlay of this.overlays) {
      const drift = Math.max(0, (overlay.telemetry.predictiveAccuracyByCriterion ?? 0) - window.driftThreshold);
      if (drift > 0 || overlay.benchmarks.some((benchmark) => benchmark.sampleSize < BENCHMARK_MIN_SAMPLE_SIZE)) {
        signals.push({
          signalId: `${overlay.version.snapshotId}-${signals.length + 1}`,
          predictiveDrift: drift,
          triggeredBy: 'scheduled-monitor',
          correlationKeys: [overlay.version.snapshotId],
          triggeredAt: new Date().toISOString(),
        });
      }
    }

    this.emittedSignals = [...this.emittedSignals, ...signals];

    return {
      window,
      emittedSignals: clone(signals),
    };
  }

  emitRecalibrationSignals(signals: IRecalibrationSignal[]): { emittedCount: number } {
    this.emittedSignals = [...this.emittedSignals, ...clone(signals)];
    return { emittedCount: signals.length };
  }

  consumePublishedLearningSignals(
    signals: readonly PostBidLearningSignal[]
  ): { consumedSignals: number; emittedSignals: IRecalibrationSignal[] } {
    const emittedSignals = signals.map(mapPostBidLearningSignalToRecalibrationSignal);
    this.emittedSignals = [...this.emittedSignals, ...clone(emittedSignals)];

    this.overlays = this.overlays.map((overlay) => ({
      ...overlay,
      recalibrationSignals: [...overlay.recalibrationSignals, ...clone(emittedSignals)],
      syncStatus: 'queued-to-sync',
    }));

    return {
      consumedSignals: signals.length,
      emittedSignals: clone(emittedSignals),
    };
  }

  freezeSnapshot(entityId: string, snapshotReason: string): ISnapshotFreezeResult {
    const overlay = this.overlays.find((item) => item.version.snapshotId === entityId) ?? this.overlays[0];

    if (!overlay) {
      throw new Error('No overlay state available to freeze.');
    }

    const frozenAt = new Date().toISOString();

    const version: IVersionMetadata = {
      ...overlay.version,
      changeSummary: `Snapshot frozen: ${snapshotReason}`,
      createdAt: frozenAt,
    };

    return {
      entityId,
      snapshotReason,
      frozenAt,
      version,
    };
  }
}
