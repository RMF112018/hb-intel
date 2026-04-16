# Prompt 01 — Establish premium-stack foundation and owned primitives

## Objective

Close the missing-foundation portion of Wave 02 by adopting the approved premium SPFx stack **where the Publisher actually owns the seam** and by creating any minimal Publisher-owned primitive scaffolding needed for the later prompts.

This prompt is not a symbolic package-install pass.
It is the foundation step that makes later overlay and control-language work executable and internally consistent.

## Why this issue matters

The live Publisher is better than stock enterprise UI, but it still falls short of the governing SPFx doctrine because the missing premium stack is largely absent from the app, while the current package expects later prompts to somehow use it.
That creates a bad execution posture for a code agent:

- dependencies can be installed without being materially used
- usage seams can be chosen inconsistently
- later prompts can re-decide the stack ad hoc
- the final result can become more complex without becoming more premium

Wave 02 needs a deliberate foundation, not symbolic compliance.

## Governing authority / required references

- live repo implementation under `apps/hb-publisher/`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` — apply only where homepage-derived primitives materially affect the Publisher
- current Wave 02 package in this enhanced folder
- do **not** rely on older planning docs as implementation truth

## Exact repo files / symbols / seams to inspect first

- `apps/hb-publisher/package.json`
- `apps/hb-publisher/vite.config.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/index.ts`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/PublisherButton.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/EditorialChip.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/DisclosureSection.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/sharedChrome/AssetLibraryBrowser.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/ProjectPicker.tsx`
- `apps/hb-publisher/src/webparts/articlePublisher/storyBodyEditor/editorToolbar.tsx`
- any Publisher-owned barrel, helper, or primitive file directly coupled to the above seams

Before editing, exhaustively inspect the affected path and any directly-coupled seam it calls into.
Do **not** re-read files already in active context unless you need to confirm drift, dependencies, contradictions, or uncertainty.

## Current-state problem description

Repo truth currently shows:

- `class-variance-authority` and `clsx` are present, but the rest of the approved premium stack is not fully adopted in the Publisher app
- the app still leans on conservative CSS-module primitives and local ad hoc control treatments
- later Wave 02 work cannot honestly prove doctrine-level premiumization unless the missing stack is installed and intentionally wired into real owned seams
- the current package does not clearly define which seams should own the first use of `motion`, `lucide-react`, `@floating-ui/react`, and selected Radix primitives

## Required implementation outcome

Establish a clean, minimal, **actually used** premium-stack foundation for the Publisher.

At minimum:

1. audit the current dependency state and identify exactly which approved packages are still missing
2. add only the missing packages that are truly needed for Wave 02 closure
3. wire those packages into Publisher-owned seams so they are genuinely in use, not just installed
4. create any minimal Publisher-local primitive wrappers or helper seams needed to prevent later prompts from spraying direct usage inconsistently across the app
5. preserve SPFx-safe bundle behavior and do not destabilize the mount/package path

Preferred posture:

- `lucide-react` becomes the default Publisher icon source where a real premium icon system is needed
- `motion` is available for refined state-change / entry / hover / press choreography
- `@floating-ui/react` is available for Publisher-owned anchored overlays and popup positioning
- `@radix-ui/react-slot`, `@radix-ui/react-tooltip`, `@radix-ui/react-separator`, and `@radix-ui/react-scroll-area` are adopted only where they materially simplify robust reusable seams
- `class-variance-authority` and `clsx` remain first-class rather than being bypassed by ad hoc class concatenation

## Dependencies / cross-surface considerations

This prompt is foundational for:

- Prompt 02 overlay modernization
- Prompt 03 control-language and iconography uplift
- Prompt 04 CSS localization / primitive ownership cleanup

Do **not** use this prompt as an excuse to redesign every surface immediately.
The goal here is to establish the dependency and primitive contract that later prompts will consume.

If a helper or wrapper belongs in shared Publisher chrome, put it there.
If a primitive would be artificial or unused, do not create it.

## Validation / proof-of-closure requirements

Prove all of the following:

- every new dependency added in this prompt is materially used by the Publisher app
- no dependency was installed symbolically “for later”
- the chosen owned seams are coherent and reusable by the next prompts
- build and typecheck health remain intact
- the foundation reduces later ambiguity instead of adding architectural noise

Also record:

- which packages were added
- where each one is first used
- what primitive or helper seams were introduced to keep usage disciplined

## Deliverables / closure artifacts

Produce all code, tests, and documentation updates required for full closure of this prompt.
Also produce a concise closure note that records:

- what changed
- what was validated
- what directly-coupled issues had to be closed to finish honestly
- any remaining assumptions that are still materially relevant

## Non-negotiable change-control rule

Do **not** make unrelated changes.
Do **not** widen scope beyond what is necessary for honest closure of this prompt.
If you touch a directly-coupled seam, explain why it was necessary.
Do **not** move on until you can prove closure.
