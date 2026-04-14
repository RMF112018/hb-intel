# Close the stranded scheduled workflow branch
You are working in the live local HB Intel repo.

Repo root:
`/Users/bobbyfetting/hb-intel`

Critical operating instruction:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Branch / implementation authority:
- the live repo working tree based on `main`

Primary schema authority:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

Primary audit basis for this remediation set:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- the current `Article Publisher` source under `apps/hb-webparts/src/webparts/articlePublisher/`
- the current publisher adapter stack under `apps/hb-webparts/src/homepage/data/publisherAdapter/`

Execution posture:
- This is a bounded remediation task, not a broad redesign.
- Close the named issue completely.
- Preserve tenant-aligned `HB Article*` terminology and list bindings.
- Do not make unrelated refactors.
- Do not weaken existing tenant-alignment work.
- Update comments/tests/docs only where needed to keep repo truth aligned with implementation.
- When a fix depends on another already-numbered prompt in this package, honor the package order and do not paper over the dependency.

Required working style:
- Inspect the exact files named in this prompt first.
- Trace the full code path end to end before changing code.
- After changes, scrub adjacent code for drift so the named issue is actually closed.
- Add or update targeted tests where the repo has a reasonable test seam.
- In your final response, provide:
  1. what changed,
  2. why the issue is now closed,
  3. any remaining risks or follow-up dependencies.

Issue reference:
- `P1-1` from the publisher backend audit findings register

Inspect first:
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`

Objective:
Resolve the currently stranded `scheduled` workflow branch.

Issue to close:
The workflow allows `approved -> scheduled`, but the current UI only enables Publish from `approved`, and no scheduled publish executor was found.

Required outcomes:
- Either scheduled publishing becomes a real supported branch, or it is removed/disabled for the current sprint.
- The state machine, UI controls, and operational behavior must agree.

Required work:
1. Determine whether `scheduled` is actually in scope now.
2. If in scope:
   - add the missing scheduled execution path,
   - define prerequisites and fulfillment behavior,
   - ensure workflow history/state changes are coherent.
3. If not in scope:
   - remove or disable the scheduled transition path,
   - update UI/state-machine/comments so the branch is not exposed as operational.
4. Add targeted proof that no workflow branch exists without an execution path.

Acceptance standard:
- Operators cannot move an article into a dead-end state.
- Workflow semantics in code and UI are aligned.

Required closure proof:
- Identify the exact code path that was broken before the fix.
- Show the exact seam that now enforces the intended behavior.
- Note any tests added/updated.
- Call out any intentionally deferred follow-up work, but only if the named issue is fully closed.
