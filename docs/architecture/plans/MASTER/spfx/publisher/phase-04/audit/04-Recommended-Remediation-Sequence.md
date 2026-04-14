# 04 - Recommended Remediation Sequence

## Recommended order

### 1. Publish / republish / binding identity integrity
Why first:
- This is the most dangerous production seam.
- It directly affects page duplication, stale public content, and binding correctness.
- It influences create, republish, regeneration, archive, and withdraw confidence.

Close in this order:
1. Define the intended identity model for:
   - in-place update
   - regeneration
   - page rename / slug drift
2. Rework page creation/update so `inPlaceUpdate` truly targets the existing bound page
3. Decide whether destination bindings are:
   - one-row authoritative state only, or
   - a lineage-preserving registry
4. Make code/comments/tests agree with that decision

### 2. Team-member user-field closure
Why second:
- It is a likely hard failure on save/edit.
- It blocks one of the app’s core child-record seams.
- It impacts both authoring and published Team Viewer behavior.

Close in this order:
1. Add principal resolution to real SharePoint user id
2. Fix writer input requirements
3. Fix repository read `$select/$expand`
4. Correct descriptor/schema drift
5. Add hosted-proof tests for create/edit/reload

### 3. Workflow completion gaps
Why third:
- The workflow model exists, but some branches are incomplete.
- This is important, but it is less dangerous than page-identity corruption or team-member save failure.

Close in this order:
1. Decide whether `scheduled` is in scope now
2. If yes, implement real scheduled execution
3. If no, remove/disable the branch
4. Fix workflow-history failure-stage classification

### 4. Template-selection and milestone-path completion
Why fourth:
- These are correctness and usability issues, but not the first thing to fix.
- They become cleaner to solve after publish and workflow foundations are stable.

Close in this order:
1. Remove hard-coded monthly override on new article creation
2. Add explicit template selection or blank/default resolver path
3. Add milestone authoring + persistence support if milestone templates remain in scope

### 5. Policy/schema clarity cleanup
Why fifth:
- These are important for maintainability and future scale, but they should follow closure of the truly dangerous seams.

Close in this order:
1. Align descriptors to tenant field names
2. Decide whether `TargetSiteUrl` remains an app-level invariant
3. Hide unsupported destinations until implemented
4. Normalize comments/documentation to repo truth

## Prompt package recommendation

Recommended next step: **one tightly bounded remediation package for only the highest-priority category**.

### First package should target
**Publish / republish / binding identity integrity**

### Why not one prompt per finding immediately
Several of the highest-risk issues are not isolated one-file defects. They share a common design seam:
- republish policy
- page creation/update targeting
- binding-row lifecycle
- page identity guarantees

A fragmented prompt-per-finding approach would increase the chance of closing symptoms while leaving the seam incoherent.

### Suggested follow-on package structure
1. `Plan-Summary.md`
2. `README.md`
3. Prompt 01 — establish intended page/binding identity model
4. Prompt 02 — enforce true in-place republish targeting
5. Prompt 03 — reconcile regeneration and binding-lineage behavior
6. Prompt 04 — hosted verification and closure proof

After that package is closed, generate a second tightly bounded package for:
**Team-member user-field closure**
