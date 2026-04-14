# Closure — Stale publisher comments & narrative cleanup (Phase-05 Prompt-06)

## Objective closed
After Prompts 01-05 corrected TemplateKey, TargetSiteUrl back-sync, archive/withdraw master sync, actor attribution, and promotion-rule narrative, several header comments still described the pre-remediation picture ("pending later Phase-02 prompts", "seven Project Spotlight lists", "not yet realigned"). Those narratives no longer matched the code. Comment-only scrub, no functional changes.

## Files changed (prose only)
- **`apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`**
  - Module header: removed the "pending later Phase-02 remediation prompts" scheduling language; enumerated which non-master enums are retained (e.g. `HeroRendererKind`, `PostFamily`, `TargetSiteKey`, `BindingStatus`, `LastOperation`, `TemplateStatus`) and stated they exist because compositor / row-mapper plumbing still reads their literal shapes — not because a realignment is outstanding.
  - "Legacy / non-master-record enums" section heading + comment rewritten to say the realignment IS complete for contracts; the enums themselves are retained for plumbing.
  - `PostFamily` comment narrowed: no longer claims "not yet realigned"; points at `ContentTypes` (MultiChoice of `ArticleContentType`) as the tenant shape.
  - `TargetSiteKey` comment narrowed: no longer claims "still referenced by the PageBinding child-row contract"; points at `Destination` + `resolveDestinationSiteUrl` as the authoritative path.
- **`apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`**
  - Module header no longer says `TemplateRegistry` "still carries the pre-tenant-audit shape pending its own realignment prompt"; states the realigned tenant shape (`IsActive` / `VersionLabel` / `ContentTypes` / `Destination` / `PageShellTemplateKey` / profile keys / block toggles).
- **`apps/hb-webparts/src/mount.tsx`**
  - Article Publisher renderer comment: "seven Project Spotlight lists" replaced with the actual `HB Article*` list family (eight lists enumerated). Clarifies that `companyPulse` is on the tenant Choice but not wired (points at `SUPPORTED_DESTINATIONS`).

## Still accurate, left untouched
- `DESTINATION_VALUES` comment ("companyPulse… future destination, not yet implemented") — matches reality (Phase-04 Prompt-10 gate).
- `PublishStatus` comment ("Replaces the prior `BindingStatus` enum") — historical accuracy.
- `PublisherArticleRow` removed-columns list — remains correct.
- Per Prompt-04 closure, orchestrator header is accurate.
- Per Prompt-05 closure, `promotionRuleSelector.ts` is accurate.

## Proof of "no functional change"
- Only JSDoc / line-comment regions touched.
- `pnpm exec tsc --noEmit` — clean.
- Versions bumped only to reflect the docs change for the SPFx manifest counter.

## Verification
- `pnpm exec tsc --noEmit` — clean.
- (No test file touched; no behavior change to assert.)
- Manifest bump: feature `1.0.0.263` / solution `1.0.0.252`.
