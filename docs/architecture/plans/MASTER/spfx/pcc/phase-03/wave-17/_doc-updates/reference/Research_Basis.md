# Research Basis

This package uses public research for implementation constraints and prompt execution practices.

## Microsoft Graph

- Microsoft Graph throttling guidance: reduce operation count and call frequency; avoid immediate retries; use `Retry-After`; avoid continuous polling and collection scans where change tracking/change notifications are available. Source: https://learn.microsoft.com/en-us/graph/throttling
- Microsoft Graph delta query: use change tracking to detect created, updated, or deleted entities without full reads on every request. Source: https://learn.microsoft.com/en-us/graph/delta-query-overview
- Microsoft Graph change notifications: webhooks provide push notifications for supported resources and require HTTPS endpoints/subscription lifecycle management. Source: https://learn.microsoft.com/en-us/graph/change-notifications-delivery-webhooks
- Microsoft Graph permissions: delegated access acts on behalf of a signed-in user and cannot access resources the user cannot access. Source: https://learn.microsoft.com/graph/permissions-overview?tabs=http
- Microsoft Graph permissions reference: least-privileged permissions are recommended and overbroad permissions are poor security practice. Source: https://learn.microsoft.com/en-us/graph/permissions-reference

## SharePoint and SPFx

- SPFx is the recommended SharePoint customization/extensibility model, runs in current user/browser context, renders in the normal page DOM, and supports responsive/accessibility patterns. Source: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview
- SharePoint large lists can store many items, but views that exceed 5,000 items can hit list view threshold behavior; indexed filters, page limits, and careful views are recommended. Source: https://support.microsoft.com/en-us/office/manage-large-lists-and-libraries-b8588dae-9387-48c2-9248-c24122f07c59
- SharePoint Online list threshold errors occur when list views exceed the 5,000-item threshold. Source: https://learn.microsoft.com/en-US/sharepoint/support/Lists-and-libraries/items-exceeds-list-view-threshold

## Audit and Compliance

- Microsoft Purview audit provides unified audit logging for Microsoft 365 user/admin operations and is the compliance/security audit authority; Site Health business audit must not replace it. Source: https://learn.microsoft.com/en-us/purview/audit-solutions-overview

## Accessibility

- WAI-ARIA modal dialog guidance supports focus management, keyboard trapping, Escape close, and focus restoration. Source: https://wai-aria-practices.netlify.app/aria-practices/examples/dialog-modal/dialog
- WAI-ARIA table pattern recommends native HTML tables where possible; grid patterns are for interactive composite widgets. Source: https://www.w3.org/WAI/ARIA/apg/patterns/table/
- ARIA `status` role is a polite live region for advisory updates that should not receive focus. Source: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role

## Codex and Prompting

- Codex CLI can read, modify, and run code locally; approval modes include Suggest, Auto Edit, and Full Auto. Source: https://help.openai.com/en/articles/11096431-openai-codex-cli-getting-started
- Codex performs best with configured environments, reliable tests, clear documentation, and AGENTS.md guidance. Source: https://openai.com/index/introducing-codex/
- OpenAI teams recommend starting large changes in Ask mode to produce an implementation plan before Code mode. Source: https://openai.com/business/guides-and-resources/how-openai-uses-codex/
- Codex agent-loop guidance describes sandbox, permissions, writable directories, and layered AGENTS instructions. Source: https://openai.com/index/unrolling-the-codex-agent-loop/
- OpenAI prompt engineering guidance emphasizes clear instructions, delimiters, and specific desired outputs. Source: https://help.openai.com/en/articles/6654000-comprehensive-step-by-step-guide-to-prompt-engineering-with-chatgpt

## Codex 5.3 Note

The user requested Codex 5.3 prompting best practices. The package uses current official Codex and OpenAI prompt-engineering guidance. Public official documentation reviewed during generation did not provide a separate Codex 5.3-specific prompt specification, so this package treats Codex 5.3 as an execution target while grounding practices in current Codex CLI, Codex product, Codex agent-loop, AGENTS.md, and prompt-engineering guidance.
