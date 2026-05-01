# Wave 10 Required Fields and Statuses

## Required Target-Added Fields

These fields must exist in model contracts and deterministic fixtures:

- permit `revision`
- permit `applicationValue`
- permit `permitFee`
- inspection `reInspectionFee`

## Internal Source Families

Preserve internal source-family continuity:

- `permits`
- `required-inspections`

## Permit Model Fields

Planned permit record fields include:

- `permitId`
- `permitNumber`
- `permitType`
- `location`
- `description`
- `responsibleParty`
- `ahjName`
- `status`
- `dateRequired`
- `dateSubmitted`
- `dateReceived`
- `dateExpires`
- `revision`
- `applicationValue`
- `permitFee`
- `comments`
- `evidenceLinks`
- `auditEvents`

## Inspection Model Fields

Planned inspection record fields include:

- `inspectionId`
- `inspectionNumber`
- `inspectionType`
- `inspectionCode`
- `relatedPermitId`
- `dateCalledIn`
- `scheduledWindow`
- `resultStatus`
- `comment`
- `verifiedOnline`
- `reinspectionRequired`
- `reInspectionFee`
- `evidenceLinks`
- `auditEvents`

## AHJ / Jurisdiction Profile Fields

- `ahjId`
- `ahjDisplayName`
- `jurisdictionType`
- `portalUrl`
- `inspectionPortalUrl`
- `contactName`
- `contactPhone`
- `contactEmail`
- `cutoffNotes`
- `launcherOnly`

`launcherOnly` must remain `true` in the current Wave 10 posture.

## Fee Exposure Fields

- `feeRecordId`
- `relatedRecordType`
- `relatedRecordId`
- `applicationValue`
- `permitFee`
- `reInspectionFee`
- `feeStatus`
- `invoiceReference`
- `receiptEvidenceLinks`
- `notes`

## Reinspection Lineage Fields

- `parentInspectionId`
- `childReinspectionId`
- `failedItemSummary`
- `correctiveActionOwner`
- `correctiveActionDueDate`
- `reinspectionRequired`
- `reinspectionRequestedDate`
- `reinspectionScheduledWindow`
- `reInspectionFee`
- `reinspectionResult`
- `evidenceLinks`
- `auditEvents`

## Permit Statuses

- `not-started`
- `pending-application`
- `application-submitted`
- `pending-revision`
- `approved`
- `received`
- `active`
- `expiring`
- `expired`
- `void`
- `closed`

## Inspection Statuses

- `not-ready`
- `ready-to-request`
- `requested`
- `scheduled`
- `partial`
- `passed`
- `failed`
- `reinspection-required`
- `reinspection-scheduled`
- `closed`
- `not-applicable`

## Fee Statuses

- `not-applicable`
- `open`
- `pending-receipt`
- `paid`
- `waived`
- `disputed`

## Evidence Statuses

- `not-required`
- `required-missing`
- `submitted`
- `verified`
- `override-approved`
