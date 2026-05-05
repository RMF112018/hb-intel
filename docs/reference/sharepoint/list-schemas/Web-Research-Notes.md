# Web Research Notes

## Microsoft / SharePoint / Graph Sources Used

- Microsoft Learn — SharePoint limits: service limits for lists, libraries, attachments, unique permissions, and list/library counts.
- Microsoft Learn — list view threshold troubleshooting: confirms the 5,000 list view threshold behavior in SharePoint Online.
- Microsoft Learn — Microsoft Graph `listItem`: confirms SharePoint list items are represented as listItem resources and field values are exposed through `fieldValueSet`.
- Microsoft Learn — Microsoft Graph `columnDefinition`: confirms typed column metadata and the `indexed` property.
- Microsoft Learn — create list / create list item / create columnDefinition Graph APIs: confirms permission posture for list/schema operations.
- Microsoft Learn — Selected permissions overview: confirms selected scopes for Sites, Lists, ListItems, Files and the explicit assignment model.
- Microsoft Learn — PnP provisioning schema: confirms provisioning templates model site fields, content types, and lists.

## Audit Impact

- Avoid attachments for evidence records.
- Avoid item-level unique permissions.
- Use stable indexed text keys for operational filters.
- Use JSON/note fields only for payloads, not views.
- Prepare this schema package so it can later be converted into Graph or PnP provisioning assets.
