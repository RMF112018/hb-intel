# Entra ID Directory Response Shape Report

## 1. Query Method Used

- **Observed directly:** Primary evidence was captured using Microsoft Graph via `az rest` (live Entra directory queries).
- **Observed directly:** CLI comparison variants used `az ad user show` and `az ad user list`.
- **Observed directly:** Direct full-shape calls were run **without `$select`**:
  - `GET https://graph.microsoft.com/v1.0/users/bfetting@hedrickbrothers.com`
  - `GET https://graph.microsoft.com/beta/users/bfetting@hedrickbrothers.com`
- **Observed directly:** Search calls required `ConsistencyLevel: eventual` and correctly quoted URLs.

## 2. Authentication / Permission Context

- **Observed directly:** Azure CLI delegated user context (tenant `0e834bd7-628b-42c8-b9ec-ecebc9719be4`, user `bfetting@hedrickbrothers.com`).
- **Observed directly:** Token acquisition path: `az account get-access-token --resource-type ms-graph`.
- **Observed directly:** Both direct user calls succeeded (HTTP 200) for `v1.0` and `beta`.

## 3. Full Direct User Query Executed

- **Observed directly:** `GET /v1.0/users/bfetting@hedrickbrothers.com` (no `$select`) → **200 OK**.
- **Observed directly:** `GET /beta/users/bfetting@hedrickbrothers.com` (no `$select`) → **200 OK**.
- **Observed directly:** Auth header used delegated bearer token from Azure CLI Graph token flow.
- **Observed directly:** `v1.0` returned a narrower default shape; `beta` returned the fullest retrievable default shape in this environment.

## 4. Raw Full Response Shape

