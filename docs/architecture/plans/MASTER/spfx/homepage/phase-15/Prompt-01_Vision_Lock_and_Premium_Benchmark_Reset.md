# Prompt 01 — Vision Lock and Premium Benchmark Reset

## Objective

Conduct an aggressive repo-truth and subject-matter reset that locks the homepage redesign against a premium purchasable-product standard.  
This prompt exists to prevent the implementation from drifting back into cautious internal-app styling.

## Primary Repos / Surfaces

- `apps/hb-webparts`
- `apps/hb-shell-extension`
- `packages/ui-kit`
- relevant docs under `docs/reference/` and `docs/architecture/`

## Hard Instructions

- Do not reread files that are already in current context or memory.
- Treat the currently rendered homepage screenshots as binding proof that the present UI is unacceptable.
- Do not preserve current patterns merely because they already exist.
- Do not write generic design commentary detached from repo truth.
- Perform exhaustive research on premium SharePoint intranets, premium internal portals, and advanced intranet homepage composition patterns.

## Required Work

1. Audit the current homepage and shell implementation again from the standpoint of **premium product perception**, not technical adequacy.
2. Produce a concise but forceful benchmark brief that defines:
   - what “premium” means here
   - what must never appear in the finished homepage
   - what reference traits the redesign must achieve
3. Build a **homepage anti-pattern register** listing all visual behaviors to eliminate, including:
   - white-card sameness
   - weak section hierarchy
   - placeholder-grade iconography
   - low-tension grid composition
   - overuse of thin borders and light shadows
   - list-like launcher behavior
   - generic search treatment
   - timid top-band treatment
4. Produce a **design decision lock** covering:
   - desired top-band emotional posture
   - desired shell posture
   - desired utility posture
   - desired editorial posture
   - desired operational posture
   - desired discovery posture
5. Map those decisions to exact repo surfaces and ownership boundaries.

## Required Output

Generate a markdown artifact set in the repo or working notes containing:

- `Premium-Benchmark-Brief.md`
- `Homepage-Anti-Pattern-Register.md`
- `HB-Central-Homepage-Perception-Targets.md`

## Success Criteria

This phase succeeds only if the resulting guidance is strong enough to stop later prompts from falling back into safe, generic, internal-app styling.
