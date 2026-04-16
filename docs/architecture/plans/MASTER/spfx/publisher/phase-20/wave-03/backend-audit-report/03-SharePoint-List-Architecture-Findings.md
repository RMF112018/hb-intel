# 03 — SharePoint List Architecture Findings

## Severity classification summary

### Critical
None that force immediate creation of an entirely new list family for the current Project Spotlight scope.

### High
1. critical key columns do not have proven uniqueness/index enforcement in checked-in schema evidence
2. current-binding supersession is not yet retained in structured lineage form
3. publishing-error detail is not yet stored with adequate structured classification

### Medium
1. cross-list relationships remain text-key only and therefore depend on app-level referential integrity
2. read-model diagnostics are not yet represented strongly enough in code paths consuming malformed rows

### Low
1. success-operation telemetry is still separate from workflow history only implicitly
2. broader operational metadata fields remain dormant in `HB Articles`

### Beneficial but not necessary
1. dedicated scheduled-publish queue/executor architecture
2. Company Pulse destination architecture
3. full lookup-column conversion for all publisher relationships

## List-by-list findings

## HB Articles
### Findings
- `ArticleId` is central and should be treated as a hardened unique key
- child-list relationships depend on text-key integrity
- no checked-in schema evidence currently proves unique enforcement for `ArticleId`

### Required action
Address in Prompt 04.

---

## HB Article Destination Pages
### Findings
- `ArticleId` is the authoritative one-row current-binding key
- `BindingId` is also identity-significant
- no checked-in schema evidence currently proves unique enforcement on either key
- lineage of regenerate supersession is still too dependent on workflow-history note text

### Required action
Address key governance in Prompt 04 and lineage structure in Prompt 05.

---

## HB Article Team Members
### Findings
- `ArticleId` drives child retrieval
- `TeamMemberId` is a child identity key
- the schema report does not show indexing/uniqueness evidence for those keys
- malformed user/principal rows can still disappear without structured diagnostics

### Required action
Address diagnostics in Prompt 03 and key hardening in Prompt 04.

---

## HB Article Media
### Findings
- `ArticleId` drives child retrieval
- `MediaId` is a child identity key
- schema evidence does not prove indexing/uniqueness
- malformed rows can still disappear without structured diagnostics

### Required action
Address diagnostics in Prompt 03 and key hardening in Prompt 04.

---

## HB Article Template Registry
### Findings
- `TemplateKey` is operationally authoritative
- `RequiredFieldSetKey` is required but its contract can still fail open in code
- schema evidence does not prove uniqueness/indexing on `TemplateKey`

### Required action
Address contract behavior in Prompt 02 and key hardening in Prompt 04.

---

## HB Article Workflow History
### Findings
- current fields are enough for basic state-transition audit
- they are not yet enough for strong structured binding-lineage retention

### Required action
Address in Prompt 05, preferably by strengthening this existing surface before adding a new list.

---

## HB Article Publishing Errors
### Findings
- current fields are enough for coarse failure capture
- they are not yet strong enough for structured stage/subsystem triage
- the repo compensates with Title-prefix conventions

### Required action
Address in Prompt 06 by strengthening this existing surface instead of creating a speculative separate error platform.

---

## HB Article Promotion Rules
### Findings
- current list is structurally sufficient for current policy usage
- key hardening for `RuleId` still belongs under Prompt 04
- no new list architecture is required here for current scope
