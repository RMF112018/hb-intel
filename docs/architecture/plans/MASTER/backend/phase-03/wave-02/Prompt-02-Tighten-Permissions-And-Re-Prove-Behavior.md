# Prompt-02-Tighten-Permissions-And-Re-Prove-Behavior

## Objective

Move from broad staging/test Graph permissions to a deliberate pre-rollout permission posture and prove the Safety flow still works.

## Governing authorities

- current successful staging/test Safety flow
- Microsoft Graph permissions reference
- Selected permissions guidance for SharePoint/OneDrive
- site/list permission assignment APIs where applicable
- backend rollout-posture validation seams

## Required work

1. Build the exact permission inventory from the successful flow.
2. Distinguish:
   - convenient staging grants
   - required rollout grants
3. Tighten grants where feasible.
4. If selected scopes are used, document and prove the site/list assignments.
5. Re-run the end-to-end Safety proof suite under the tightened posture.

## Required outcome

- the team knows exactly which permissions are required for production
- broad staging permissions are no longer a hidden dependency

## Proof of closure required

- before/after permission inventory
- exact proof run results under tightened grants
- explicit statement of rollout-safe required permissions

## Prohibitions

- no hand-wavy least-privilege claims
- no permission removal without re-proof
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
