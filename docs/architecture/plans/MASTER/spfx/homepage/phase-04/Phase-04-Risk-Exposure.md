# Phase 04 Risk Exposure — Shell Extension Product (Lane B)

## Primary risks

### 1. Host-boundary violation risk
The biggest risk in this phase is drifting from supported placeholder usage into unsupported shell manipulation.

**Exposure:** high  
**Mitigation:** keep all rendering inside supported placeholder regions; document prohibited behaviors; add structural tests and explicit boundary docs.

### 2. Lane bleed risk
The second major risk is letting homepage product concerns leak into the shell-extension lane.

**Exposure:** high  
**Mitigation:** keep Lane A and Lane B ownership separate; do not reuse homepage composition shells as shell surfaces; keep lane docs explicit.

### 3. Package contract ambiguity
If Lane B launches without explicit entry-point discipline, it will drift toward broad `@hbc/ui-kit` usage or even homepage entry imports.

**Exposure:** medium  
**Mitigation:** document and enforce import posture in Prompt 01.

### 4. Placeholder fragility risk
SharePoint placeholders may not always be present or may behave differently across contexts.

**Exposure:** medium  
**Mitigation:** graceful no-op behavior, placeholder existence checks, no crash on absence, explicit tests.

### 5. Over-design risk
A shell-extension surface can become visually too heavy, trying to compete with the homepage instead of complementing it.

**Exposure:** medium  
**Mitigation:** keep Lane B concise, restrained, and shell-adjacent; do not recreate editorial homepage patterns in the shell.

### 6. Closure ambiguity risk
If Phase 04 ends without clear acceptance docs, repo truth will again blur “planned” versus “implemented.”

**Exposure:** medium  
**Mitigation:** require completion notes, acceptance artifact, and updated README/boundary docs in Prompt 03.

## Known non-goals

These are not risks to solve inside Phase 04 because they are intentionally out of scope:

- homepage property-pane authoring
- homepage async data
- navigation governance automation
- unsupported shell takeover
- enterprise-wide tenant branding automation

## Recommended review posture

Treat the following as hard review gates:

- supported placeholder usage only
- explicit lane boundary documentation
- no unsupported DOM/CSS takeover
- import discipline for Lane B
- safe failure when placeholders are absent
