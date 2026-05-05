# Web Research Synthesis

## Research Scope

Research was performed to inform implementation posture, prompt design, security guardrails, SharePoint/list constraints, SPFx/Viva UX patterns, Microsoft Graph throttling posture, and accessibility expectations.

## Claude Code Prompting / Execution Guidance

### Findings

- Claude Code slash commands support session operations such as `/clear`, `/compact`, `/memory`, `/init`, and project commands.
- Claude Code memory guidance recommends storing project architecture, coding standards, and common commands in structured memory files.
- Claude Code hooks can enforce app-level rules but execute arbitrary shell commands and require careful security review.

### Implementation Implications

- This package embeds common commands and paths to avoid repeated rediscovery.
- Every prompt includes the required no-unnecessary-reread instruction.
- Prompt 01 is read-only to establish local truth before implementation.
- Hooks are not modified by this package. If hooks are later used to enforce guardrails, they require explicit review and safe absolute paths.

## SharePoint / Microsoft 365 Guidance

### Findings

- SharePoint list view threshold guidance emphasizes indexes and filtered views to control list performance.
- Microsoft Graph throttling guidance states Graph may return `429 Too Many Requests` with `Retry-After`; recommended handling includes reducing call frequency, avoiding immediate retries, backing off, and using change tracking/notifications where available.
- Viva Connections / SPFx card guidance supports curated dashboard cards and quick-view task completion.

### Implementation Implications

- Wave 15 models and mock read-models should align to indexed first-predicate query patterns.
- Future live Graph reads should avoid polling and respect throttling/backoff.
- First implementation should be card/panel oriented and avoid dense all-admin screens.

## URL Security / Iframe / Clickjacking

### Findings

- OWASP open redirect guidance recommends standard URL parsing and strict allowed-domain validation.
- OWASP clickjacking guidance recommends CSP `frame-ancestors`, `X-Frame-Options`, SameSite cookies, and defense-in-depth; `DENY` is recommended unless specific framing need exists.

### Implementation Implications

- Use `new URL()` in pure URL policy helpers.
- Do not rely on naive string matching.
- Keep iframe/current-image camera rendering blocked by default and future-gated.
- Show destination host and block credential-like query parameters.

## Accessibility

### Findings

- WAI-ARIA modal dialog pattern requires focus to move inside the dialog, `Tab`/`Shift+Tab` to remain inside, and `Escape` to close.

### Implementation Implications

- Add/edit drawer and HBI lineage panel need focus management tests where feasible.
- Disabled actions need accessible reason text.
- Error summary should link to invalid fields.

## Dependency Research

### Findings

- TanStack Table supports controlled sorting state and manual server-side sorting.
- Zod already exists in `@hbc/models` and may be used if consistent with repo patterns.

### Implementation Implications

- Do not add TanStack Table or other dependencies in this package.
- If existing repo already has a table abstraction, use it.
- If `zod` usage aligns with existing `@hbc/models` patterns, it may be used without lockfile change.

## Research Sources

See:

```text
artifacts/web_research_sources.json
reference/06_RESEARCH_PATTERN_REFERENCE.md
```
