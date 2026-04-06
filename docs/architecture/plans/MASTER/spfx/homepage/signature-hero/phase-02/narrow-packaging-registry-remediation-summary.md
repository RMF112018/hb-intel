# Narrow Packaging / Registry Remediation Summary

## Intent

This package isolates the failure seam between current source truth and emitted package truth.

The purpose is to repair:
- stale packaged manifests
- missing hidden-from-toolbox behavior
- missing or incorrect Signature Hero bundle registration
- stale legacy top-band runtime routing

## This package does NOT do

- redesign the hero
- revise visual language
- conduct a broad repo cleanup
- revisit homepage information architecture

## This package DOES do

- perform a forensic source-to-package mismatch audit
- repair manifest emission
- repair bundle registry emission
- force clean artifact regeneration
- prove package correctness before deployment

## Success Criteria

The next emitted `.sppkg` must prove all of the following before upload:

1. Signature Hero packaged manifest is current
2. Signature Hero keeps `supportsFullBleed: true`
3. non-hero webparts intended for this rollout cycle are hidden from toolbox
4. app-bundle registry includes the Signature Hero ID
5. Signature Hero routes to the rebuilt `HbSignatureHero`
6. stale legacy flagship routing does not hijack runtime rendering

## Recommended Sequence

1. forensic audit
2. manifest-emission fix
3. registry/routing fix
4. clean rebuild and artifact proof
