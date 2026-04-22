# User Information List

## 1. Objective
- Tenant-backed schema/reference snapshot for `User Information List` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.

## 2. List-Level Metadata
- List ID: `d91ee3bb-ae9e-43a1-a082-f971c2b42e93`
- Entity Type Name: `UserInfo`
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_catalogs/users/detail.aspx`
- Default View URL: `/sites/HBCentral/_catalogs/users/detail.aspx`
- Root Folder URL: `/sites/HBCentral/_catalogs/users`
- Base Template / Base Type: `112` / `0`
- Classification: `hidden/system`
- Description: `All people.`
- Hidden: `true`
- Item Count: `55`
- Content Types Enabled: `false`
- Versioning: `EnableVersioning=false`, `EnableMinorVersions=false`, `MajorVersionLimit=0`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `true`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| Attachments | Attachments | Attachments | No | No | No | No |  |
| Content Type | ContentType | Computed | No | No | No | No |  |
| OtherMail | OtherMail | Text | No | No | No | No | MaxLength=255 |
| Color Tag | _ColorTag | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Label setting | _ComplianceFlags | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label | _ComplianceTag | Lookup | No | No | Yes | No | System/OOB-like |
| Label applied by | _ComplianceTagUserId | Lookup | No | No | Yes | No | System/OOB-like |
| Retention label Applied | _ComplianceTagWrittenTime | Lookup | No | No | Yes | No | System/OOB-like |
| Has Copy Destinations | _HasCopyDestinations | Boolean | No | Yes | Yes | No | System/OOB-like |
| Item is a Record | _IsRecord | Computed | No | No | Yes | No | System/OOB-like |
| Approval Status | _ModerationStatus | ModStat | No | Yes | Yes | No | Choices: 0;#Approved, 1;#Rejected, 2;#Pending, 3;#Draft, 4;#Scheduled; Default=0; System/OOB-like |
| Version | _UIVersionString | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| App Created By | AppAuthor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| App Modified By | AppEditor | Lookup | No | No | Yes | No | Lookup->AppPrincipals.Title; System/OOB-like |
| Created By | Author | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Compliance Asset Id | ComplianceAssetId | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Content Type | ContentTypeDisp | Computed | No | No | Yes | No | System/OOB-like |
| Content Type ID | ContentTypeId | ContentTypeId | No | Yes | Yes | No | System/OOB-like |
| Created | Created | DateTime | No | No | Yes | No | System/OOB-like |
| Deleted | Deleted | Boolean | No | No | Yes | No | Default=FALSE; System/OOB-like |
| Department | Department | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Type | DocIcon | Computed | No | No | Yes | No | System/OOB-like |
| Edit | Edit | Computed | No | No | Yes | No | System/OOB-like |
| Modified By | Editor | User | No | No | Yes | No | Lookup->User Information List.Id; SelectionMode=1; SelectionGroup=0; System/OOB-like |
| Edit | EditUser | Computed | No | No | Yes | No | System/OOB-like |
| E-Mail | EMail | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Name | FileLeafRef | File | No | Yes | No | No | System/OOB-like |
| URL Path | FileRef | Lookup | No | Yes | Yes | No | System/OOB-like |
| First name | FirstName | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Folder Child Count | FolderChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| GUID | GUID | Guid | No | Yes | Yes | No | System/OOB-like |
| ID | ID | Counter | No | No | Yes | No | System/OOB-like |
| Name | ImnName | Computed | No | No | Yes | No | System/OOB-like |
| Is Site Admin | IsSiteAdmin | Boolean | No | No | Yes | No | Default=FALSE; System/OOB-like |
| Item Child Count | ItemChildCount | Lookup | No | No | Yes | No | System/OOB-like |
| Job Title | JobTitle | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Last name | LastName | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Name | LinkTitle | Computed | No | No | Yes | No | System/OOB-like |
| Name | LinkTitleNoMenu | Computed | No | No | Yes | No | System/OOB-like |
| Mobile Number | MobilePhone | Text | No | No | Yes | No | MaxLength=127; System/OOB-like |
| Modified | Modified | DateTime | No | No | Yes | No | System/OOB-like |
| Account | Name | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Name | NameWithPictureAndDetails | Computed | No | No | Yes | No | System/OOB-like |
| About Me | Notes | Note | No | No | Yes | No | RichText=true; Lines=6; System/OOB-like |
| Office | Office | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Picture | Picture | URL | No | No | Yes | No | System/OOB-like |
| Picture Only | PictureOnly_Size_36px | Computed | No | No | Yes | No | System/OOB-like |
| Picture Only | PictureOnly_Size_48px | Computed | No | No | Yes | No | System/OOB-like |
| Picture Only | PictureOnly_Size_72px | Computed | No | No | Yes | No | System/OOB-like |
| SIP Address | SipAddress | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Picture Exchange Sync State | SPSPictureExchangeSyncState | Integer | No | No | Yes | No | System/OOB-like |
| Picture Placeholder State | SPSPicturePlaceholderState | Integer | No | No | Yes | No | System/OOB-like |
| Picture Timestamp | SPSPictureTimestamp | Note | No | No | Yes | No | RichText=false; Lines=6; System/OOB-like |
| Ask Me About | SPSResponsibility | Note | No | No | Yes | No | RichText=false; Lines=6; System/OOB-like |
| SPS-UserType | SPSUserType | Integer | No | No | Yes | No | System/OOB-like |
| Name | Title | Text | Yes | No | Yes | No | MaxLength=255; System/OOB-like |
| Unique Id | UniqueId | Lookup | No | Yes | Yes | No | System/OOB-like |
| User Expiration | UserExpiration | DateTime | No | No | Yes | No | System/OOB-like |
| Hidden | UserInfoHidden | Boolean | No | No | Yes | No | Default=FALSE; System/OOB-like |
| User Last Deletion Time | UserLastDeletionTime | DateTime | No | No | Yes | No | System/OOB-like |
| User name | UserName | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |
| Selection Checkbox | UserSelection | Computed | No | No | Yes | No | System/OOB-like |
| Web site | WebSite | URL | No | No | Yes | No | System/OOB-like |
| Work phone | WorkPhone | Text | No | No | Yes | No | MaxLength=255; System/OOB-like |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: `Person, SharePointGroup, DomainGroup`
- Default New Form: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_layouts/15/aclinv.aspx`
- Default Edit Form: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_layouts/15/useredit.aspx`
- Default Display Form: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/_layouts/15/userdisp.aspx`
- Appears Custom Forms (URL heuristic): `true`
- Observed Role Hint: `list role inferred from schema and naming`

## 5. Relationship Observations
- Outbound lookup references: AppPrincipals, User Information List.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `3`
- Hidden fields: `76`
- Non-hidden lookup fields: `4`
- Unique-enforced fields: `0`
- Indexed non-hidden fields: `0`
- System/OOB fields are included where integration-relevant; app contracts should prefer non-hidden business fields unless specific OOB audit/compliance metadata is required.

## 7. Open Questions / Follow-Up Checks
- Confirm custom form bindings in list settings if app UX depends on Power Apps forms.
- Confirm canonical join keys and index strategy for production query patterns.
- Re-extract after provisioning changes or when schema drift is suspected.
