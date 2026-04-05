# Phase 00 Risk Exposure

## Objective
This file defines the risk exposure that the Phase 00 prompt package must address and contain.

---

## Primary Risk Categories

### 1. Package Contract Drift
If package exports, source entry points, and docs do not match, later phases may implement against a false contract.

#### Failure modes
- homepage surfaces import the wrong entry point
- docs instruct patterns that the package does not actually support
- future agents “fix” the mismatch differently in separate branches
- bundle size or dependency discipline is lost because the constrained surface is not real

#### Required mitigation
- one authoritative export map
- one authoritative entry-point reference
- explicit homepage import rules
- supporting enforcement where appropriate

---

### 2. Homepage / Shell Responsibility Bleed
If homepage webparts and shell-extension responsibilities are not clearly separated now, later phases will reintroduce overlap.

#### Failure modes
- homepage product absorbs cross-page shell concerns
- shell work relies on homepage runtime assumptions
- future extension work becomes harder to isolate and package cleanly
- governance docs become internally inconsistent

#### Required mitigation
- exact written package-boundary statements
- explicit homepage vs shell-extension responsibility matrix
- removal of ambiguous language that implies shell takeover or mixed responsibilities

---

### 3. Doctrine Ambiguity
If doctrine remains split, stale, or overly generic, future prompts will either over-constrain design quality or under-constrain implementation discipline.

#### Failure modes
- premium SharePoint work is suppressed by overly rigid app-library rules
- quality standards are loosened too far while trying to remove friction
- future agents rely on outdated guidance because it still looks authoritative
- binding vs directional guidance remains unclear

#### Required mitigation
- doctrine hierarchy cleanup
- explicit SPFx-hosted homepage overlay
- clear labeling of binding vs directional guidance
- supersession notes for replaced or downgraded docs

---

### 4. SharePoint Host Misapplication
If SPFx constraints are described inconsistently, later implementation may assume unsupported control over the SharePoint shell.

#### Failure modes
- future prompts drift into unsupported shell manipulation
- homepage and shell-extension architecture becomes fragile
- placeholder-safe patterns are not clearly distinguished from page-canvas ownership
- governance loses credibility because support boundaries are not explicit

#### Required mitigation
- supported customization posture stated clearly
- page-canvas vs placeholder-extension distinction documented
- no ambiguous “full shell control” language left unqualified

---

### 5. Stale Documentation Authority
If old docs remain in place without clear supersession, they will continue to act as shadow authority.

#### Failure modes
- future agents follow the wrong file
- implementation packages reference obsolete guidance
- reviewers cannot tell which rule is authoritative
- contradictions reappear after Phase 00

#### Required mitigation
- supersession notes
- doc taxonomy cleanup
- direct references from higher-level docs to current authoritative paths

---

## High-Risk Signals the Agent Must Treat Seriously
The following signals should trigger direct corrective action rather than soft commentary:

- docs that name entry points not actually exported
- README guidance that conflicts with actual consumer usage
- SPFx guidance that is incompatible with package behavior or documented boundaries
- stale file references that appear authoritative but are no longer accurate
- local absolute paths or machine-specific references inside governing docs
- weak or indirect language where a rule should be explicit

---

## Hard Stop Conditions
The phase should not be declared complete if any of the following remain true:

- two docs still disagree on the allowed homepage entry point
- broad `@hbc/ui-kit` imports vs constrained homepage imports remain unresolved
- homepage vs shell-extension responsibility is still described differently in different places
- the repo still lacks a clear SPFx-hosted homepage doctrine overlay
- stale docs remain present without any supersession or rewrite

---

## Risk Handling Principle
Phase 00 is successful only if it reduces ambiguity enough that later implementation phases can move quickly **without reopening these foundational questions**.
