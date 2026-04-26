# Prompt 06 — Testing, Package Proof, and Hosted Proof

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, and SPFx build/package proof standards.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon iframe governance, or Foleon routes unless this prompt explicitly instructs you to do so.

## Objective

Validate the Foleon reader redesign and edge-to-window shell behavior through unit tests, browser layout tests, package proof, and hosted SharePoint proof.

## Required Test Coverage

### Reader Tests

Prove:

- each lane resolves to its intended layout variant;
- preview and production share the same composition frame;
- Project Spotlight does not render Company Pulse support structure;
- Company Pulse does not render Project Spotlight feature structure;
- Leadership Message does not render as a generic media feature card;
- preview sample labeling remains present;
- production iframe governance remains intact.

### Shell Contract Tests

Prove:

- Row 1 Project Spotlight major-left = visual left.
- Row 2 Company Pulse major-right in right-dominant band = visual right.
- Row 3 Leadership Message major-left = visual left.
- Stacked layout = visual full, edge bleed both.
- Existing shell data attributes remain intact.

### Playwright / Browser Proof

JSDOM cannot prove real grid geometry. Add or update Playwright proof to verify:

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth
```

at multiple widths and for each row.

Use `getBoundingClientRect()` to prove:

- left-bleed surfaces align with intended left edge;
- right-bleed surfaces align with intended right edge;
- stacked surfaces align to both sides;
- focusable elements remain inside safe content area.

## Package Proof

Prove generated package includes:

- new layout marker strings:
  - `project-spotlight-feature`
  - `company-pulse-briefing`
  - `leadership-message`
- new shell data attribute strings:
  - `data-shell-slot-visual-side`
  - `data-shell-slot-edge-bleed`
- package version authority matches repo policy.

Prove deprecated generic markers are absent from active paths if removed.

## Hosted Proof

On the hosted SharePoint homepage, capture:

- runtime DOM attribute proof;
- screenshot proof at standard desktop;
- no horizontal overflow proof;
- Row 1/2/3 edge alignment proof;
- hero edge proof if implemented;
- confirmation that Foleon preview and production behavior remain governed.

## Required Output

Create:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/06_TEST_PACKAGE_HOSTED_PROOF.md
```

Include commands run, results, failures, and any unrelated pre-existing failures.

## Do Not

- Do not claim hosted proof passed unless it was actually run against the hosted page.
- Do not infer package inclusion from a successful build alone; inspect generated package contents.
