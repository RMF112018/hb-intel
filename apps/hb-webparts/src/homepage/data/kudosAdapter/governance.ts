/**
 * Kudos domain-adapter — governance actions.
 *
 * Re-exports the high-level governance dispatchers from the writer
 * so Layer 3 consumers do not import the low-level writer module
 * directly.
 *
 * `applyKudosPatch` is the adapter-friendly alias for
 * `submitKudosGovernanceAction` — the writer's end-to-end entry
 * point that looks up item meta, resolves the actor, executes the
 * `KudosPatch` under the MERGE/ETag contract, and writes the
 * corresponding audit event.
 */
export {
  submitKudosGovernanceAction,
  submitKudosGovernanceAction as applyKudosPatch,
  executeKudosPatch,
  buildKudosPatchPlan,
  fetchProminenceSlotState,
  type KudosGovernanceResult,
} from '../kudosGovernanceWriter.js';
