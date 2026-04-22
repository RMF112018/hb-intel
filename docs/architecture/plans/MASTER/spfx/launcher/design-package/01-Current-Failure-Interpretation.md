# 01 — Current Failure Interpretation

## What is failing

The current launcher underperforms because the surface is trying to solve too many competing problems at once:

- row presentation
- overflow disclosure
- drawer composition
- legacy compatibility
- grouped overflow content
- multiple container treatments
- mixed geometry and special-case trigger behavior

The result is visible inconsistency:
- `More Tools` does not fully read as a peer tile
- the row still reads as a treated strip rather than a clean flagship launcher band
- the drawer has extra furniture and awkward spacing
- overflow behavior feels compromised instead of elegant

## What must be preserved

Only the following should be preserved conceptually:

- approved tile design language
- approved iconography / icon assets
- correct product intent as a homepage launch surface

## What must not be preserved

The new build must not inherit:
- legacy drawer structure
- grouped overflow sections
- count pills
- helper hint text
- heading furniture above the row
- ad hoc wrapper plates
- special-case geometry drift for `More Tools`
