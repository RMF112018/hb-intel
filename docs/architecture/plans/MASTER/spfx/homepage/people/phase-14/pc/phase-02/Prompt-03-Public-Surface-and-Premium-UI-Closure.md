# Prompt 03 — Public Surface and Premium UI Closure

## Use

Run this after Prompt 02. This prompt upgrades the People & Culture public and companion presentation to full premium, shared-system compliance.

## Prompt

```text
You are working in the live local `hb-intel` repository with direct file-system access.

Your mission is to bring the People & Culture public surface and companion presentation layer to full premium UI compliance, aligned with the shared UI doctrine and without weakening the product split boundary.

IMPORTANT OPERATING RULE:
Do not re-read files that are still in your active context or memory. Reuse current context first. Only open additional files when needed to progress, verify, or resolve uncertainty.

Primary objective:
Replace the remaining overly local, inline, width-constrained, or underwhelming People & Culture presentation patterns with production-grade premium surfaces that align with the current `@hbc/ui-kit/homepage` doctrine.

Minimum focus areas:
- `apps/hb-webparts/src/webparts/peopleCulturePublic/`
- `apps/hb-webparts/src/webparts/peopleCultureCompanion/`
- `packages/ui-kit/src/homepage.ts`
- any relevant shared surface family implementations already in `packages/ui-kit`
- relevant UI doctrine and review docs under `docs/architecture/reviews/` and `docs/reference/ui-kit/` if present

Locked constraints:
- do not recouple HB Kudos into the People & Culture public surface
- do not force the new public surface back through the legacy merged People & Culture surface
- preserve package boundaries
- prefer governed shared surface primitives or new shared surface families over deeper local inline styling

Required remediation goals:

1. Public surface quality
- upgrade the People & Culture public webpart from a narrow local inline surface to a signature-grade premium implementation
- keep the non-recognition scope intact
- support strong editorial hierarchy for featured and supporting content
- remove unnecessary width bottlenecks
- ensure the surface looks intentional and premium on modern SharePoint canvases

2. Companion visual system
- upgrade the HR operating companion from a basic local inline console into a polished premium operating surface
- unify shell, card, tab, chip, list, panel, and detail interactions
- reduce visual dead space and weak information density
- use shared primitives/surfaces where appropriate instead of maintaining a separate parallel design system in `companionStyles.ts`

3. Shared-system promotion
- if the repo lacks a shared People & Culture public surface family or companion-grade operating-shell primitives, add them in the correct shared location
- wire the webparts to those shared surfaces
- keep the shared surface generic enough to be governed and reusable, but not so generic that it becomes vague or low-quality

4. Visual compliance
- align with premium homepage/surface doctrine in the repo
- ensure the result clearly exceeds template-like white-card SharePoint UI
- make the result feel like a first-class HB Central signature application, not a temporary internal scaffold

Implementation requirements:
- keep the runtime logic thin where shared UI should own the visual grammar
- preserve semantics and data contracts while improving the surface
- update stories/tests where the shared UI layer warrants it
- update relevant review docs if you materially change the shared surface direction

Required validation:
- the public surface is no longer primarily driven by one-off inline styling
- the companion is materially more polished and shared-system aligned
- full-width / wide-layout presentation is improved
- no HB Kudos coupling is introduced
- build passes for affected packages/apps

Required output:
- summary of UI-system changes
- what was promoted to shared UI vs left local and why
- files changed
- validation performed
```