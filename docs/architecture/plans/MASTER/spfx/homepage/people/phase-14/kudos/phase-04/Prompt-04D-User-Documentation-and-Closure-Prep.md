# Prompt 04D — User Documentation and Closure Prep

You are working in the live local repo for `hb-intel`.

Prompts 01–04 and follow-on 04A / 04B / 04C have been executed.

## Objective

Add plain-language production documentation for HB Kudos permissions so admins and site owners understand:

- where permissions actually come from
- what the two canonical groups do
- how to update membership when necessary
- that page/webpart configuration is not the source of truth

## Documentation requirements

Create or update documentation in a location that is easy to find and appropriate for operational use.

The documentation must be written in layman’s terms.

It must clearly explain:

### 1. Source of truth
- Permissions for the HB Kudos companion app come from Entra ID security group membership.
- The app does not use editable webpart property fields to decide who is an admin or reviewer.

### 2. Group roles
- `HB Kudos Admins` — brief plain-language summary of what admins can do
- `HB Kudos Reviewers` — brief plain-language summary of what reviewers can do

### 3. How to change membership
Provide brief plain-language instructions for authorized admins to update membership in Microsoft Entra ID.

The instructions should be simple and current-sounding, for example:
- sign in to the Microsoft Entra admin center
- go to Entra ID / Groups / All groups
- open `HB Kudos Admins` or `HB Kudos Reviewers`
- open Members
- add or remove users as needed

### 4. Important operational note
State clearly that:
- changing page settings or webpart properties does not change app permissions
- only group membership changes permissions

## Additional closure-prep tasks

1. Update any repo comments or operator-facing notes that still imply per-instance permission config.
2. Add a concise implementation note summarizing:
   - property-pane permission fields removed
   - security-group-only authority model implemented
   - documentation location
3. Ensure the repo is ready to proceed to final Prompt 05 validation/packaging after this step.

## Deliverables

- user/admin-facing layman-friendly permissions documentation
- concise implementation/change summary
- confirmation that the repo is ready to resume final validation/package closure

