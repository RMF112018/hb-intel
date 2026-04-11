# Prompt-03 — Build, Package, and Deploy Validation

## Objective
Produce a fresh hb-webparts package that includes the provider fix and prove the built/package artifacts reflect the updated code.

## Prompt

```text
Perform a focused fresh-build/package validation for the PnP Operations provider fix.

Required tasks:

1. Rebuild from fresh state.
   - Clear or invalidate any outputs necessary to avoid stale artifact reuse.
   - Ensure the hb-webparts app bundle and shell/package outputs are freshly generated.

2. Package the updated solution.
   - Produce a fresh `hb-webparts.sppkg`.
   - Verify the generated assets correspond to the current code state.

3. Prove package freshness.
   - Record the generated bundle/hash names.
   - Record the shell-entry artifact/hash for the PnP webpart if applicable.
   - Confirm the package contains the updated assets.

4. Add a targeted artifact-truth check tied to this fix.
   - Verify the packaged app bundle contains evidence of the provider-wiring change, if practical.
   - If exact string-based verification is too brittle, use the strongest reliable package-truth check available.

5. If the packaging pipeline still permits stale build reuse in a way that could undermine confidence for this fix, tighten that behavior or document the exact remaining gap.

6. Produce a validation summary containing:
   - commands run,
   - fresh artifacts produced,
   - proof that current code made it into the package,
   - any remaining limitations requiring tenant-side validation.

Important constraints:
- Do not re-read files still in current context unless necessary after edits.
- Be explicit about whether you changed pipeline behavior or only validated around it.
- Do not claim tenant render success unless you actually have that proof.
```
