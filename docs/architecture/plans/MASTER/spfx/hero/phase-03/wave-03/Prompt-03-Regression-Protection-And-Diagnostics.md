# Objective

Add or tighten the minimal regression protection needed so the flagship hero does not slide backward after closure.

## Governing authority
- repo best practices
- homepage doctrine
- audit scorecard’s closure requirements

## Inspect first
- existing hero selector tests
- existing breakpoint tests
- any diagnostics already emitted by hero and launcher paths

## Required outcome
Add or refine the smallest valuable regression coverage for:
- daypart selection
- fallback selection
- breakpoint mode resolution
- any inspectable runtime marker that matters for future hosted audits

Also ensure diagnostics remain useful but not noisy.

## Proof of closure
Provide:
1. tests added/updated
2. runtime markers preserved or improved
3. concise explanation of what future regressions this now catches

## Prohibitions
- no speculative over-testing
- no unrelated refactors
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
