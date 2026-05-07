# Package and Version Proof Strategy

## Required Proof

The audit package must establish which build/package the screenshots and runtime evidence correspond to.

## Proof Sources

Use all available sources:

1. Git commit SHA at test run.
2. `package-solution.json` version.
3. webpart manifest version.
4. PCC package metadata.
5. Tenant DOM/version marker if present.
6. Operator deployment notes.

## Recommended Future Runtime Marker

If PCC does not expose a runtime marker, recommend a future non-visual diagnostic marker:

```html
data-pcc-package-version="1.0.0.16"
data-pcc-build-sha="<short-sha>"
```

Do not add this marker unless the implementation prompt explicitly allows source changes.
