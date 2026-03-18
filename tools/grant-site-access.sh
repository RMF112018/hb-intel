#!/usr/bin/env bash
#
# grant-site-access.sh — Grant Managed Identity per-site access (Sites.Selected)
#
# Usage:
#   ./tools/grant-site-access.sh <site-id> <managed-identity-app-id> [role]
#
# Arguments:
#   site-id                  SharePoint site ID (GUID) — find via SharePoint admin or Graph API
#   managed-identity-app-id  Application (client) ID of the Function App Managed Identity
#   role                     Permission role: read, write, or fullcontrol (default: write)
#
# Prerequisites:
#   - Azure CLI installed and authenticated: az login
#   - Caller must have Sites.FullControl.All or be a SharePoint admin
#   - Managed Identity must have Sites.Selected application permission granted by IT
#
# When to run:
#   - After initial setup: for hub site, Sales/BD site, shared/department sites
#   - After each provisioning saga Step 1 creates a new project site
#   - Before Steps 2-7 can access the new site's lists and libraries
#
# This is the manual (Option A2) path per the Sites.Selected validation plan.
# For automated grants (Option A1), use IGraphService.grantSiteAccess() when
# GRAPH_GROUP_PERMISSION_CONFIRMED=true is set in the environment.
#
# Reference: docs/how-to/administrator/setup/backend/IT-Department-Setup-Guide.md §9.6
# Reference: docs/reference/configuration/sites-selected-validation.md
#
set -euo pipefail

SITE_ID="${1:-}"
APP_ID="${2:-}"
ROLE="${3:-write}"

if [[ -z "$SITE_ID" || -z "$APP_ID" ]]; then
  echo "Usage: $0 <site-id> <managed-identity-app-id> [role]"
  echo ""
  echo "  site-id   SharePoint site ID (GUID)"
  echo "  app-id    Managed Identity application (client) ID"
  echo "  role      read | write | fullcontrol (default: write)"
  echo ""
  echo "Example:"
  echo "  $0 a1b2c3d4-e5f6-7890-abcd-ef1234567890 12345678-abcd-ef01-2345-678901234567 write"
  exit 1
fi

if [[ "$ROLE" != "read" && "$ROLE" != "write" && "$ROLE" != "fullcontrol" ]]; then
  echo "Error: role must be read, write, or fullcontrol (got: $ROLE)"
  exit 1
fi

GRAPH_URL="https://graph.microsoft.com/v1.0/sites/${SITE_ID}/permissions"

echo "=== Per-Site Grant ==="
echo "  Site ID:  $SITE_ID"
echo "  App ID:   $APP_ID"
echo "  Role:     $ROLE"
echo ""
echo "Granting access..."

az rest \
  --method POST \
  --url "$GRAPH_URL" \
  --headers "Content-Type=application/json" \
  --body "{
    \"roles\": [\"${ROLE}\"],
    \"grantedToIdentities\": [{
      \"application\": {
        \"id\": \"${APP_ID}\",
        \"displayName\": \"HB Intel Provisioning Function\"
      }
    }]
  }"

echo ""
echo "=== Verifying grant ==="
az rest --method GET --url "$GRAPH_URL"

echo ""
echo "Done. The Managed Identity now has '${ROLE}' access to site ${SITE_ID}."
echo "If provisioning was waiting on this grant, retry the saga or trigger Steps 2-7."
