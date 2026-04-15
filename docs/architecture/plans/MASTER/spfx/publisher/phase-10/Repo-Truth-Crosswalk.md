# Repo-Truth Crosswalk

## Package inventory
The prior remediation package contained four prompts and no supporting crosswalk or delta artifacts:
1. `Prompt-01-Normalize-resolution-read-failures.md`
2. `Prompt-02-Close-publish-binding-rollback-gap.md`
3. `Prompt-03-Close-archive-withdraw-split-state-gaps.md`
4. `Prompt-04-Make-draft-save-atomic-or-compensating.md`

## Crosswalk by original prompt

### 1. Prompt-01-Normalize-resolution-read-failures.md
**Original target**  
Normalize resolution failures so preview/publish/republish do not receive raw exceptions.

**Original intended outcome**  
Typed failure results plus publishing-error observability.

**Embedded assumptions in the old prompt**
- Resolution builder was the right seam.
- Non-preview resolution failures should become loggable.
- Preview should remain write-free.

**Repo areas implicated**
- `apps/hb-publisher/src/data/publisherAdapter/publishResolutionContext.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- tests around resolution and publish failure classification

**Repo-truth now**
- The assumption is still correct.
- The issue is still open.
- The old prompt under-described the downstream call sites and test obligations.

### 2. Prompt-02-Close-publish-binding-rollback-gap.md
**Original target**  
Prevent the binding row from remaining falsely healthy after late publish failure.

**Original intended outcome**  
Compensate or rewrite the binding row after article-sync/history-append failure.

**Embedded assumptions in the old prompt**
- The main late-failure defect lived on the binding row.
- Page demotion was already the only compensation that existed.
- Master article/history implications were adjacent, but secondary.

**Repo areas implicated**
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/pageBindingWriter.ts`
- publish tests

**Repo-truth now**
- The issue is still open.
- The assumption that the defect is mainly “binding-only” is no longer strong enough.
- Current code leaves a broader split-state surface across page, binding, master article, and workflow history.

### 3. Prompt-03-Close-archive-withdraw-split-state-gaps.md
**Original target**  
Eliminate contradictory archive/withdraw state after page demotion starts.

**Original intended outcome**  
Apply a consistent compensation model when binding update or article update fails after page demotion.

**Embedded assumptions in the old prompt**
- History-append failure was already sufficiently compensated.
- The remaining lifecycle issue lived mainly in the binding-update/article-update windows.

**Repo areas implicated**
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- lifecycle tests

**Repo-truth now**
- The issue is still open.
- The history-append branch must now be included because the current compensation model can revert only the master row while leaving the page and binding demoted.
- This changed the prompt from a narrow cleanup item into a broader lifecycle-failure redesign task.

### 4. Prompt-04-Make-draft-save-atomic-or-compensating.md
**Original target**  
Prevent ambiguous partial persistence on draft save.

**Original intended outcome**  
Move save orchestration into a clearer service seam or add compensation.

**Embedded assumptions in the old prompt**
- Child-list persistence still carried the old destructive rewrite pattern.
- The main risk was article row commit followed by fragile child rewrite.

**Repo areas implicated**
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherRepositories.ts`

**Repo-truth now**
- The closure item remains open.
- The child writers were improved already.
- The remaining closure gap is no longer “replace destructive child rewrite”; it is “introduce a truthful save-orchestration model above the child writers.”

## Net conclusion
The prior package identified the correct remaining workstreams, but three of the four prompts no longer describe the full closure surface accurately enough for a local code agent. The updated package corrects that gap.
