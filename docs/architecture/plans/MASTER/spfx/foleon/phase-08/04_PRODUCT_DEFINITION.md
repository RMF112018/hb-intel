# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Product Definition

### Ownership model

| Layer | Owner | Responsibility |
|---|---|---|
| Foleon | Marketing / communications | Author full leadership content, rich media, video, final message body, Foleon experience. |
| Foleon Manager | HB Intel content managers | Select active message, maintain metadata, placement, URLs, state, governance. |
| HB Central reader | HB Intel homepage | Present a clear, premium access point to the active Foleon message. |
| Shared viewer | Foleon reader package | Launch full-window viewer or external open according to policy. |

### Product job

The Leadership Message reader helps an employee quickly decide whether to open a Foleon-managed leadership message.

It is not a blog renderer, not a fake article card, and not a CMS authoring surface.

### Audience

Primary: all HB Central employees.  
Secondary: Marketing/content managers validating placement.  
Tertiary: admins troubleshooting content state.

### Desired employee understanding within 3 to 5 seconds

- This is the current leadership message.
- It comes from leadership or a specific executive if provided.
- It covers a specific strategic/company topic.
- The full message opens in Foleon / the HB Central full-window viewer.
- The item is current, preview-only, missing, blocked, or external-only.

### Product principles

1. **Context before content.** Show context and reason to open, not the full message.
2. **Trust before decoration.** Use source/status/date sparingly but clearly.
3. **Real data only.** Omit unavailable fields.
4. **Visible action.** Always show a clear CTA when a target exists.
5. **State clarity.** Missing or blocked content should not look broken.
6. **Homepage fit.** The lane must work as a paired-row module and as a single-column stack.
7. **No internal scaffolding.** Employee-facing production copy cannot expose component terms, schema terms, or workflow labels.
