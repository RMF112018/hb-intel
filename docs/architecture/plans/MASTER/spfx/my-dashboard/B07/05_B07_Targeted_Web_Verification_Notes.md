# 05 — B07 Targeted Web Verification Notes

## Purpose

This note records the narrow current external-verification posture supporting B07’s load-bearing hosted-validation, Playwright, and accessibility claims. It is not a new research paper and does not expand B07 scope.

---

# 1. Full-width SPFx communication-site validation

## Verified
Microsoft’s current SharePoint Framework guidance states that:
- full-width columns are a communication-site host behavior,
- SPFx web parts must set `supportsFullBleed: true` to be available in full-width sections,
- the SharePoint workbench does **not** validate full-width communication-site behavior,
- the web part should be tested on a deployed communication site.

## B07 implication
B07’s release gate remains correct:
- hosted SharePoint communication-site proof is mandatory,
- workbench/local/Vite/package-only proof is insufficient for final acceptance.

Primary reference:
- Microsoft Learn — Use web parts with the full-width column

---

# 2. Playwright authentication state is sensitive

## Verified
Playwright’s current authentication guidance says:
- authenticated state is commonly persisted to the file system and reused with `storageState`,
- the state file may contain cookies and headers that could impersonate a user or test account,
- Playwright strongly discourages committing those files to repositories.

## B07 implication
B07’s evidence posture remains correct:
- storage state must live outside the repo,
- evidence writers/completeness assemblers must exclude or redact auth/session/token paths,
- curated evidence must never include raw auth state.

Primary reference:
- Playwright — Authentication

---

# 3. Locator strategy

## Verified
Playwright recommends:
- role-based locators for interactive elements where possible,
- user-facing locators as a resilient default,
- explicit test IDs / configured test attributes where a stable contract is needed and user-facing locators are insufficient.

## B07 implication
B07’s locator posture remains appropriate:
- use roles and accessible names for tabs, buttons, links, and tabpanels,
- use `data-my-work-*` attributes as durable evidence seams rather than brittle CSS structure.

Primary reference:
- Playwright — Locators

---

# 4. Screenshot evidence variability

## Verified
Playwright’s visual-comparison guidance warns that screenshots vary by:
- operating system,
- browser version,
- rendering settings,
- hardware,
- power mode,
- headless/headed differences.

## B07 implication
B07’s screenshot posture remains correct:
- screenshots are curated review support,
- they should not be the sole proof of host-fit or responsive correctness,
- they should be paired with DOM measurements, overflow/clipping checks, and state summaries.

Primary reference:
- Playwright — Visual comparisons

---

# 5. Tabs/tabpanel semantics

## Verified
WAI-ARIA APG’s tabs pattern defines:
- `tablist`,
- `tab`,
- `tabpanel`,
- one visible tab panel at a time,
- `aria-controls`,
- `aria-selected`,
- `aria-labelledby`,
- keyboard interaction expectations.

## B07 implication
B07 is correct to require hosted validation of:
- active panel ownership,
- accessible tab semantics,
- keyboard navigation behavior for the My Work shell.

Primary reference:
- WAI-ARIA Authoring Practices Guide — Tabs Pattern

---

# 6. Status-message semantics

## Verified
W3C Technique ARIA22 states that:
- `role="status"` provides an implicit polite live-region mechanism,
- status messages can be announced without moving focus,
- `aria-atomic="true"` may be added when the entire container should be announced.

## B07 implication
B07’s recommendation remains sound:
- refresh/degraded-state notices should be validated for non-disruptive status semantics where used,
- routine async updates should not steal focus.

Primary reference:
- W3C/WAI Technique ARIA22

---

# 7. Descriptive link text

## Verified
W3C Technique G91 states that link text should describe the purpose of the link so users can distinguish destinations and decide whether to follow them.

## B07 implication
B07’s Adobe source-link guidance remains correct:
- descriptive text such as `Open in Adobe Sign` is materially better than generic `Open` or `View`,
- link-purpose validation belongs in the hosted/accessibility matrix.

Primary reference:
- W3C/WAI Technique G91

---

# 8. Package conclusion

The external verification supports preserving B07’s validation/evidence decisions as closed planning authority. No contradiction was found that would require weakening:
- hosted communication-site proof,
- storage-state secrecy,
- role-first locator strategy,
- screenshot-plus-structure evidence posture,
- accessible tab/status/link semantics.
