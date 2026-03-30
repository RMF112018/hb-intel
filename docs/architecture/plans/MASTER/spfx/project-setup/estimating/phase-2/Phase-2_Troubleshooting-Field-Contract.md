# Troubleshooting: Projects List Field-Contract Failures

> For operators and developers diagnosing data-contract issues in the Project Setup backend.

## How It Works

The `projects-list-mapper.ts` validates every SP list item as it is deserialized. Warnings are structured JSON logs sent to Application Insights via the `ILogger` interface. They never contain PII — only field names and type information.

## Warning Types

### `missing-critical-field`

**Log pattern:** `[field-contract] Critical field 'field_N' is missing or empty`

**Meaning:** A required SharePoint column has no value. The mapper will use a safe default, but the data may be incomplete.

**Critical fields:** `field_1` (ProjectId), `field_3` (ProjectName), `field_9` (RequestState)

**Common causes:**
- The SP list item was created outside the normal submission flow
- A list column was accidentally deleted or renamed
- The CSV import schema has drifted

**Resolution:**
1. Open the HBCentral Projects list in SharePoint
2. Verify the column exists and has the expected internal name
3. Check the item directly in the list view

### `type-mismatch`

**Log pattern:** `[field-contract] Field 'field_N' expected number, got <type>`

**Meaning:** A Number-typed column returned a non-numeric value. The mapper will return `undefined` for optional fields or `0` for `retryCount`.

**Affected fields:** `field_13` (EstimatedValue), `field_24` (RetryCount), `Year`

**Common causes:**
- Manual edit in SharePoint changed a number to text
- Import/migration left non-numeric values in Number columns

**Resolution:** Correct the value in SharePoint directly.

### `json-parse-failure`

**Log pattern:** `[field-contract] Failed to parse JSON array from 'field_N'`

**Meaning:** A MultiLineText column that should contain a JSON array has invalid content. The mapper returns `[]`.

**Affected fields:** `field_10` (GroupMembersJson), `field_11` (GroupLeadersJson), `field_18` (ViewerUPNsJson), `field_19` (AddOnsJson)

**Common causes:**
- Manual edit corrupted the JSON string
- A previous write truncated the value

**Resolution:** Check the raw column value in SharePoint. Valid format is `["value1","value2"]`.

## How to Find These Logs

In Application Insights:
```kusto
traces
| where message contains "[field-contract]"
| project timestamp, message, customDimensions.field, customDimensions.issue
| order by timestamp desc
```

## Field Reference

See `Phase-2_Field-Map-Baseline.md` for the complete field-to-column mapping and `Phase-2_Normalization-Rules.md` for type conversion rules.
