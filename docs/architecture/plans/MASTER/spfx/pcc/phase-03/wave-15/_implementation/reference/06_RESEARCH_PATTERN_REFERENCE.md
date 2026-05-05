# Research Pattern Reference

## Claude Code

Sources:

- Anthropic Claude Code slash commands: `https://docs.anthropic.com/en/docs/claude-code/slash-commands`
- Anthropic Claude Code memory: `https://docs.anthropic.com/en/docs/claude-code/memory`
- Anthropic Claude Code hooks: `https://docs.anthropic.com/en/docs/claude-code/hooks`

Implications:

- Use staged prompts.
- Keep each prompt scoped.
- Include context-efficient no-reread instruction.
- Store common commands/architecture in package references.
- Do not modify hooks unless explicitly authorized and security-reviewed.

## SharePoint / Graph

Sources:

- SharePoint list threshold: `https://support.microsoft.com/en-us/office/working-with-the-list-view-threshold-limit-for-all-versions-of-sharepoint-4a40bbdc-c5f8-4bbd-b9b6-745daf71c132`
- Microsoft Graph throttling: `https://learn.microsoft.com/en-us/graph/throttling`

Implications:

- Preserve indexed first-predicate query design.
- Avoid uncontrolled list scans.
- Avoid polling in future live integrations.
- Respect `Retry-After` if future Graph calls are authorized.

## Security

Sources:

- OWASP Open Redirect: `https://owasp.org/www-community/attacks/open_redirect`
- OWASP Clickjacking Defense: `https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html`

Implications:

- Parse URLs with standard parsers.
- Use hostname allowlists.
- Do not rely on string matching.
- Keep iframe embeds blocked by default.

## Accessibility / UX

Sources:

- WAI-ARIA Modal Dialog Pattern: `https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/`
- Microsoft Viva Connections Card Design: `https://learn.microsoft.com/en-us/sharepoint/dev/spfx/viva/design/design-intro`

Implications:

- Drawer/panel focus handling is required.
- Card/quick-view patterns are appropriate for Launch Pad entry points.

## Dependencies

Sources:

- TanStack Table Sorting: `https://tanstack.com/table/latest/docs/guide/sorting`

Implications:

- Controlled sorting/manual server-side sorting is a future option.
- Do not add dependency under this package.
