# OneDeploy 502 Escalation — Workflow Gate Appendix (copy-paste)

**Status:** The YAML below is **merged into** [`.github/workflows/main_hb-intel-function-app.yml`](../../.github/workflows/main_hb-intel-function-app.yml) as the step **Flex Safety reporting-period probe registration proof** (immediately after `Post-deploy live artifact parity proof (hard gate)`). This file remains the human-readable reference.

**Context (historical):** Plan mode originally blocked direct workflow edits; the snippet was applied in Agent mode afterward.

**Prerequisites:** The `stamp` step must continue to export `steps.stamp.outputs.resourceGroup` as `RG`.

```yaml
      - name: Flex Safety reporting-period probe registration proof
        env:
          RG: ${{ steps.stamp.outputs.resourceGroup }}
        run: |
          set -euo pipefail
          echo "Recording Azure function inventory (Flex route registration truth)."
          az functionapp function list \
            --resource-group "$RG" \
            --name "$AZURE_FUNCTIONAPP_NAME" \
            -o json > "$RUNNER_TEMP/azure-function-inventory.json"

          if ! jq -e 'any(.[]; (.name | type == "string") and (.name | endswith("/safetyReportingPeriodProbe")))' \
            "$RUNNER_TEMP/azure-function-inventory.json" >/dev/null; then
            echo "::error::Expected function name ending with /safetyReportingPeriodProbe was not found in Azure inventory."
            jq '.[].name' "$RUNNER_TEMP/azure-function-inventory.json" | head -80 || true
            exit 1
          fi

          HOST="https://$(az functionapp show \
            --resource-group "$RG" \
            --name "$AZURE_FUNCTIONAPP_NAME" \
            --query properties.defaultHostName \
            -o tsv)"

          probe_code="$(curl -sS -o /dev/null -w "%{http_code}" \
            "$HOST/api/safety-records/reporting-periods/period-1/probe?reportingPeriodSpItemId=1")"
          if [ "$probe_code" = "404" ]; then
            echo "::error::GET reporting-period probe returned 404 (route not deployed)."
            exit 1
          fi
          echo "GET reporting-period probe (no auth) HTTP status: $probe_code (expected 401 or 403)"

          {
            echo "### Flex Safety probe proof"
            echo ""
            echo "- Host: \`$HOST\`"
            echo "- Azure inventory includes \`safetyReportingPeriodProbe\`: yes"
            echo "- GET \`/api/safety-records/reporting-periods/period-1/probe?reportingPeriodSpItemId=1\` (no auth): \`$probe_code\` (must not be 404)"
          } >> "$GITHUB_STEP_SUMMARY"
```

**Optional (explicit five-route table in the summary):** Add a second step that echoes HTTP codes for the four POST routes plus the probe GET (all no-auth), mirroring the manual closure checklist. Keep responses off the log if they contain sensitive text; status lines only are sufficient.
