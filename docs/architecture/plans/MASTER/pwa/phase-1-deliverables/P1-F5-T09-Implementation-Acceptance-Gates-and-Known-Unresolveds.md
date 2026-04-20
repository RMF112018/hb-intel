# P1-F5-T09: Procore Implementation, Acceptance, Gates, and Known Unresolveds

## Acceptance Gates

- `v1` covers active projects and 48 months historical scope for the selected operational domains.
- Azure raw custody, normalized source-aligned records, thin canonical core mapping, and published read models are all explicitly staged.
- No binary artifact warehousing or direct downstream connector consumption is introduced.

## Known Unresolveds

- Exact endpoint structures are unresolved from the supplied Procore introduction page alone.
- Exact webhook/event contract shape is unresolved from the supplied official source set.
- Runtime implementation must capture official route and event contracts before connector code is written.
