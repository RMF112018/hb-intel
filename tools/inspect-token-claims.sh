#!/usr/bin/env bash
#
# inspect-token-claims.sh — Safely decode and display auth-contract-relevant
# JWT claims from a Bearer token without logging the raw token.
#
# Usage:
#   ./tools/inspect-token-claims.sh
#
# The script prompts for a token interactively (not via command-line argument)
# to avoid leaking the token into shell history. It decodes only the JWT
# payload (base64url-encoded, not encrypted) and displays claims relevant
# to the HB Intel auth contract.
#
# This is the repeatable proof mechanism for the SPFx token audience contract.
# Run it against a real SPFx-issued token to verify:
#   - aud matches the configured API_AUDIENCE (Application ID URI)
#   - ver is "1.0" (v1 token, expected with accessTokenAcceptedVersion null/1)
#   - iss matches the tenant's v1 or v2 issuer format
#   - scp contains "access_as_user" for delegated tokens
#   - tid matches the expected tenant
#
# How to obtain a token for inspection:
#   Option A (browser): Open SharePoint, load the Project Setup webpart,
#     open browser DevTools > Network tab, find an /api/ request, copy the
#     Authorization header value (strip "Bearer " prefix).
#   Option B (az CLI): az account get-access-token --resource api://func-hb-intel-staging
#     Then paste the "accessToken" value.
#
# Security:
#   - Token is read via prompt (not argument) to avoid shell history exposure
#   - Only the decoded payload claims are displayed, not the raw token
#   - No data is written to disk or logs
#
# Reference: docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/SPFx-Token-Audience-Contract-Proof.md
#
set -euo pipefail

echo "=== HB Intel Token Claim Inspector ==="
echo ""
echo "Paste a JWT access token below (the value after 'Bearer ' in the Authorization header)."
echo "Press Enter when done."
echo ""
read -r -s -p "Token: " TOKEN
echo ""
echo ""

if [[ -z "$TOKEN" ]]; then
  echo "Error: No token provided."
  exit 1
fi

# Extract the payload (second segment of the JWT, between the two dots)
PAYLOAD=$(echo "$TOKEN" | cut -d'.' -f2)

if [[ -z "$PAYLOAD" ]]; then
  echo "Error: Could not extract JWT payload. Is this a valid JWT?"
  exit 1
fi

# Base64url decode: replace URL-safe chars, add padding, decode
PADDING=$(( 4 - ${#PAYLOAD} % 4 ))
if [[ $PADDING -lt 4 ]]; then
  PAYLOAD="${PAYLOAD}$(printf '=%.0s' $(seq 1 $PADDING))"
fi
DECODED=$(echo "$PAYLOAD" | tr '_-' '/+' | base64 -d 2>/dev/null)

if [[ -z "$DECODED" ]]; then
  echo "Error: Failed to base64-decode the JWT payload."
  exit 1
fi

echo "=== Auth-Contract-Relevant Claims ==="
echo ""

# Extract and display specific claims using python (available on macOS/Linux)
python3 -c "
import json, sys

try:
    claims = json.loads('''$DECODED''')
except json.JSONDecodeError:
    print('Error: JWT payload is not valid JSON.')
    sys.exit(1)

# Claims relevant to the HB Intel auth contract
fields = [
    ('aud',    'Audience (must match API_AUDIENCE env var)'),
    ('ver',    'Token version (expected: 1.0 for v1 app registration)'),
    ('iss',    'Issuer (tenant-specific STS or login.microsoftonline.com)'),
    ('tid',    'Tenant ID'),
    ('azp',    'Authorized party (client app that requested the token)'),
    ('appid',  'App ID (v1 equivalent of azp)'),
    ('scp',    'Delegated scopes (expected: access_as_user)'),
    ('roles',  'App roles'),
    ('idtyp',  'Token identity type (app = app-only, absent/user = delegated)'),
    ('upn',    'User Principal Name'),
    ('preferred_username', 'Preferred username (v2 fallback for upn)'),
    ('oid',    'Object ID (user or service principal)'),
    ('name',   'Display name'),
]

max_label = max(len(f[0]) for f in fields)
for key, desc in fields:
    value = claims.get(key, '(not present)')
    print(f'  {key:<{max_label+2}} {value}')
    print(f'  {\" \" * (max_label+2)} -> {desc}')
    print()

# Audience contract validation hints
aud = claims.get('aud', '')
ver = claims.get('ver', '')

print('=== Contract Validation ===')
print()
if isinstance(aud, str) and aud.startswith('api://'):
    print('  [PASS] aud is Application ID URI format (api://...)')
    print('         This matches the expected v1 token contract.')
elif isinstance(aud, str) and not aud.startswith('api://'):
    print('  [WARN] aud is NOT Application ID URI format.')
    print(f'         Got: {aud}')
    print('         If this is a bare GUID, the app registration may have')
    print('         accessTokenAcceptedVersion set to 2 instead of null/1.')
    print('         See SPFx-Token-Audience-Contract-Proof.md for guidance.')
else:
    print(f'  [WARN] Unexpected aud format: {aud}')

print()
if ver == '1.0':
    print('  [PASS] Token version is 1.0 (expected for standard Entra setup)')
elif ver == '2.0':
    print('  [WARN] Token version is 2.0. Check accessTokenAcceptedVersion in')
    print('         the app registration manifest. If set to 2, the aud claim')
    print('         will be a bare GUID instead of api:// URI.')
else:
    print(f'  [INFO] Token version: {ver or \"(not present)\"}')
print()
"

echo "=== End ==="
echo ""
echo "To verify: compare the 'aud' value above with your API_AUDIENCE env var."
echo "They must match exactly for token validation to succeed."
