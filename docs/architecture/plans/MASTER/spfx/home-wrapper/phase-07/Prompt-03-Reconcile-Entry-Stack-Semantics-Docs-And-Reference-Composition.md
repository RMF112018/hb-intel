Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Critical operating instruction:
Do not re-read files that are already in your current context or memory unless needed to resolve uncertainty or verify drift.

Execution standard:
This prompt is part of a multi-prompt package. Stay tightly scoped to this prompt, but do whatever is required inside scope to reach a real finished state. Do not defer required work. If a boundary, diagnostic, or validation item is necessary for this prompt to be complete, address it now.

Objective:
Reconcile repo comments, doctrine-adjacent code comments, and reference-composition statements so the repo no longer lies about flagship homepage runtime ownership after the embedded-rail change.

Inspect first:
- `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- any touched hbHomepage wrapper runtime files from Prompts 01–02
- any nearby docs/comments directly affected by ownership wording

Current issue:
Several seams currently describe the entry stack as if the flagship homepage production runtime is:
- hero webpart
- actions webpart
- shell webpart

That was accurate for the prior state, but becomes misleading once the flagship homepage embeds the rail inside `HbHomepage`.

At the same time, `mount.tsx` may still legitimately support standalone rail dispatch for non-homepage contexts.

Intended future state:
The repo should clearly distinguish between:
- **canonical entry-stack stage sequence**
- **standalone webpart dispatch capability**
- **flagship homepage runtime ownership**

Required implementation:
1. Update wording in `entryStackOrchestration.ts` so it no longer over-claims that the actions stage is always independently mounted in the flagship homepage production path.
2. Preserve the idea that the rail remains independently mountable as a product surface where that remains true.
3. Update `ReferenceHomepageComposition.tsx` comments so they no longer contradict the new runtime truth.
4. Reconcile `hbHomepageContract.ts` wording where needed so the post-hero / post-actions / shell-facing relationship is stated cleanly and non-ambiguously.
5. Update any nearby touched comments/docs that would otherwise remain misleading after this change.

Acceptance criteria:
- no touched comment or doc falsely states the old flagship runtime model
- standalone rail availability is still documented where true
- shell boundary remains explicit
- the repo can now honestly describe:
  - hero stage
  - actions stage
  - first shell lane
  without semantic confusion

Validation required:
- grep / inspect the touched seams for stale phrases
- include a concise “before vs after wording” summary in the implementation report

What done looks like:
A new engineer can read the touched seams and understand:
- the rail is wrapper-owned on the flagship homepage,
- the rail can still be mounted independently elsewhere if applicable,
- and the shell still begins at shell content rather than becoming a command-band host.
```