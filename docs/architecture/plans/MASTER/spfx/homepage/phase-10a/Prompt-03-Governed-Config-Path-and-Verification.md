# Prompt-03 — Governed Config Path and Verification

## Objective

Replace or formalize the visible-proof remediation with a governed content/config path that preserves visible rendering while making the shell extension maintainable, configurable, and verifiable.

Do not re-read files already in your current context or memory.

---

## Strategic intent

Prompt 02 proves the extension can render.

This prompt turns that proof into a stable runtime model.

The shell extension should not depend forever on arbitrary local hardcoded content if there is a better governed config path available through:

- component properties
- extension-level defaults
- a small local config contract
- or another repo-truth-consistent mechanism

Use judgment based on the findings from Prompt 01 and the working proof from Prompt 02.

---

## Required work

### 1. Establish the correct config source model
Based on repo truth, implement the most appropriate governed config path for the shell extension.

That may include:
- parsing Component Properties JSON
- defining extension-local default config objects
- merging supplied config with safe defaults
- passing structured config into `mountTop()` and `mountBottom()`

### 2. Remove fragile empty-default behavior as the primary mode
Do not allow the default no-config path to collapse back into zero-height empty wrappers unless that is a deliberate and documented non-render mode.

If empty rendering remains possible, it must be:
- intentional
- documented
- clearly governed
- not the accidental default state for normal deployment

### 3. Keep top and bottom independently safe
Preserve the current good behavior that:
- top and bottom placeholders are independent
- one can render while the other does not
- missing placeholders do not crash the extension
- partial config still renders valid sub-surfaces

### 4. Verify packaging and deployment behavior
After the config-path remediation:
- rebuild the extension package if required by the repo flow
- redeploy/apply the updated package as needed
- verify the extension still mounts correctly from the Application Customizer path
- verify visible content still appears
- verify the content path is now governed and understandable

### 5. Update docs
Update the relevant shell-extension docs/readmes to explain:
- where placeholder content comes from
- what the default behavior is
- how Component Properties or other config sources are interpreted
- how top and bottom placeholder content is supplied
- how to avoid returning to mounted-but-empty behavior

### 6. Leave the repo in a clean state
Remove or reduce any investigation-only instrumentation that is no longer useful.
Keep only the logging or safeguards that are actually valuable.

---

## Hard gates

- Do not regress to mounted-but-empty default behavior unless explicitly designed and documented.
- Do not break the working Application Customizer registration and mount flow.
- Do not leave the config path ambiguous.
- Do not broaden this into full homepage or shell visual redesign.
- Do not re-read files already in your current context or memory.

---

## Deliverables

Provide:

1. governed config-path implementation
2. any manifest/property parsing updates if needed
3. rebuild/redeploy steps actually run if required
4. documentation updates
5. final verification evidence showing:
   - mounted placeholders
   - visible content
   - non-zero height
   - understandable config flow
6. concise final report explaining:
   - final config source
   - fallback/default behavior
   - files changed
   - build/package steps run
   - any remaining non-blocking limitations

---

## Acceptance criteria

- visible shell-extension rendering remains in place
- config/content flow is governed and understandable
- mounted-but-empty is no longer the accidental default failure mode
- docs explain how the extension gets its visible content
- the extension remains safe, host-cooperative, and packaging-compatible
