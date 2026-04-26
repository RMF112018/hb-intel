# Risk Register and Decisions

## Key risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Shared package imports from deployable app source | High | Package must own reusable code; no `apps/hb-intel-foleon/src/*` imports. |
| Homepage mounts Foleon global twice | High | Use shared React component integration only. |
| Leadership lane schema missing in tenant | High | Add idempotent tenant provisioning wave. |
| Shell occupant IDs change accidentally | High | Preserve IDs unless repo truth proves otherwise. |
| Existing leadership module removed too early | Medium | Replace zone internals first; delete legacy later only if safe. |
| Package version drift | High | Coherent version bump per deployable package. |
| Preview becomes fake live content | Medium | Static preview language; no fake actions/iframes. |
| Public query reintroduces person-field `$select` | High | Preserve scalar-safe projection tests. |
| Homepage layout overflows | High | Breakpoint validation and no-overflow tests/manual evidence. |

## Decisions

### Leadership content type

Use existing `Leadership` content type and new `ReaderKey = leadership-message`.

### Homepage cutover method

Use shared React component integration, not global Foleon mount.

### Occupant IDs

Preserve existing IDs where possible.

### Execution

Use waves; do not combine package extraction and homepage cutover unless prior wave closes cleanly.
