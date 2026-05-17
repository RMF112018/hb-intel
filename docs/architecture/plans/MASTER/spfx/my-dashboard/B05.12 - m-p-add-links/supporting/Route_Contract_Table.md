# Route Contract Table

| Operation | Method | Route |
|---|---|---|
| Create custom link | POST | `/api/my-work/me/project-links/custom-links` |
| Update custom link | PATCH | `/api/my-work/me/project-links/custom-links/{customLinkId}` |
| Delete custom link | DELETE | `/api/my-work/me/project-links/custom-links/{customLinkId}` |

## Create result statuses
- created
- invalid-input
- authorization-required
- principal-unresolved
- project-not-found
- project-access-denied
- project-link-limit-reached
- source-unavailable

## Update result statuses
- updated
- invalid-input
- authorization-required
- principal-unresolved
- not-found
- owner-required
- source-unavailable

## Delete result statuses
- deleted
- authorization-required
- principal-unresolved
- not-found
- owner-required
- source-unavailable
