# Hosted Parity Failure Tree

Use this as the decision model during execution.

## Step 1 — Is the hosted tenant rendering the expected packaged output?

Required checks:

- inspect the attached `hb-intel-homepage.sppkg`
- compare package version / manifest truth / relevant bundle contents against the local repo
- verify the package actually contains the Priority Actions Rail and HB Homepage changes the repo claims are present
- verify the deployed artifact path is the one expected by the tenant

If **no**, the primary issue is **package/deployment parity failure**.

If **yes**, continue.

---

## Step 2 — Is the homepage actually mounting the intended rail path?

Required checks:

- is `HbHomepageEntryStack` present in the mounted homepage path?
- is the embedded rail enabled through wrapper config?
- is the embedded rail receiving `surfaceContext="homepage-flagship"`?
- is the current tenant path mounting a different rail/webpart instance than expected?

If **no**, the primary issue is **wrong render path / wrong mount path / wrong integration seam**.

If **yes**, continue.

---

## Step 3 — Is the flagship shared surface styling actually present and active?

Required checks:

- does the active render carry the expected root data attributes / classnames?
- is the flagship context class present?
- is the correct shared CSS loaded?
- are the distinctive flagship tile/grid rules actually applied?

If **no**, the primary issue is **flagship styling not reaching hosted runtime**.

If **yes**, continue.

---

## Step 4 — Does the live logic still collapse into a weak generic layout?

Required checks:

- are primary items selected linearly before grouping?
- does the current grouping logic produce singleton or low-value sections?
- does the current config/data state prevent the flagship visual structure from reading well?
- do desktop/tablet modes still flatten into sparse repeated cards despite the stronger CSS?

If **yes**, the primary issue is **logic/presentation still producing a generic outcome**.

If **no**, continue.

---

## Step 5 — Did stale closure reasoning allow contradiction to stand?

Required checks:

- did prior docs/prompts treat repo presence as proof of hosted success?
- were hosted screenshots missing or ignored?
- did the prior package allow “already implemented” as a valid endpoint?

If **yes**, explicitly document that failure and correct it in the final closure summary.
