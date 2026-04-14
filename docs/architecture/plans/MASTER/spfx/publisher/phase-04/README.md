# Publisher Remediation Prompt Package

This package contains a bounded remediation prompt set for the `Article Publisher` backend wiring and workflow issues identified in the audit.

## Package contents
- `Plan-Summary.md`
- `README.md`
- One unique prompt file per issue from the findings register

## Execution order
Run the prompts in numeric order.

That order is intentional:
1. close the page identity / binding integrity seam first
2. close the team-member user-field seam second
3. then clean up workflow completion, template/milestone correctness, and lower-risk clarity drift

## Operating rules for the local code agent
- Use the live local repo at `/Users/bobbyfetting/hb-intel`
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- Treat `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md` as schema authority
- Preserve tenant `HB Article*` naming and list bindings
- Close one prompt fully before moving to the next
- Do not solve only the symptom if the named prompt requires seam-level closure

## Prompt strategy
The user requested one unique prompt per issue, so this package follows the findings register one issue at a time.

Some issues are related. That is handled by:
- numeric order
- bounded scope in each prompt
- explicit instruction to scrub adjacent code only as needed to fully close the named issue

## Source issues covered
- P0-1 through P0-3
- P1-1 through P1-4
- P2-1 through P2-4
- P3-1

## Expected agent response per prompt
Each prompt instructs the agent to return:
1. what changed
2. why the issue is now closed
3. remaining risks or follow-up dependencies
