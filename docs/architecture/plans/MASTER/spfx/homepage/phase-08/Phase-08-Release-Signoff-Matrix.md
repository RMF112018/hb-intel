# Phase 08 Release Sign-Off Matrix

## Sign-off roles

| Role | Responsibility | Sign-Off Covers |
|------|---------------|-----------------|
| **Product Owner** | Final go/no-go decision | Business readiness, content readiness, user-facing quality |
| **Architecture Reviewer** | Technical readiness | Packaging integrity, runtime seams, import discipline, accessibility posture |
| **SharePoint Admin** | Deployment execution | App Catalog operations, tenant configuration, rollback capability |
| **Corporate Communications** | Content governance | Homepage content quality, authoring governance alignment, Lane C nav readiness |

## Sign-off checklist

### Product Owner

- [ ] All 10 homepage webparts render correctly with sample content
- [ ] Empty, loading, and stale states behave as expected
- [ ] Homepage zone structure matches the governed 5-zone model
- [ ] Content ownership matrix is staffed and operational
- [ ] Freshness policy is communicated to zone owners
- [ ] **SIGN-OFF: Approved for production deployment**

### Architecture Reviewer

- [ ] All verification commands pass (check-types, lint, build, test) for both lanes
- [ ] Bundle sizes are within budget (Lane A < 400 KB, Lane B < 300 KB)
- [ ] Import discipline is enforced (ESLint + structural tests)
- [ ] Mount/dispatch seams are stable and tested
- [ ] Accessibility remediation is complete (5 items fixed, 0 blocking)
- [ ] Release checklist and runtime integrity guide are current
- [ ] `.sppkg` packaging produces valid deployment artifact
- [ ] **SIGN-OFF: Technically ready for deployment**

### SharePoint Admin

- [ ] App Catalog is accessible and operational
- [ ] Previous package version (if any) is documented for rollback
- [ ] Deployment window is scheduled
- [ ] Rollback procedure is understood and tested
- [ ] Post-deployment smoke-test plan is available
- [ ] **SIGN-OFF: Deployment infrastructure ready**

### Corporate Communications

- [ ] Homepage content is authored and reviewed for all zones
- [ ] Authoring governance is understood by zone owners
- [ ] Emergency update path is documented and communicated
- [ ] Navigation governance is operational (no conflicting nav items)
- [ ] **SIGN-OFF: Content and governance ready**

## Sign-off record

| Role | Name | Date | Decision |
|------|------|------|----------|
| Product Owner | | | |
| Architecture Reviewer | | | |
| SharePoint Admin | | | |
| Corporate Communications | | | |
