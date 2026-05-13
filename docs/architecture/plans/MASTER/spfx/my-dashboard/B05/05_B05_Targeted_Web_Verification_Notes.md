# 05 — B05 Targeted Web Verification Notes

## Purpose

These notes summarize the time-sensitive external claims that the B05 runtime/OAuth package preserves. They are not a replacement for implementation-time verification against live vendor docs when coding request-body details.

---

## 1. Adobe app type and OAuth posture

- Internal HB use aligns with Adobe’s `CUSTOMER` app posture.
- `PARTNER` is a different posture for other customer accounts and carries certification implications.
- The MVP remains delegated-user OAuth, not a shared-principal queue.

## 2. Scope posture

The MVP queue-read permission remains:

```text
agreement_read:self
```

The Adobe Configure OAuth UI may show:
- scope checkbox: `agreement_read`
- modifier: `self`

The package treats this as the final current MVP scope combination.

## 3. Redirect URI rules

Adobe requires:
- a configured redirect URI,
- the runtime authorization request redirect URI to match an allowed configured value,
- the token-exchange redirect URI to match the same flow.

Multiple Redirect URIs can be added later, but this package deliberately excludes speculative staging/production values.

## 4. Token lifecycle

The architecture preserves:
- access tokens are short-lived,
- refresh tokens can become inactive/expire after an inactivity window,
- refresh-token lifecycle therefore matters operationally,
- refresh failure should degrade to `authorization-required`, not a false empty queue.

## 5. Stable Entra identity

Microsoft identity guidance supports:
- stable data binding through tenant + object ID concepts,
- avoiding mutable username/email-style claims as authorization keys.

The repo currently exposes `oid` and normalized `upn`, which makes the Batch 05 actor design directly implementable.

## 6. Adobe search posture

B05 keeps:
- bounded `POST v6/search` as the queue retrieval baseline,
- exact six supported current-user action statuses,
- no unbounded broad list retrieval followed by browser-side filtering.

## 7. Source handoff caution

Adobe signing URL flows are not the default durable “open my queue item” contract for this feature. The package keeps:
- optional row CTA,
- backend-supplied URL only,
- URL policy validation,
- no guessed links.

## 8. Implementation-time verification requirement

When coding the live search/OAuth client, the agent must verify:
- exact Adobe endpoint URL conventions,
- exact request-body schema/property names,
- exact token endpoint behavior,
- any shard/base-URI behavior necessary for the current HB Adobe environment.

This package closes architecture and configuration direction; it should not freeze guessed JSON casing or unsupported endpoints.
