# Prompt-02-Strengthen-Card-Identity-and-Access-Confidence.md

## Objective
Increase scan speed and click confidence by strengthening project identity cues and adding non-deceptive access / launch-confidence treatment.

## Governing authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- current Project Sites source under `packages/spfx/src/webparts/projectSites/`

## Inspect these exact repo seams
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/types.ts`
- any relevant tests

## Current future-state gap to close
The cards are visually polished but still too thin for maximum confidence in large mixed scopes. They also give little help around whether a destination is expected to launch cleanly or may depend on downstream permissions.

## Required implementation outcome
1. Add higher-value identity metadata that helps users distinguish similar projects quickly.
2. Improve hierarchy so the most decision-useful metadata is visible without bloating the card.
3. Add access-confidence / launch-confidence cues that are truthful and non-speculative.
4. Keep the surface operational, premium, and fast to scan.

## Closure proof required
- show the final card information hierarchy
- explain why the new metadata improves confident choice
- show how access / launch cues avoid overclaiming
- update tests accordingly

## Guardrails
- do not turn cards into dense admin sheets
- do not add metadata that is available but not useful
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
