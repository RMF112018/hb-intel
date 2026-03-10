import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  IHandoffConfig,
  IHandoffDocument,
  IPreflightResult,
  IPreflightCheck,
  IUsePrepareHandoffResult,
  IBicOwner,
} from '../types/IWorkflowHandoff';

/**
 * Assembles a handoff package from a source record and config.
 *
 * Assembly steps (D-03, D-04, D-06):
 * 1. Run pre-flight validation synchronously (D-03)
 * 2. Run mapSourceToDestination synchronously (D-04: frozen at assembly time)
 * 3. Run resolveDocuments asynchronously (D-06: async URL resolution)
 * 4. Run resolveRecipient synchronously
 *
 * The assembled package is held in component state — not persisted until the
 * sender calls HandoffApi.create() from HbcHandoffComposer Step 4 (send).
 *
 * @param sourceRecord - The current source record (should be stable; re-assembly on change)
 * @param config       - The handoff route configuration
 * @param currentUser  - The user composing the handoff (sender identity)
 * @param enabled      - Set false to skip assembly (e.g., until user opens the Composer)
 */
export function usePrepareHandoff<TSource, TDest>(
  sourceRecord: TSource | null,
  config: IHandoffConfig<TSource, TDest>,
  currentUser: IBicOwner,
  enabled = true
): IUsePrepareHandoffResult<TSource, TDest> {
  const [isAssembling, setIsAssembling] = useState(false);
  const [isError, setIsError] = useState(false);
  const [preflight, setPreflight] = useState<IPreflightResult | null>(null);
  const [assembledPackage, setAssembledPackage] = useState<
    IUsePrepareHandoffResult<TSource, TDest>['package']
  >(null);

  // Track whether a reassembly was requested
  const reassembleCount = useRef(0);

  const assemble = useCallback(async () => {
    if (!sourceRecord || !enabled) return;

    setIsAssembling(true);
    setIsError(false);

    try {
      // Step 1: Pre-flight validation (D-03 — synchronous)
      const blockingReason = config.validateReadiness(sourceRecord);
      const preflightResult: IPreflightResult = {
        isReady: blockingReason === null,
        blockingReason,
        checks: buildPreflightChecks(blockingReason),
      };
      setPreflight(preflightResult);

      // Step 2: Map source → destination seed data (D-04 — synchronous, frozen at this moment)
      const destinationSeedData = config.mapSourceToDestination(sourceRecord);

      // Step 3: Resolve documents (D-06 — async)
      let documents: IHandoffDocument[] = [];
      try {
        documents = await config.resolveDocuments(sourceRecord);
      } catch (err) {
        // Document resolution failure is non-fatal; proceed with empty list
        console.warn('[usePrepareHandoff] resolveDocuments failed:', err);
      }

      // Step 4: Resolve recipient (synchronous; null = sender must pick manually in Step 3)
      const recipient = config.resolveRecipient(sourceRecord);

      setAssembledPackage({
        sourceModule: config.sourceModule,
        sourceRecordType: config.sourceRecordType,
        sourceRecordId: (sourceRecord as { id?: string }).id ?? '',
        destinationModule: config.destinationModule,
        destinationRecordType: config.destinationRecordType,
        sourceSnapshot: sourceRecord,
        destinationSeedData,
        documents,
        contextNotes: [],    // Sender populates context notes in Composer Step 2
        sender: currentUser,
        recipient: recipient ?? currentUser, // Fallback; Composer Step 3 surfaces override if null
      });
    } catch (err) {
      console.error('[usePrepareHandoff] assembly error:', err);
      setIsError(true);
    } finally {
      setIsAssembling(false);
    }
  }, [sourceRecord, config, currentUser, enabled]);

  // Trigger assembly when source record or enabled state changes
  useEffect(() => {
    assemble();
  }, [assemble, reassembleCount.current]);

  const reassemble = useCallback(() => {
    reassembleCount.current += 1;
    assemble();
  }, [assemble]);

  return {
    package: assembledPackage,
    preflight,
    isAssembling,
    isError,
    reassemble,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Preflight check builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a blocking reason string into a structured check list for display
 * in HbcHandoffComposer Step 1.
 *
 * Real implementations may return multiple named checks by extending
 * IHandoffConfig with an optional `getPreflightChecks` method.
 * For the initial implementation, a single check is derived from validateReadiness.
 */
function buildPreflightChecks(blockingReason: string | null): IPreflightCheck[] {
  if (blockingReason === null) {
    return [
      { label: 'Record is ready for handoff', passed: true },
    ];
  }
  return [
    { label: blockingReason, passed: false },
  ];
}
