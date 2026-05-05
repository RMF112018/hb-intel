# Security, URL Policy, and HBI Guardrails

## No-Secret Rule

Secrets must not appear in:

- SharePoint list rows;
- fixtures;
- SPFx source;
- docs;
- test snapshots;
- logs;
- URL payloads;
- query strings.

Search terms that should trigger review if found in fixtures/URLs:

```text
token
secret
password
passwd
pwd
key
api_key
apikey
code
sig
signature
credential
client_secret
access_token
refresh_token
sharedaccesssignature
```

## URL Policy Rules

Implement and test URL policy as a pure helper.

Required behavior:

- Use `new URL()` or equivalent standard parser.
- Allow only `https:`.
- Reject `http:`, `javascript:`, `data:`, `file:`, `ftp:`.
- Reject localhost and obvious loopback/private hosts in helper logic where determinable.
- Compare hostnames against allowlisted/approved domains from fixture policy.
- Do not rely on `startsWith`, `contains`, or blocklist-only checks.
- Reject credential-like query parameters.
- Treat custom links as requiring approval.
- Default iframe/current-image eligibility to blocked.
- Return structured reason codes for UI and tests.

Recommended reason codes:

```text
allowed
invalid-url
scheme-blocked
host-not-approved
host-blocked-local
query-contains-credential-like-parameter
custom-link-requires-approval
iframe-blocked-by-default
current-image-blocked-by-default
policy-unavailable
```

## External Link Opening

If open-link behavior is implemented:

- only open links whose URL policy result is allowed;
- use `target="_blank"` and `rel="noopener noreferrer"`;
- do not embed credentials in the URL;
- do not use iframe;
- provide visible destination hostname;
- consider a leaving-site cue if existing design pattern supports it.

## Iframe / Current Image Gate

Do not render iframes or current-image provider embeds in this package.

Rationale:

- clickjacking defenses often intentionally prevent framing;
- camera provider public links and embeds can bypass normal login expectations;
- provider settings and enterprise policies vary;
- PCC has not authorized embed-specific security review.

## Role / Action Visibility

Use `external_system_role_action_matrix.json` as guidance for role/action visibility.

Important distinction:

- UI visibility/read-only gating is allowed as display posture.
- Authorization enforcement is not implemented by this package.
- Do not claim runtime security enforcement unless the backend actually enforces it.

## HBI Allowed Behavior

HBI may:

- summarize mapped systems visible to the current user;
- explain stale or missing mappings with citations;
- list source-health warnings;
- show cited launch/mapping lineage;
- refuse insufficient-evidence requests.

## HBI Refused Behavior

HBI must refuse to:

- approve custom links;
- reject custom links;
- archive or restore links;
- change Procore/Sage/AHJ/camera systems;
- post to Sage;
- make legal/accounting/claim determinations;
- bypass user access or redaction;
- act as an approver or authority.

## Audit Event Taxonomy

Use the canonical audit taxonomy for fixture/read-model events. Expected event types include:

```text
launch-pad-rendered
launch-link-rendered
launch-attempted
launch-blocked
project-link-created
project-link-submitted
project-link-approved
project-link-rejected
project-link-archived
mapping-review-created
mapping-correction-requested
mapping-confirmed
mapping-conflict-detected
source-health-changed
admin-verification-created
review-item-closed
hbi-lineage-cited
hbi-refusal-issued
```

Do not implement audit event writes in this package.

## Security Tests

Required tests:

- URL helper rejects blocked schemes.
- URL helper rejects localhost/private-host examples.
- URL helper rejects credential-like query params case-insensitively.
- URL helper blocks iframe/current image by default.
- fixtures contain no secret-like values.
- SPFx surface renders no iframe.
- disabled action captions render for non-authorized role actions.
- HBI refusal state renders for prohibited actions.
