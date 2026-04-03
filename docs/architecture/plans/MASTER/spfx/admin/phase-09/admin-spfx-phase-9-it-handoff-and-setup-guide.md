# Phase 9 — IT Handoff and Setup Guide

## Audience

This guide is for the **IT department** receiving the deployed HB Intel Admin app. It explains how to complete operational setup for the Hybrid Identity feature without editing code.

## What you receive

A deployed Azure Function App with the HB Intel backend and a `.sppkg` file for the Admin SPFx web part. The developer has already:

- Deployed the Function App to Azure
- Configured the Managed Identity
- Published the SPFx package to the tenant app catalog

## Step-by-step setup

### Step 1: Install the SPFx app

1. Go to the **SharePoint admin center** > Active sites > App Catalog site
2. Upload the `.sppkg` file to the Apps for SharePoint library
3. When prompted, trust the solution and approve API permissions if requested
4. Add the web part to the designated admin site page

**This is a standard SharePoint admin action. No code edits required.**

### Step 2: Grant Graph API permissions

The Function App's Managed Identity needs Graph permissions to perform identity operations.

1. Go to the **Entra admin center** (entra.microsoft.com)
2. Navigate to **App registrations** > find the Function App's Managed Identity
3. Go to **API permissions**
4. Add the following **Application** permissions under Microsoft Graph:
   - `User.Read.All`
   - `User.ReadWrite.All`
   - `Group.Read.All`
   - `Group.ReadWrite.All`
   - `GroupMember.Read.All`
   - `GroupMember.ReadWrite.All`
   - `Organization.Read.All`
5. Click **Grant admin consent** for your tenant

**This is a standard Entra admin action. No code edits required.**

### Step 3: Prepare AD DS service account (if using AD DS)

If your environment uses AD DS-synced identities:

1. Create a **dedicated service account** in Active Directory for HB Intel
2. Grant the service account **delegated permissions** scoped to specific target OUs:
   - Create/modify/delete users in designated OUs
   - Create/modify group membership in designated OUs
3. **Do not** grant domain-admin privileges — use least-privilege OU delegation
4. Ensure LDAPS (port 636) is accessible from the Azure Function App's network

**This is a standard AD DS administration action. No code edits required.**

### Step 4: Configure the AD DS connector in the app

1. Open the Admin app and navigate to **Hybrid Identity** (`/entra`)
2. Go to the **Connections** tab
3. Under **AD DS Connector**:
   - Enter the server endpoint (e.g., `dc01.corp.example.com`)
   - Enter port `636` (LDAPS default)
   - Enter the Base DN (e.g., `DC=corp,DC=example,DC=com`)
   - Enter the service account DN
   - Enter the service account password
   - Ensure "Use LDAPS" is checked
4. Click **Save Connection**
5. Click **Test Connection** — status should change to **Healthy**

**Credentials are stored securely in the backend. They are never returned to the browser.**

### Step 5: Confirm Graph permissions in the app

1. Stay on the **Connections** tab
2. Under **Graph Identity Connector**:
   - Click **Confirm Permissions Granted** (confirming you completed Step 2)
3. Click **Test Connection** — status should change to **Healthy**

### Step 6: Verify setup is complete

1. Go to the **Overview** tab — both connectors should show **Healthy** (green)
2. Go to the **Users** tab — search for a known user
3. Verify that:
   - AD DS-synced users appear with an "AD DS" authority badge
   - Cloud-only users appear with a "Cloud" authority badge
   - No preflight warning banners appear

Setup is complete when both connectors are healthy and user search returns results.

## What you should never need to do

- Edit source code files
- Edit `.env` or environment variable files
- Edit `package.json` or manifest files
- Edit backend configuration files
- Edit deployment templates
- Open the repository
- Run command-line tools

All operational setup and ongoing maintenance (including credential rotation) is performed through the app's Connections tab UI.

## Credential rotation

When service account passwords or certificates expire:

1. Go to **Hybrid Identity** > **Connections** tab
2. Update the credential in the AD DS Connector card
3. Click **Save Connection** (resets health to "untested")
4. Click **Test Connection** to verify the new credential works

## Ongoing operations

After setup, operators can:

- Search and manage users through the **Users** tab
- View group membership through the **Groups** tab
- Monitor connector health on the **Overview** tab
- Review operation history on the **History** tab
- Re-test or reconfigure connections as needed on the **Connections** tab

## Troubleshooting

| Symptom | Likely cause | Action |
|---------|-------------|--------|
| "Graph Identity connector is not healthy" banner | Admin consent not granted or expired | Re-grant consent in Entra admin portal, then re-test in app |
| "AD DS connector is not healthy" banner | Network issue or credential problem | Check LDAPS connectivity, verify service account credentials, re-test |
| User search returns no results | Graph connector not healthy | Go to Connections tab and test/fix the Graph connector |
| AD DS operations blocked | AD DS connector not configured or unhealthy | Configure and test in Connections tab |
| Sync-pending after AD DS operation | Normal — Azure AD Connect delta sync in progress | Wait ~30 minutes; no action needed |
| "PHASE_BOUNDARY" error | Operation deferred to future phase | This operation is not yet available |
