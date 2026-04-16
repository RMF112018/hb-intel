# Prompt-03-Deepen-project-context-driven-assistance

## Objective
Use authoritative project context more effectively to reduce editorial busywork and improve consistency, but only where the product can do so truthfully and safely.

## Authorities
- project lookup / metadata defaults / MetadataPanel / HeroPanel / readiness and promotion-related seams
- any shared contracts that define available project data

## Current gap to close
Project selection currently improves the author flow, but the product does not yet appear to use project context as deeply as it could for high-value, low-risk assistance.

## Required implementation outcome
1. Identify additional context-driven assists that are justified by available project truth.
2. Implement only the ones that clearly reduce author burden without overreaching.
3. Preserve explicit author override and transparent product behavior.
4. Keep the current supported scope truthful.

## Proof of closure
- enumerate the new context-driven behaviors
- explain the source of truth for each
- verify the product still behaves predictably when project data is incomplete

## Constraints
- do not invent data the project contract does not actually provide
- do not silently force editorial meaning
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
