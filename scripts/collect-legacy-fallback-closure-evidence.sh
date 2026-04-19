#!/usr/bin/env bash
# Read-only collector for legacy-fallback closure evidence.
#
# Produces legacy-fallback-closure-evidence-<RUN_ID>.json in the current
# directory, structured by proof class (B registration, D persistence,
# E telemetry). Proof classes A (deployment) and C (execution) are
# operator-captured at the time of deploy/run and are referenced, not
# re-collected, by this script.
#
# Required env vars:
#   RESOURCE_GROUP        Azure resource group hosting the Function App
#   FUNCTION_APP_NAME     Function App name
#   RUN_ID                Discovery run id to filter evidence by
#   HBCENTRAL_SITE_URL    HBCentral site url (for SharePoint list reads)
#
# Optional env vars:
#   APP_INSIGHTS_ID       Application Insights component resource id or app id;
#                         if present, the script emits Telemetry Proof queries
#   OUTPUT_PATH           Override output file path
#
# This script does not deploy, does not mutate SharePoint, and does not
# modify the Function App. Refuses to run if required env vars are missing.

set -euo pipefail

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "error: missing required env var: $name" >&2
    exit 2
  fi
}

require_env RESOURCE_GROUP
require_env FUNCTION_APP_NAME
require_env RUN_ID
require_env HBCENTRAL_SITE_URL

OUTPUT_PATH="${OUTPUT_PATH:-legacy-fallback-closure-evidence-${RUN_ID}.json}"

for cmd in az jq curl; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "error: missing required command: $cmd" >&2
    exit 2
  fi
done

trap 'rm -f "${TMP_DIR}"/*.json 2>/dev/null; rmdir "${TMP_DIR}" 2>/dev/null || true' EXIT
TMP_DIR="$(mktemp -d)"

echo "[collect] resource-group=${RESOURCE_GROUP} app=${FUNCTION_APP_NAME} runId=${RUN_ID}" >&2

# ── Registration Proof (B) ───────────────────────────────────────────────
az functionapp function list \
  -g "${RESOURCE_GROUP}" -n "${FUNCTION_APP_NAME}" -o json \
  > "${TMP_DIR}/functions-list.json"

MASTER_KEY="$(az functionapp keys list \
  -g "${RESOURCE_GROUP}" -n "${FUNCTION_APP_NAME}" \
  --query masterKey -o tsv)"
HOST="$(az functionapp show \
  -g "${RESOURCE_GROUP}" -n "${FUNCTION_APP_NAME}" \
  --query properties.defaultHostName -o tsv)"

curl -sS "https://${HOST}/admin/functions?code=${MASTER_KEY}" \
  > "${TMP_DIR}/admin-functions.json"

# ── Persistence Proof (D) ────────────────────────────────────────────────
SP_BASE="${HBCENTRAL_SITE_URL%/}/_api/web"
SP_TOKEN="$(az account get-access-token \
  --resource "$(printf '%s' "${HBCENTRAL_SITE_URL}" | awk -F/ '{print $1 "//" $3}')" \
  --query accessToken -o tsv)"

curl -sS \
  -H "Authorization: Bearer ${SP_TOKEN}" \
  -H "Accept: application/json;odata=nometadata" \
  "${SP_BASE}/lists/getbytitle('Legacy%20Project%20Fallback%20Sync%20Runs')/items?\$filter=RunId%20eq%20'${RUN_ID}'&\$top=1" \
  > "${TMP_DIR}/sync-run-row.json"

curl -sS \
  -H "Authorization: Bearer ${SP_TOKEN}" \
  -H "Accept: application/json;odata=nometadata" \
  "${SP_BASE}/lists/getbytitle('Legacy%20Project%20Fallback%20Registry')/items?\$filter=DiscoveryRunId%20eq%20'${RUN_ID}'&\$top=5" \
  > "${TMP_DIR}/registry-sample.json"

# ── Telemetry Proof (E) ──────────────────────────────────────────────────
TELEMETRY_JSON="null"
if [[ -n "${APP_INSIGHTS_ID:-}" ]]; then
  AI_KQL=$(cat <<KQL
traces
| where timestamp > ago(24h)
| where customDimensions.runId == "${RUN_ID}"
    or message contains "${RUN_ID}"
| project timestamp, severityLevel, message,
          boundary = tostring(customDimensions.boundary),
          invocationId = tostring(customDimensions.invocationId)
| order by timestamp asc
KQL
)
  az monitor app-insights query \
    --app "${APP_INSIGHTS_ID}" \
    --analytics-query "${AI_KQL}" \
    -o json > "${TMP_DIR}/telemetry.json"
  TELEMETRY_JSON="$(cat "${TMP_DIR}/telemetry.json")"
fi

# ── Assemble the closure evidence JSON ───────────────────────────────────
jq -n \
  --arg runId "${RUN_ID}" \
  --arg resourceGroup "${RESOURCE_GROUP}" \
  --arg functionAppName "${FUNCTION_APP_NAME}" \
  --arg hbCentralSiteUrl "${HBCENTRAL_SITE_URL}" \
  --arg collectedUtc "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --slurpfile registration "${TMP_DIR}/functions-list.json" \
  --slurpfile adminFunctions "${TMP_DIR}/admin-functions.json" \
  --slurpfile syncRunRow "${TMP_DIR}/sync-run-row.json" \
  --slurpfile registrySample "${TMP_DIR}/registry-sample.json" \
  --argjson telemetry "${TELEMETRY_JSON}" \
  '{
    runId: $runId,
    collectedUtc: $collectedUtc,
    target: {
      resourceGroup: $resourceGroup,
      functionAppName: $functionAppName,
      hbCentralSiteUrl: $hbCentralSiteUrl
    },
    proofs: {
      B_registration: {
        azFunctionList: ($registration[0] // []),
        adminFunctions: ($adminFunctions[0] // [])
      },
      D_persistence: {
        syncRunRow: (($syncRunRow[0].value // [])[0] // null),
        registrySample: ($registrySample[0].value // [])
      },
      E_telemetry: $telemetry
    },
    scope: {
      readOnly: true,
      classesCaptured: ["B", "D", "E"],
      classesOperatorCaptured: ["A", "C"]
    }
  }' > "${OUTPUT_PATH}"

echo "[collect] wrote ${OUTPUT_PATH}" >&2