- **Observed directly:** Redacted full raw payloads are recorded in supporting artifact:
  - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Directory-Response-Shape-Record.raw-redacted.json`
- **Observed directly:** Direct lookup top-level field counts:
  - `v1.0`: **12** fields (default direct shape)
  - `beta`: **74** fields (fullest retrievable default direct shape)
- **Inferred from observed evidence:** For this environment, `beta` direct lookup is the canonical source when the objective is fullest record-shape capture.

## 5. Complete Top-Level Field Inventory

- **Observed directly:** Inventory below includes **every field returned** by the live direct-user responses (`v1.0` + `beta`).

| Field | Presence | Observed Type | Sample State | Redacted Sample |
|---|---|---|---|---|
| `@odata.context` | both | `string` | populated | `"ht***y"` |
| `businessPhones` | both | `array` | empty array | `[]` |
| `displayName` | both | `string` | populated | `"Bo***g"` |
| `givenName` | both | `string` | populated | `"Bo***y"` |
| `id` | both | `string` | populated | `"0026a9f0-****-****-****-8e1593fcc37b"` |
| `jobTitle` | both | `string` | populated | `"Pr***e"` |
| `mail` | both | `string` | populated | `"bf***@hedrickbrothers.com"` |
| `mobilePhone` | both | `string` | populated | `"56***75"` |
| `officeLocation` | both | `null` | null | `null` |
| `preferredLanguage` | both | `null` | null | `null` |
| `surname` | both | `string` | populated | `"Fe***g"` |
| `userPrincipalName` | both | `string` | populated | `"bf***@hedrickbrothers.com"` |
| `accountEnabled` | beta only | `boolean` | populated | `true` |
| `ageGroup` | beta only | `null` | null | `null` |
| `agentIdentityBlueprintId` | beta only | `null` | null | `null` |
| `assignedLicenses` | beta only | `array` | populated array | `[{"disabledPlans":[],"skuId":"cbdc14ab-****-****-****-6ada7cdc1d46"},{"disabledPlans":[],"skuId":"5b631642-****-****-***` |
| `assignedPlans` | beta only | `array` | populated array | `[{"assignedDateTime":"20***9Z","capabilityStatus":"En***d","service":"ex***e","servicePlanId":"199a5c09-****-****-****-b` |
| `authorizationInfo` | beta only | `object` | populated object | `{"certificateUserIds":[]}` |
| `city` | beta only | `string` | populated | `"W***"` |
| `cloudRealtimeCommunicationInfo` | beta only | `object` | populated object | `{"isSipEnabled":true}` |
| `companyName` | beta only | `string` | populated | `"He***n"` |
| `consentProvidedForMinor` | beta only | `null` | null | `null` |
| `country` | beta only | `null` | null | `null` |
| `createdDateTime` | beta only | `string` | populated | `"20***1Z"` |
| `creationType` | beta only | `null` | null | `null` |
| `deletedDateTime` | beta only | `null` | null | `null` |
| `department` | beta only | `string` | populated | `"Co***l"` |
| `deviceKeys` | beta only | `array` | populated array | `[{"deviceId":"b83a862d-****-****-****-2e82161d217c","keyMaterial":"[redacted-key-material]","keyType":"N***"},{"deviceId` |
| `employeeHireDate` | beta only | `null` | null | `null` |
| `employeeId` | beta only | `null` | null | `null` |
| `employeeLeaveDateTime` | beta only | `null` | null | `null` |
| `employeeOrgData` | beta only | `null` | null | `null` |
| `employeeType` | beta only | `null` | null | `null` |
| `externalUserConvertedOn` | beta only | `null` | null | `null` |
| `externalUserState` | beta only | `null` | null | `null` |
| `externalUserStateChangeDateTime` | beta only | `null` | null | `null` |
| `faxNumber` | beta only | `null` | null | `null` |
| `identities` | beta only | `array` | populated array | `[{"issuer":"he***m","issuerAssignedId":"bf***@hedrickbrothers.com","signInType":"us***e"}]` |
| `identityParentId` | beta only | `null` | null | `null` |
| `imAddresses` | beta only | `array` | populated array | `["bf***@hedrickbrothers.com"]` |
| `infoCatalogs` | beta only | `array` | empty array | `[]` |
| `isLicenseReconciliationNeeded` | beta only | `boolean` | populated | `false` |
| `isManagementRestricted` | beta only | `null` | null | `null` |
| `isResourceAccount` | beta only | `null` | null | `null` |
| `legalAgeGroupClassification` | beta only | `null` | null | `null` |
| `mailNickname` | beta only | `string` | populated | `"bf***g"` |
| `onPremisesDistinguishedName` | beta only | `string` | populated | `"CN***l"` |
| `onPremisesDomainName` | beta only | `string` | populated | `"hb***l"` |
| `onPremisesExtensionAttributes` | beta only | `object` | populated object | `{"extensionAttribute1":null,"extensionAttribute10":null,"extensionAttribute11":null,"extensionAttribute12":null,"extensi` |
| `onPremisesImmutableId` | beta only | `string` | populated | `"ny***="` |
| `onPremisesLastSyncDateTime` | beta only | `string` | populated | `"20***1Z"` |
| `onPremisesObjectIdentifier` | beta only | `string` | populated | `"1238209f-****-****-****-beab2c27aade"` |
| `onPremisesProvisioningErrors` | beta only | `array` | empty array | `[]` |
| `onPremisesSamAccountName` | beta only | `string` | populated | `"bf***g"` |
| `onPremisesSecurityIdentifier` | beta only | `string` | populated | `"S-***55"` |
| `onPremisesSipInfo` | beta only | `object` | populated object | `{"isSipEnabled":false,"sipDeploymentLocation":null,"sipPrimaryAddress":null}` |
| `onPremisesSyncEnabled` | beta only | `boolean` | populated | `true` |
| `onPremisesUserPrincipalName` | beta only | `string` | populated | `"bf***@hedrickbrothers.com"` |
| `otherMails` | beta only | `array` | empty array | `[]` |
| `passwordPolicies` | beta only | `string` | populated | `"Di***n"` |
| `passwordProfile` | beta only | `null` | null | `null` |
| `postalCode` | beta only | `string` | populated | `"33***9"` |
| `preferredDataLocation` | beta only | `null` | null | `null` |
| `provisionedPlans` | beta only | `array` | populated array | `[{"capabilityStatus":"En***d","provisioningStatus":"Su***s","service":"Sh***t"},{"capabilityStatus":"En***d","provisioni` |
| `proxyAddresses` | beta only | `array` | populated array | `["sm***@hedrickbrotherscom.onmicrosoft.com","SM***@hedrickbrothers.com"]` |
| `refreshTokensValidFromDateTime` | beta only | `string` | populated | `"20***0Z"` |
| `securityIdentifier` | beta only | `string` | populated | `"S-***47"` |
| `serviceProvisioningErrors` | beta only | `array` | empty array | `[]` |
| `showInAddressList` | beta only | `null` | null | `null` |
| `signInSessionsValidFromDateTime` | beta only | `string` | populated | `"20***0Z"` |
| `state` | beta only | `string` | populated | `"F***"` |
| `streetAddress` | beta only | `string` | populated | `"22***e"` |
| `usageLocation` | beta only | `string` | populated | `"U***"` |
| `userType` | beta only | `string` | populated | `"Me***r"` |

## 6. Nested Field Inventory

- **Observed directly:** Complex/nested fields observed in direct `beta` response: **16**.

| Field | Kind | Cardinality State | Size | Nested Keys Observed | Redacted Sample |
|---|---|---|---:|---|---|
| `assignedLicenses` | `array` | populated | 7 | `disabledPlans`, `skuId` | `{"disabledPlans":[],"skuId":"cbdc14ab-****-****-****-6ada7cdc1d46"}` |
| `assignedPlans` | `array` | populated | 88 | `assignedDateTime`, `capabilityStatus`, `service`, `servicePlanId` | `{"assignedDateTime":"20***9Z","capabilityStatus":"En***d","service":"ex***e","servicePlanId":"199a5c09-****-**` |
| `authorizationInfo` | `object` | populated | 1 | `certificateUserIds` | `{"certificateUserIds":[]}` |
| `businessPhones` | `array` | empty | 0 | `(scalar array or empty)` | `null` |
| `cloudRealtimeCommunicationInfo` | `object` | populated | 1 | `isSipEnabled` | `{"isSipEnabled":true}` |
| `deviceKeys` | `array` | populated | 3 | `deviceId`, `keyMaterial`, `keyType` | `{"deviceId":"b83a862d-****-****-****-2e82161d217c","keyMaterial":"[redacted-key-material]","keyType":"N***"}` |
| `identities` | `array` | populated | 1 | `issuer`, `issuerAssignedId`, `signInType` | `{"issuer":"he***m","issuerAssignedId":"bf***@hedrickbrothers.com","signInType":"us***e"}` |
| `imAddresses` | `array` | populated | 1 | `(scalar array or empty)` | `"bf***@hedrickbrothers.com"` |
| `infoCatalogs` | `array` | empty | 0 | `(scalar array or empty)` | `null` |
| `onPremisesExtensionAttributes` | `object` | populated | 15 | `extensionAttribute1`, `extensionAttribute10`, `extensionAttribute11`, `extensionAttribute12`, `extensionAttribute13`, `extensionAttribute14`, `extensionAttribute15`, `extensionAttribute2`, `extensionAttribute3`, `extensionAttribute4`, `extensionAttribute5`, `extensionAttribute6`, `extensionAttribute7`, `extensionAttribute8`, `extensionAttribute9` | `{"extensionAttribute1":null,"extensionAttribute10":null,"extensionAttribute11":null,"extensionAttribute12":nul` |
| `onPremisesProvisioningErrors` | `array` | empty | 0 | `(scalar array or empty)` | `null` |
| `onPremisesSipInfo` | `object` | populated | 3 | `isSipEnabled`, `sipDeploymentLocation`, `sipPrimaryAddress` | `{"isSipEnabled":false,"sipDeploymentLocation":null,"sipPrimaryAddress":null}` |
| `otherMails` | `array` | empty | 0 | `(scalar array or empty)` | `null` |
| `provisionedPlans` | `array` | populated | 20 | `capabilityStatus`, `provisioningStatus`, `service` | `{"capabilityStatus":"En***d","provisioningStatus":"Su***s","service":"Sh***t"}` |
| `proxyAddresses` | `array` | populated | 2 | `(scalar array or empty)` | `"sm***@hedrickbrotherscom.onmicrosoft.com"` |
| `serviceProvisioningErrors` | `array` | empty | 0 | `(scalar array or empty)` | `null` |

- **Not observed / not proven:** Any nested field not present in the direct response is not asserted as unsupported.

## 7. Comparison to Search / Filter / Selected Shapes

- **Observed directly:** Search response shape (`$search`) was collection envelope with `@odata.context`, optional `@odata.nextLink`, and `value[]` user objects.
- **Observed directly:** Filter response shape (successful `userPrincipalName eq ...`) was collection envelope with `value[]`.
- **Observed directly:** Selected shape (direct `$select`) returned partial single-object payload with selected fields only.
- **Observed directly:** Unsupported filter variant `startswith(surname,'smith')` returned Graph error:

```
ERROR: Bad Request({"error":{"code":"Request_UnsupportedQuery","message":"Unsupported Query.","innerError":{"date":"2026-04-11T19:02:02","request-id":"2a0ed920-0d5f-4365-887c-879d0d206eb6","client-request-id":"2a0ed920-0d5f-4365-887c-879d0d206eb6"}}})
```

- **Inferred from observed evidence:** Collection/search/filter shapes are partial retrieval shapes; direct no-`$select` `beta` is the fullest shape captured.

## 8. Field Dictionary (Complete)

- **Observed directly:** Complete dictionary below includes every observed top-level field from direct lookup evidence.

| Field | Type | Value State | Redacted Sample | Version Presence | Identity Key | Display | Search Normalization | Ranking | Metadata Only |
|---|---|---|---|---|---|---|---|---|---|
| `@odata.context` | `string` | populated | `"ht***y"` | both | no | no | no | no | yes |
| `businessPhones` | `array` | empty array | `[]` | both | no | no | no | no | yes |
| `displayName` | `string` | populated | `"Bo***g"` | both | no | yes | yes | yes | no |
| `givenName` | `string` | populated | `"Bo***y"` | both | no | yes | yes | yes | no |
| `id` | `string` | populated | `"0026a9f0-****-****-****-8e1593fcc37b"` | both | yes | no | no | no | no |
| `jobTitle` | `string` | populated | `"Pr***e"` | both | no | yes | no | no | no |
| `mail` | `string` | populated | `"bf***@hedrickbrothers.com"` | both | yes | yes | yes | yes | no |
| `mobilePhone` | `string` | populated | `"56***75"` | both | no | no | no | no | yes |
| `officeLocation` | `null` | null | `null` | both | no | yes | no | no | no |
| `preferredLanguage` | `null` | null | `null` | both | no | no | no | no | yes |
| `surname` | `string` | populated | `"Fe***g"` | both | no | yes | yes | yes | no |
| `userPrincipalName` | `string` | populated | `"bf***@hedrickbrothers.com"` | both | yes | yes | yes | yes | no |
| `accountEnabled` | `boolean` | populated | `true` | beta only | no | no | no | yes | no |
| `ageGroup` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `agentIdentityBlueprintId` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `assignedLicenses` | `array` | populated array | `[{"disabledPlans":[],"skuId":"cbdc14ab-****-****-****-6ada7cdc1d46"},{` | beta only | no | no | no | no | yes |
| `assignedPlans` | `array` | populated array | `[{"assignedDateTime":"20***9Z","capabilityStatus":"En***d","service":"` | beta only | no | no | no | no | yes |
| `authorizationInfo` | `object` | populated object | `{"certificateUserIds":[]}` | beta only | no | no | no | no | yes |
| `city` | `string` | populated | `"W***"` | beta only | no | no | no | no | yes |
| `cloudRealtimeCommunicationInfo` | `object` | populated object | `{"isSipEnabled":true}` | beta only | no | no | no | no | yes |
| `companyName` | `string` | populated | `"He***n"` | beta only | no | yes | no | no | no |
| `consentProvidedForMinor` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `country` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `createdDateTime` | `string` | populated | `"20***1Z"` | beta only | no | no | no | no | yes |
| `creationType` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `deletedDateTime` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `department` | `string` | populated | `"Co***l"` | beta only | no | yes | no | no | no |
| `deviceKeys` | `array` | populated array | `[{"deviceId":"b83a862d-****-****-****-2e82161d217c","keyMaterial":"[re` | beta only | no | no | no | no | yes |
| `employeeHireDate` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `employeeId` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `employeeLeaveDateTime` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `employeeOrgData` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `employeeType` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `externalUserConvertedOn` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `externalUserState` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `externalUserStateChangeDateTime` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `faxNumber` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `identities` | `array` | populated array | `[{"issuer":"he***m","issuerAssignedId":"bf***@hedrickbrothers.com","si` | beta only | no | no | no | no | yes |
| `identityParentId` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `imAddresses` | `array` | populated array | `["bf***@hedrickbrothers.com"]` | beta only | no | no | no | no | yes |
| `infoCatalogs` | `array` | empty array | `[]` | beta only | no | no | no | no | yes |
| `isLicenseReconciliationNeeded` | `boolean` | populated | `false` | beta only | no | no | no | no | yes |
| `isManagementRestricted` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `isResourceAccount` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `legalAgeGroupClassification` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `mailNickname` | `string` | populated | `"bf***g"` | beta only | yes | no | yes | no | no |
| `onPremisesDistinguishedName` | `string` | populated | `"CN***l"` | beta only | no | no | no | no | yes |
| `onPremisesDomainName` | `string` | populated | `"hb***l"` | beta only | no | no | no | no | yes |
| `onPremisesExtensionAttributes` | `object` | populated object | `{"extensionAttribute1":null,"extensionAttribute10":null,"extensionAttr` | beta only | no | no | no | no | yes |
| `onPremisesImmutableId` | `string` | populated | `"ny***="` | beta only | yes | no | no | no | no |
| `onPremisesLastSyncDateTime` | `string` | populated | `"20***1Z"` | beta only | no | no | no | no | yes |
| `onPremisesObjectIdentifier` | `string` | populated | `"1238209f-****-****-****-beab2c27aade"` | beta only | yes | no | no | no | no |
| `onPremisesProvisioningErrors` | `array` | empty array | `[]` | beta only | no | no | no | no | yes |
| `onPremisesSamAccountName` | `string` | populated | `"bf***g"` | beta only | no | no | yes | no | no |
| `onPremisesSecurityIdentifier` | `string` | populated | `"S-***55"` | beta only | yes | no | no | no | no |
| `onPremisesSipInfo` | `object` | populated object | `{"isSipEnabled":false,"sipDeploymentLocation":null,"sipPrimaryAddress"` | beta only | no | no | no | no | yes |
| `onPremisesSyncEnabled` | `boolean` | populated | `true` | beta only | no | no | no | no | yes |
| `onPremisesUserPrincipalName` | `string` | populated | `"bf***@hedrickbrothers.com"` | beta only | no | no | no | no | yes |
| `otherMails` | `array` | empty array | `[]` | beta only | no | no | no | no | yes |
| `passwordPolicies` | `string` | populated | `"Di***n"` | beta only | no | no | no | no | yes |
| `passwordProfile` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `postalCode` | `string` | populated | `"33***9"` | beta only | no | no | no | no | yes |
| `preferredDataLocation` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `provisionedPlans` | `array` | populated array | `[{"capabilityStatus":"En***d","provisioningStatus":"Su***s","service":` | beta only | no | no | no | no | yes |
| `proxyAddresses` | `array` | populated array | `["sm***@hedrickbrotherscom.onmicrosoft.com","SM***@hedrickbrothers.com` | beta only | no | no | yes | no | no |
| `refreshTokensValidFromDateTime` | `string` | populated | `"20***0Z"` | beta only | no | no | no | no | yes |
| `securityIdentifier` | `string` | populated | `"S-***47"` | beta only | yes | no | no | no | no |
| `serviceProvisioningErrors` | `array` | empty array | `[]` | beta only | no | no | no | no | yes |
| `showInAddressList` | `null` | null | `null` | beta only | no | no | no | no | yes |
| `signInSessionsValidFromDateTime` | `string` | populated | `"20***0Z"` | beta only | no | no | no | no | yes |
| `state` | `string` | populated | `"F***"` | beta only | no | no | no | no | yes |
| `streetAddress` | `string` | populated | `"22***e"` | beta only | no | no | no | no | yes |
| `usageLocation` | `string` | populated | `"U***"` | beta only | no | no | no | no | yes |
| `userType` | `string` | populated | `"Me***r"` | beta only | no | no | no | yes | no |

## 9. Recommended Parsing Contract

- **Inferred from observed evidence:** Parser should support both direct-single-object and collection envelopes.
- **Inferred from observed evidence:** For full-profile fetch, use direct `/users/{upn}` and prefer `beta` when policy permits full-shape capture.
- **Inferred from observed evidence:** Treat non-core fields as optional/null-safe; preserve unknown fields for forward compatibility.
- **Observed directly:** Error envelopes should preserve `error.code` and `error.message` (e.g., `Request_UnsupportedQuery`).

## 10. Recommended Search/Ranking Fields

- **Inferred from observed evidence:** Human-name-first search: `displayName`, `givenName`, `surname`.
- **Inferred from observed evidence:** Email fallback: `mail` then `userPrincipalName`.
- **Inferred from observed evidence:** Stable identity key: `id`.
- **Inferred from observed evidence:** Ranking signals: name fields + email/UPN + `accountEnabled` (de-prioritize disabled accounts).
- **Inferred from observed evidence:** Metadata-only fields (licenses, provisioning, on-prem sync internals) should not be primary search keys.

## 11. Open Questions / Risks

- **Observed directly:** `v1.0` default direct response is significantly narrower than `beta` in this tenant.
- **Not observed / not proven:** Whether all tenants expose the same `beta` field set under equivalent permissions.
- **Observed directly:** Some filter patterns are unsupported in this query context (`startswith(surname,'smith')`).
- **Inferred from observed evidence:** Downstream code must tolerate missing/null/empty values and shape differences between direct, selected, search, and filter responses.

## 12. User Photo Query Method

- **Observed directly:** Live Microsoft Graph photo endpoints were queried via delegated Azure CLI token flow (`az account get-access-token --resource-type ms-graph`).
- **Observed directly:** Method used for all photo calls: `GET`.
- **Observed directly:** Endpoints executed:
  - `GET /v1.0/users/bfetting@hedrickbrothers.com/photo`
  - `GET /v1.0/users/bfetting@hedrickbrothers.com/photo/$value`
  - `GET /v1.0/users/jgander@hedrickbrothers.com/photo`
  - `GET /v1.0/users/jgander@hedrickbrothers.com/photo/$value`
  - `GET /beta/users/bfetting@hedrickbrothers.com/photo`
  - `GET /beta/users/bfetting@hedrickbrothers.com/photo/$value`
  - `GET /beta/users/jgander@hedrickbrothers.com/photo`
  - `GET /beta/users/jgander@hedrickbrothers.com/photo/$value`
- **Inferred from observed evidence:** Photo retrieval is a separate Graph retrieval path from user profile retrieval.

## 13. Photo Metadata Response Shape

- **Observed directly (photo present, v1.0 and beta):** `/photo` returned JSON metadata with status `200`.
- **Observed directly:** Top-level fields returned:
  - `@odata.context` (`string`)
  - `@odata.mediaContentType` (`string`, observed `image/jpeg`)
  - `@odata.mediaEtag` (`string`)
  - `height` (`number`, observed `256`)
  - `id` (`string`, observed `default`)
  - `width` (`number`, observed `256`)
- **Observed directly:** v1.0 and beta metadata key shape matched in this environment.
- **Observed directly (missing photo):** `/photo` returned `404` JSON error envelope (see section 15).
- **Not observed / not proven:** Additional metadata fields beyond the 6 keys above were not returned in these live calls.

## 14. Photo Binary Response Behavior

- **Observed directly (photo present, v1.0):** `/photo/$value` returned:
  - status `200`
  - `content-type: image/jpeg`
  - binary JPEG body (omitted from docs/artifacts)
  - saved probe artifact characteristics: JPEG, 256x256, non-empty body
- **Observed directly (photo present, beta):** `/photo/$value` returned equivalent behavior (`200`, `image/jpeg`, binary JPEG body).
- **Observed directly:** Binary endpoint success response is not JSON.
- **Observed directly (missing photo, v1.0 and beta):** `/photo/$value` returned `404` with JSON error body (not binary).
- **Inferred from observed evidence:** Avatar fetch logic must branch by HTTP status/content-type rather than assuming JSON.

## 15. Photo Error / Missing-Photo Shapes

- **Observed directly (missing photo metadata endpoint):**
  - endpoint: `/users/jgander@hedrickbrothers.com/photo`
  - status: `404`
  - envelope: `{"error": {...}}`
  - `error.code`: `ImageNotFound`
  - `error.message`: `Exception of type 'Microsoft.Fast.Profile.Core.Exception.ImageNotFoundException' was thrown.`
  - `error.innerError` keys observed: `date`, `request-id`, `client-request-id`
- **Observed directly (missing photo binary endpoint):**
  - endpoint: `/users/jgander@hedrickbrothers.com/photo/$value`
  - status: `404`
  - `content-type: application/json`
  - same `ImageNotFound` error envelope shape as metadata endpoint
- **Inferred from observed evidence:** `ImageNotFound` is a normal fallback condition, not a fatal directory lookup failure.
- **Not observed / not proven:** Other photo error families (auth denied, throttling, transient upstream errors) were not encountered in this run.

## 16. Recommended Avatar Retrieval Contract for HB Kudos

- **Observed directly:** User profile lookup response does not include inline binary photo data.
- **Inferred from observed evidence:** HB Kudos should treat avatar retrieval as a separate path from user lookup.
- **Inferred from observed evidence:** Recommended order:
  1. Resolve directory user record (`/users/{upn-or-id}` or equivalent list/search path).
  2. Retrieve photo (`/photo` metadata then `/$value`, or direct `/$value` if metadata is optional for caller).
  3. On `404 ImageNotFound`, fall back to initials/avatar placeholder without failing user resolution.
- **Inferred from observed evidence:** Optional cache hints can use ETag/media metadata from `/photo` when available.
- **Not observed / not proven:** Sized photo variant contract (`/photos/{size}`) was not exercised in this pass.
