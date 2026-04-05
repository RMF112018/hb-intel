# Prompt-02 — Visible Proof Remediation

## Objective

Implement the minimum necessary remediation to make the shell extension render visibly obvious content in both placeholder regions, proving that the extension is now functionally rendering and not just mounting empty wrappers.

Do not re-read files already in your current context or memory.

---

## Strategic intent

This prompt is not the final long-term config architecture.

This prompt is the shortest disciplined route to proving that the extension can visibly render real shell-adjacent UI.

The current issue is that the extension mounts empty containers. Fix that first.

---

## Required work

### 1. Introduce visible default content
Implement clearly visible default content for the shell extension so that when no external config is supplied, the extension still renders meaningful proof content.

At minimum:

#### Top placeholder
Render visible content such as:
- a concise utility ribbon with 2-4 links
- one alert/announcement item with visible text
- enough content to create non-zero height and obvious presence

#### Bottom placeholder
Render visible content such as:
- 2-4 footer utility links
- support/help text and/or operational text
- enough content to create non-zero height and obvious presence

### 2. Put the defaults in the correct location
Do not scatter ad hoc hardcoded arrays randomly.

Place the temporary/default visible config in the most correct repo location, based on the Prompt 01 findings.

Use a disciplined local default config pattern so it can later be replaced or overridden.

### 3. Preserve safe behavior
The extension must remain:
- host-cooperative
- lightweight
- resilient if config is partially missing
- safe if one placeholder is unavailable

### 4. Make the proof visually obvious
The current CSS is very restrained. Without turning this into a full design project, ensure the rendered proof content is obvious enough to verify quickly on the page.

You may make minimal temporary style-strength adjustments if required for debugging visibility, but keep them disciplined.

### 5. Validate on-page rendering
After implementation:
- rebuild/package if needed for the extension runtime path
- redeploy/apply the updated build if required by the repo flow
- verify that `document.querySelectorAll('[data-hbc-shell-extension]')` still returns both placeholders
- verify they now have non-zero height and non-empty text
- verify visible UI is actually present on the page

---

## Hard gates

- Do not leave the extension rendering empty wrappers after this prompt.
- Do not over-engineer the final config system in this prompt.
- Do not regress the working Application Customizer mounting behavior.
- Do not broaden this into final premium visual design work yet.
- Do not re-read files already in your current context or memory.

---

## Deliverables

Provide:

1. the code changes that introduce visible default placeholder content
2. any minimal styling/config scaffolding needed
3. rebuild/redeploy steps actually run if required
4. verification evidence showing:
   - non-empty text
   - non-zero heights
   - visible on-page rendering
5. concise final notes explaining:
   - where the defaults live
   - why that location was chosen
   - how this proves the root cause is resolved at the functional level

---

## Acceptance criteria

- top placeholder renders visible content
- bottom placeholder renders visible content
- both mounted containers have non-zero height
- the extension is visibly obvious on the page
- the root cause of empty rendering is functionally resolved
