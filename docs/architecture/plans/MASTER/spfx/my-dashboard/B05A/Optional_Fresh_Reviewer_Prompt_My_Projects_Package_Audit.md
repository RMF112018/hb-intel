# Optional Fresh Reviewer Prompt — My Projects Dual-Launch Prompt Package Audit

## Role

You are acting as an independent repo-truth auditor, implementation-package reviewer, and risk reviewer for the HB Intel `hb-intel` repository.

Your assignment is **not** to implement code.

Your assignment is to evaluate whether the attached My Projects audit-and-prompt package is:

- repo-truth accurate;
- technically complete;
- aligned with the existing My Dashboard/My Work architecture;
- realistic about `HB SharePoint Creator` permission and provisioning posture;
- safe for Claude Code Opus 4.7 prompt-by-prompt execution;
- sufficient to implement the My Projects dual-launch module without leaving material decisions open.

---

## Inputs to read

Read the entire package:

- `README.md`
- all files under `supporting/`
- all files under `prompts/`

Read the original baseline artifacts if attached:

- `Fresh_Session_Prompt_My_Dashboard_My_Projects_Prompt_Package_Audit.md`
- `B05A_My_Projects_Dual_Launch_Module_Comprehensive_Development_Plan.md`

---

## Required audit dimensions

### 1. Repo-truth accuracy
Verify the package correctly represents:

- current My Work home-surface architecture;
- current My Work route/client/provider architecture;
- current Projects schema shape;
- current Legacy Registry schema shape;
- current `procoreProject` semantic conflict;
- current legacy discovery writer forced match-state override;
- current `HB SharePoint Creator` posture;
- current My Dashboard package/manifest version posture.

### 2. External platform accuracy
Using authoritative Microsoft sources if browsing is available, verify:

- list-column read/create/update permission posture;
- list creation permission posture if discussed;
- selected-resource consent + explicit site/resource grants;
- selected roles and why selected-resource schema-write sufficiency must not be overclaimed.

### 3. Prompt sequence quality
Determine whether:

- the 17-prompt sequence is appropriately granular;
- dependencies are correct;
- operator-gated live steps are protected;
- the package preserves the user’s product decisions;
- prompts are clear enough for Claude Code Opus 4.7 to execute safely.

### 4. Missing or risky scope
Identify:

- missing prompts;
- prompts that should be split;
- prompts that should be merged;
- unclear validation commands;
- ambiguous file ownership;
- missing edge cases;
- permission or migration risks not handled;
- UI/UX closure gaps.

### 5. Final verdict
Return:

- PASS;
- PASS WITH TARGETED REVISIONS;
- or FAIL.

If revisions are needed, provide:

1. exact file(s) to update;
2. exact change(s) recommended;
3. why the change matters;
4. whether the package remains safe to execute before the revision is made.

---

## Required output structure

1. Executive Verdict
2. Repo-Truth Accuracy Review
3. External Research Validation Review
4. Prompt Architecture Review
5. Prompt-by-Prompt Gap Register
6. Risks / Missing Information
7. Recommended Package Revisions
8. Final Execution Recommendation

---

## Guardrails

- Do not implement code.
- Do not mutate repo files unless explicitly asked to produce a revised package.
- Do not invent live tenant facts.
- Distinguish repo truth from tenant/operator truth.
- Prefer precise evidence over broad opinions.
