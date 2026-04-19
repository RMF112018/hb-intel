# Prioritized Remediation Plan

## Planning rule

This plan sequences the work intelligently, but it does **not** defer required work out of scope. Every prompt below addresses a closure-relevant defect that belongs in the package now.

## Phase order

### Step 1 — Close the first durable hosted boundary

Start with the SharePoint persistence seam.

Why first:

- It is the earliest durable hosted write boundary.
- If it does not work, later proof is meaningless.
- It will flush out auth/config/schema issues immediately.

### Step 2 — Correct project-index field resolution

Fix this before trusting matching outcomes.

Why second:

- A lane that “runs” but matches against the wrong fields is not actually correct.
- This is a contained code seam with high correctness leverage.

### Step 3 — Reconcile host composition and registration truth

Make one explicit decision about the authoritative host entrypoint for this lane.

Why third:

- Persistence can be tested early, but closure still requires route-registration truth.
- This step stabilizes what the artifact is supposed to package.

### Step 4 — Reconcile hosting model and deployment method truth

Align IaC, workflow expectations, and operator runbooks.

Why fourth:

- Once the host surface is explicit, the deployment method must match the real host.
- This prevents false proof caused by the wrong deploy technology.

### Step 5 — Minimize the artifact to the actual runtime graph

Now that host truth is explicit, package only what that host needs.

Why fifth:

- It depends on the entrypoint choice.
- Doing it earlier risks optimizing the wrong artifact shape.

### Step 6 — Harden sync-run schema and operational observability

Promote the service’s operational counters into first-class evidence where appropriate.

Why sixth:

- This step is easier once a hosted run can execute.
- It turns runtime truth into better operational state.

### Step 7 — Standardize hosted validation and closure proof

Finalize the evidence path only after the core seams are made truthful.

Why seventh:

- Otherwise the checklist will describe a lane that does not yet exist.

## Exit criteria for the full plan

The plan is complete only when:

- hosted discovery can create and complete a sync-run record,
- project-index loading obeys the mapper contract,
- required legacy fallback routes register from the chosen host,
- deployment docs and IaC tell one hosting-model story,
- the artifact is narrowed to the chosen runtime graph,
- sync-run evidence is operationally queryable enough,
- and the runbook/checklist captures a real hosted proof path.
