<#
.SYNOPSIS
  Idempotently provisions the HB Publisher SharePoint list architecture on HBCentral.

.DESCRIPTION
  - Creates missing lists from the publisher architecture plan.
  - Adds only missing fields with stable internal names.
  - Enforces required/default posture where defined.
  - Validates schema in the same run and fails on mismatch.

  Scope: schema provisioning only.
  Operational note: list data, rows, and system fields are never deleted.

.USAGE
  Device login (delegated):
    pwsh ./packages/sharepoint-docs/infrastructure/provision-publisher-lists.ps1 \
      -ClientId "<entra-app-id>" \
      -Tenant "0e834bd7-628b-42c8-b9ec-ecebc9719be4" \
      -DeviceLogin

  App secret login:
    pwsh ./packages/sharepoint-docs/infrastructure/provision-publisher-lists.ps1 \
      -ClientId "<entra-app-id>" \
      -Tenant "0e834bd7-628b-42c8-b9ec-ecebc9719be4" \
      -ClientSecret "<secret>"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$SiteUrl = "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral",

  [Parameter(Mandatory = $true)]
  [string]$ClientId,

  [Parameter(Mandatory = $true)]
  [string]$Tenant,

  [Parameter(Mandatory = $false)]
  [string]$ClientSecret,

  [Parameter(Mandatory = $false)]
  [switch]$DeviceLogin
)

$ErrorActionPreference = 'Stop'

function Connect-PublisherPnP {
  if (-not [string]::IsNullOrWhiteSpace($ClientSecret)) {
    Write-Host "Connecting with app secret auth..." -ForegroundColor Cyan
    Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -ClientSecret $ClientSecret -Realm $Tenant
    return
  }

  Write-Host "Connecting with delegated auth..." -ForegroundColor Cyan
  if ($DeviceLogin) {
    Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -Tenant $Tenant -DeviceLogin
  }
  else {
    Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -Tenant $Tenant -Interactive
  }
}

function New-FieldDef {
  param(
    [string]$Name,
    [string]$TypeLabel,
    [bool]$Required = $false,
    [object]$DefaultValue = $null,
    [string[]]$Choices = $null,
    [string]$InternalName = $null
  )

  $resolvedInternalName = if ([string]::IsNullOrWhiteSpace($InternalName)) { $Name } else { $InternalName }

  return [PSCustomObject]@{
    Name = $Name
    InternalName = $resolvedInternalName
    TypeLabel = $TypeLabel
    Required = $Required
    DefaultValue = $DefaultValue
    Choices = $Choices
  }
}

function Convert-TypeLabelToFieldSpec {
  param([string]$TypeLabel)

  $normalized = $TypeLabel.Trim().ToLowerInvariant()
  switch -Regex ($normalized) {
    '^single line text$' { return @{ Type = 'Text'; RichText = $null } }
    '^single line text / json$' { return @{ Type = 'Text'; RichText = $null } }
    '^multiple lines plain text$' { return @{ Type = 'Note'; RichText = $false } }
    '^multiple lines rich text$' { return @{ Type = 'Note'; RichText = $true } }
    '^choice$' { return @{ Type = 'Choice'; RichText = $null } }
    '^choice or taxonomy$' { return @{ Type = 'Choice'; RichText = $null } }
    '^choice multi$' { return @{ Type = 'MultiChoice'; RichText = $null } }
    '^choice multi or taxonomy$' { return @{ Type = 'MultiChoice'; RichText = $null } }
    '^yes/no$' { return @{ Type = 'Boolean'; RichText = $null } }
    '^datetime$' { return @{ Type = 'DateTime'; RichText = $null } }
    '^number$' { return @{ Type = 'Number'; RichText = $null } }
    '^hyperlink$' { return @{ Type = 'URL'; RichText = $null } }
    '^hyperlink/image reference$' { return @{ Type = 'URL'; RichText = $null } }
    '^person or text reference$' { return @{ Type = 'User'; RichText = $null } }
    default {
      throw "Unsupported type label '$TypeLabel'."
    }
  }
}

function Get-ChoiceDefaults {
  return @{
    Destination = @('companyPulse', 'projectSpotlight')
    ContentType = @('newsUpdate', 'monthlySpotlight', 'milestoneSpotlight', 'projectUpdate', 'announcement')
    ArticleSubject = @('general', 'people', 'project', 'operations', 'safety')
    WorkflowState = @('draft', 'review', 'approved', 'scheduled', 'published', 'archived', 'withdrawn')
    BusinessUnit = @('estimating', 'operations', 'preconstruction', 'executive')
    MarketSector = @('commercial', 'healthcare', 'education', 'public')
    Region = @('north', 'central', 'south', 'west')
    ProjectStage = @('precon', 'active', 'closeout', 'completed')
    SpotlightType = @('monthly', 'milestone', 'other')
    HeroThemeVariant = @('default', 'light', 'dark')
    HeroMetadataMode = @('standard', 'compact', 'hidden')
    TeamViewerMode = @('compact', 'grouped', 'orgChart', 'summaryExpand')
    TeamViewerSortMode = @('manual', 'role', 'hierarchy')
    TeamViewerGroupingMode = @('none', 'discipline', 'company', 'hierarchy')
    BodyStyleVariant = @('default', 'feature', 'longform')
    ProjectStatusVariant = @('success', 'warning', 'info', 'critical')
    PageSyncStatus = @('in-sync', 'pending', 'error')
    PublishStatus = @('draft', 'published', 'error', 'scheduled')
    SyncStatus = @('in-sync', 'pending', 'error')
    MediaRole = @('gallery', 'supporting', 'hero', 'secondary')
    PreviousState = @('draft', 'review', 'approved', 'scheduled', 'published', 'archived', 'withdrawn')
    NewState = @('draft', 'review', 'approved', 'scheduled', 'published', 'archived', 'withdrawn')
    Operation = @('create', 'update', 'publish', 'sync')
    RetryStatus = @('none', 'pending', 'resolved')
    Scope = @('destination', 'homepage', 'global')
  }
}

function Ensure-List {
  param([string]$Title)

  $existing = Get-PnPList -Identity $Title -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "List exists: $Title" -ForegroundColor Yellow
    return $existing
  }

  $created = New-PnPList -Title $Title -Template GenericList -OnQuickLaunch:$false
  Write-Host "Created list: $Title" -ForegroundColor Green
  return $created
}

function Ensure-Field {
  param(
    [string]$ListTitle,
    [pscustomobject]$FieldDef,
    [hashtable]$ChoiceDefaults
  )

  $spec = Convert-TypeLabelToFieldSpec -TypeLabel $FieldDef.TypeLabel
  $type = $spec.Type
  $richText = $spec.RichText

  $field = Get-PnPField -List $ListTitle -Identity $FieldDef.InternalName -ErrorAction SilentlyContinue

  if (-not $field) {
    $createParams = @{
      List = $ListTitle
      InternalName = $FieldDef.InternalName
      DisplayName = $FieldDef.Name
      Type = $type
      AddToDefaultView = $false
    }

    if ($type -eq 'Choice' -or $type -eq 'MultiChoice') {
      $resolvedChoices = $FieldDef.Choices
      if (-not $resolvedChoices -or $resolvedChoices.Count -eq 0) {
        if ($ChoiceDefaults.ContainsKey($FieldDef.Name)) {
          $resolvedChoices = $ChoiceDefaults[$FieldDef.Name]
        }
        else {
          $resolvedChoices = @('TBD')
        }
      }
      $createParams.Choices = $resolvedChoices
    }

    Add-PnPField @createParams | Out-Null
    Write-Host "  + Added field: $($FieldDef.Name) [$($FieldDef.InternalName)] ($type)" -ForegroundColor Green

    $field = Get-PnPField -List $ListTitle -Identity $FieldDef.InternalName
  }
  else {
    $actualType = [string]$field.TypeAsString
    if ($actualType -ne $type) {
      throw "Type mismatch on '$ListTitle.$($FieldDef.Name)' (internal '$($FieldDef.InternalName)'). Expected '$type', found '$actualType'."
    }
    Write-Host "  = Field exists: $($FieldDef.Name) [$($FieldDef.InternalName)]" -ForegroundColor DarkYellow
  }

  $values = @{}
  $values.Required = [bool]$FieldDef.Required

  if ($null -ne $FieldDef.DefaultValue) {
    $values.DefaultValue = [string]$FieldDef.DefaultValue
  }

  if ($type -eq 'Note' -and $null -ne $richText) {
    $values.RichText = [bool]$richText
  }

  if ($values.Count -gt 0) {
    Set-PnPField -List $ListTitle -Identity $FieldDef.InternalName -Values $values | Out-Null
  }
}

function Validate-Field {
  param(
    [string]$ListTitle,
    [pscustomobject]$FieldDef
  )

  $spec = Convert-TypeLabelToFieldSpec -TypeLabel $FieldDef.TypeLabel
  $expectedType = $spec.Type

  $field = Get-PnPField -List $ListTitle -Identity $FieldDef.InternalName -ErrorAction SilentlyContinue
  if (-not $field) {
    return [PSCustomObject]@{
      List = $ListTitle
      Field = $FieldDef.Name
      InternalName = $FieldDef.InternalName
      Exists = $false
      ExpectedType = $expectedType
      ActualType = 'Missing'
      TypeMatch = $false
      RequiredExpected = $FieldDef.Required
      RequiredActual = $null
      RequiredMatch = $false
      DefaultExpected = if ($null -ne $FieldDef.DefaultValue) { [string]$FieldDef.DefaultValue } else { $null }
      DefaultActual = $null
      DefaultMatch = ($null -eq $FieldDef.DefaultValue)
    }
  }

  $actualType = [string]$field.TypeAsString
  $requiredActual = [bool]$field.Required

  $defaultExpected = $null
  $defaultActual = $null
  $defaultMatch = $true
  if ($null -ne $FieldDef.DefaultValue) {
    $defaultExpected = [string]$FieldDef.DefaultValue
    $defaultActual = [string]$field.DefaultValue
    $defaultMatch = ($defaultActual -eq $defaultExpected)
  }

  return [PSCustomObject]@{
    List = $ListTitle
    Field = $FieldDef.Name
    InternalName = $FieldDef.InternalName
    Exists = $true
    ExpectedType = $expectedType
    ActualType = $actualType
    TypeMatch = ($actualType -eq $expectedType)
    RequiredExpected = [bool]$FieldDef.Required
    RequiredActual = $requiredActual
    RequiredMatch = ($requiredActual -eq [bool]$FieldDef.Required)
    DefaultExpected = $defaultExpected
    DefaultActual = $defaultActual
    DefaultMatch = $defaultMatch
  }
}

function Get-Schemas {
  $choiceDefaults = Get-ChoiceDefaults

  $schemas = @{}

  $schemas['HB Articles'] = @(
    (New-FieldDef 'ArticleId' 'Single line text' $true),
    (New-FieldDef 'Title' 'Single line text' $true),
    (New-FieldDef 'HeroTitle' 'Single line text' $false),
    (New-FieldDef 'Subhead' 'Multiple lines plain text' $true),
    (New-FieldDef 'HeroSubhead' 'Multiple lines plain text' $false),
    (New-FieldDef 'SummaryExcerpt' 'Multiple lines plain text' $true),
    (New-FieldDef 'Destination' 'Choice' $true $null $choiceDefaults.Destination),
    # SharePoint reserves internal name ContentType; use stable alias for the article content-type selector.
    (New-FieldDef 'ContentType' 'Choice' $true $null $choiceDefaults.ContentType 'ArticleContentType'),
    (New-FieldDef 'ArticleSubject' 'Choice or taxonomy' $false $null $choiceDefaults.ArticleSubject),
    (New-FieldDef 'TemplateKey' 'Single line text' $true),
    (New-FieldDef 'TemplateOverrideAllowed' 'Yes/No' $false),
    (New-FieldDef 'Slug' 'Single line text' $true),
    (New-FieldDef 'WorkflowState' 'Choice' $true $null $choiceDefaults.WorkflowState),
    (New-FieldDef 'AuthorEmail' 'Single line text' $false),
    (New-FieldDef 'AuthorDisplayName' 'Single line text' $false),
    (New-FieldDef 'CreatedDateUtc' 'DateTime' $true),
    (New-FieldDef 'UpdatedDateUtc' 'DateTime' $true),
    (New-FieldDef 'PublishedDateUtc' 'DateTime' $false),
    (New-FieldDef 'ScheduledPublishDateUtc' 'DateTime' $false),
    (New-FieldDef 'ArchiveDateUtc' 'DateTime' $false),
    (New-FieldDef 'BusinessUnit' 'Choice or taxonomy' $false $null $choiceDefaults.BusinessUnit),
    (New-FieldDef 'MarketSector' 'Choice or taxonomy' $false $null $choiceDefaults.MarketSector),
    (New-FieldDef 'Region' 'Choice or taxonomy' $false $null $choiceDefaults.Region),
    (New-FieldDef 'AudienceTags' 'Choice multi or taxonomy' $false),
    (New-FieldDef 'ProjectId' 'Single line text' $false),
    (New-FieldDef 'ProjectName' 'Single line text' $false),
    (New-FieldDef 'ProjectStage' 'Choice' $false $null $choiceDefaults.ProjectStage),
    (New-FieldDef 'SpotlightType' 'Choice' $false $null $choiceDefaults.SpotlightType),
    (New-FieldDef 'MilestoneDateUtc' 'DateTime' $false),
    (New-FieldDef 'MilestoneLabel' 'Single line text' $false),
    (New-FieldDef 'ProjectLocation' 'Single line text' $false),
    (New-FieldDef 'ProjectSector' 'Single line text' $false),
    (New-FieldDef 'ProjectStatusLabel' 'Single line text' $false),
    (New-FieldDef 'ProjectStatusVariant' 'Choice' $false $null $choiceDefaults.ProjectStatusVariant),
    (New-FieldDef 'HeroPrimaryImage' 'Hyperlink/Image reference' $true),
    (New-FieldDef 'HeroPrimaryImageAltText' 'Multiple lines plain text' $true),
    (New-FieldDef 'HeroEyebrow' 'Single line text' $false),
    (New-FieldDef 'HeroCategoryLabel' 'Single line text' $false),
    (New-FieldDef 'HeroThemeVariant' 'Choice' $false $null $choiceDefaults.HeroThemeVariant),
    (New-FieldDef 'HeroImageFocalPoint' 'Single line text / JSON' $false),
    (New-FieldDef 'HeroShowMetadata' 'Yes/No' $false),
    (New-FieldDef 'HeroMetadataMode' 'Choice' $false $null $choiceDefaults.HeroMetadataMode),
    (New-FieldDef 'HeroCtaLabel' 'Single line text' $false),
    (New-FieldDef 'HeroCtaUrl' 'Hyperlink' $false),
    (New-FieldDef 'ShowTeamViewer' 'Yes/No' $false),
    (New-FieldDef 'TeamViewerMode' 'Choice' $false $null $choiceDefaults.TeamViewerMode),
    (New-FieldDef 'TeamViewerTitle' 'Single line text' $false),
    (New-FieldDef 'TeamViewerIntro' 'Multiple lines plain text' $false),
    (New-FieldDef 'TeamViewerMaxInitialVisible' 'Number' $false),
    (New-FieldDef 'TeamViewerAllowExpand' 'Yes/No' $false),
    (New-FieldDef 'TeamViewerSortMode' 'Choice' $false $null $choiceDefaults.TeamViewerSortMode),
    (New-FieldDef 'TeamViewerGroupingMode' 'Choice' $false $null $choiceDefaults.TeamViewerGroupingMode),
    (New-FieldDef 'SecondaryImage' 'Hyperlink/Image reference' $false),
    (New-FieldDef 'SecondaryImageAltText' 'Multiple lines plain text' $false),
    (New-FieldDef 'SecondaryImageCaption' 'Multiple lines plain text' $false),
    (New-FieldDef 'ShowSecondaryImage' 'Yes/No' $false),
    (New-FieldDef 'BodyIntro' 'Multiple lines rich text' $false),
    (New-FieldDef 'BodyRichText' 'Multiple lines rich text' $true),
    (New-FieldDef 'BodyClosing' 'Multiple lines rich text' $false),
    (New-FieldDef 'PullQuote' 'Multiple lines plain text' $false),
    (New-FieldDef 'CalloutText' 'Multiple lines plain text' $false),
    (New-FieldDef 'BodyStyleVariant' 'Choice' $false $null $choiceDefaults.BodyStyleVariant),
    (New-FieldDef 'IsFeatured' 'Yes/No' $false),
    (New-FieldDef 'FeaturedScope' 'Choice multi' $false),
    (New-FieldDef 'FeaturedRank' 'Number' $false),
    (New-FieldDef 'IsPinned' 'Yes/No' $false),
    (New-FieldDef 'PinRank' 'Number' $false),
    (New-FieldDef 'IncludeInHomepageFeed' 'Yes/No' $false),
    (New-FieldDef 'IncludeInDestinationLanding' 'Yes/No' $false),
    (New-FieldDef 'IncludeInArchive' 'Yes/No' $false),
    (New-FieldDef 'SuppressFromRollups' 'Yes/No' $false),
    (New-FieldDef 'ManualSortOverride' 'Number' $false),
    (New-FieldDef 'CampaignWindowStartUtc' 'DateTime' $false),
    (New-FieldDef 'CampaignWindowEndUtc' 'DateTime' $false),
    (New-FieldDef 'ReviewOwnerEmail' 'Single line text' $false),
    (New-FieldDef 'ApprovalOwnerEmail' 'Single line text' $false),
    (New-FieldDef 'PublishedByEmail' 'Single line text' $false),
    (New-FieldDef 'LastReviewedDateUtc' 'DateTime' $false),
    (New-FieldDef 'RevisionNote' 'Multiple lines plain text' $false),
    (New-FieldDef 'ChangeReason' 'Multiple lines plain text' $false),
    (New-FieldDef 'RequiresReapprovalOnEdit' 'Yes/No' $false),
    (New-FieldDef 'TargetSiteUrl' 'Single line text' $false),
    (New-FieldDef 'PageId' 'Single line text' $false),
    (New-FieldDef 'PageUrl' 'Hyperlink' $false),
    (New-FieldDef 'PageName' 'Single line text' $false),
    (New-FieldDef 'PageTemplateKey' 'Single line text' $false),
    (New-FieldDef 'PageShellVersion' 'Single line text' $false),
    (New-FieldDef 'RenderVersion' 'Single line text' $false),
    (New-FieldDef 'LastPageSyncDateUtc' 'DateTime' $false),
    (New-FieldDef 'PageSyncStatus' 'Choice' $false $null $choiceDefaults.PageSyncStatus)
  )

  $schemas['HB Article Team Members'] = @(
    (New-FieldDef 'ArticleId' 'Single line text' $true),
    (New-FieldDef 'TeamMemberId' 'Single line text' $true),
    (New-FieldDef 'PersonPrincipal' 'Person or text reference' $true),
    (New-FieldDef 'DisplayName' 'Single line text' $true),
    (New-FieldDef 'Role' 'Single line text' $false),
    (New-FieldDef 'Department' 'Single line text' $false),
    (New-FieldDef 'Company' 'Single line text' $false),
    (New-FieldDef 'SortOrder' 'Number' $false),
    (New-FieldDef 'GroupKey' 'Single line text' $false),
    (New-FieldDef 'ParentMemberId' 'Single line text' $false),
    (New-FieldDef 'IsFeaturedMember' 'Yes/No' $false),
    (New-FieldDef 'BioSnippet' 'Multiple lines plain text' $false),
    # TeamViewer profile-drawer schema (Phase-01 closure, 2026-04-13):
    # these columns back the disabled-by-default bio/resume slide-out on
    # HBCentral-hosted publisher lists. They are optional on the list
    # so the drawer renders only the sections that have data.
    (New-FieldDef 'ResumeRichText' 'Multiple lines rich text' $false),
    (New-FieldDef 'ResumeDocumentUrl' 'Hyperlink' $false),
    (New-FieldDef 'ResumeDocumentLabel' 'Single line text' $false),
    (New-FieldDef 'ContactLink' 'Hyperlink' $false)
  )

  $schemas['HB Article Media'] = @(
    (New-FieldDef 'ArticleId' 'Single line text' $true),
    (New-FieldDef 'MediaId' 'Single line text' $true),
    (New-FieldDef 'MediaRole' 'Choice' $true $null $choiceDefaults.MediaRole),
    (New-FieldDef 'ImageAsset' 'Hyperlink/Image reference' $true),
    (New-FieldDef 'AltText' 'Multiple lines plain text' $true),
    (New-FieldDef 'Caption' 'Multiple lines plain text' $false),
    (New-FieldDef 'SortOrder' 'Number' $false),
    (New-FieldDef 'GalleryGroup' 'Single line text' $false),
    (New-FieldDef 'FeaturedInGallery' 'Yes/No' $false)
  )

  $schemas['HB Article Template Registry'] = @(
    (New-FieldDef 'TemplateKey' 'Single line text' $true),
    (New-FieldDef 'TemplateName' 'Single line text' $true),
    (New-FieldDef 'Destination' 'Choice' $true $null $choiceDefaults.Destination),
    (New-FieldDef 'ContentTypes' 'Choice multi' $true),
    (New-FieldDef 'ArticleSubjects' 'Choice multi' $false),
    (New-FieldDef 'ProjectStages' 'Choice multi' $false),
    (New-FieldDef 'SpotlightTypes' 'Choice multi' $false),
    (New-FieldDef 'HeroProfileKey' 'Single line text' $true),
    (New-FieldDef 'TeamViewerProfileKey' 'Single line text' $false),
    (New-FieldDef 'BodyProfileKey' 'Single line text' $true),
    (New-FieldDef 'GalleryProfileKey' 'Single line text' $false),
    (New-FieldDef 'PageShellTemplateKey' 'Single line text' $true),
    (New-FieldDef 'ShowHero' 'Yes/No' $true '1'),
    (New-FieldDef 'ShowTeamViewer' 'Yes/No' $true '1'),
    (New-FieldDef 'ShowSecondaryImage' 'Yes/No' $true '1'),
    (New-FieldDef 'ShowGallery' 'Yes/No' $true '1'),
    (New-FieldDef 'ShowBody' 'Yes/No' $true '1'),
    (New-FieldDef 'RequiredFieldSetKey' 'Single line text' $true),
    (New-FieldDef 'TemplatePriority' 'Number' $true),
    (New-FieldDef 'IsActive' 'Yes/No' $true '1'),
    (New-FieldDef 'VersionLabel' 'Single line text' $false),
    (New-FieldDef 'Notes' 'Multiple lines plain text' $false)
  )

  $schemas['HB Article Destination Pages'] = @(
    (New-FieldDef 'BindingId' 'Single line text' $true),
    (New-FieldDef 'ArticleId' 'Single line text' $true),
    (New-FieldDef 'TargetSiteUrl' 'Single line text' $true),
    (New-FieldDef 'PageId' 'Single line text' $false),
    (New-FieldDef 'PageUrl' 'Hyperlink' $false),
    (New-FieldDef 'PageName' 'Single line text' $false),
    (New-FieldDef 'PageTemplateKey' 'Single line text' $true),
    (New-FieldDef 'PageShellVersion' 'Single line text' $false),
    (New-FieldDef 'RenderVersion' 'Single line text' $false),
    (New-FieldDef 'PublishStatus' 'Choice' $true $null $choiceDefaults.PublishStatus),
    (New-FieldDef 'LastSyncDateUtc' 'DateTime' $false),
    (New-FieldDef 'SyncStatus' 'Choice' $false $null $choiceDefaults.SyncStatus),
    (New-FieldDef 'LastSyncMessage' 'Multiple lines plain text' $false),
    (New-FieldDef 'PublishedDateUtc' 'DateTime' $false)
  )

  $schemas['HB Article Workflow History'] = @(
    (New-FieldDef 'HistoryId' 'Single line text' $true),
    (New-FieldDef 'ArticleId' 'Single line text' $true),
    (New-FieldDef 'PreviousState' 'Choice' $false $null $choiceDefaults.PreviousState),
    (New-FieldDef 'NewState' 'Choice' $true $null $choiceDefaults.NewState),
    (New-FieldDef 'ActorEmail' 'Single line text' $false),
    (New-FieldDef 'ActionDateUtc' 'DateTime' $true),
    (New-FieldDef 'ActionNote' 'Multiple lines plain text' $false)
  )

  $schemas['HB Article Publishing Errors'] = @(
    (New-FieldDef 'ErrorId' 'Single line text' $true),
    (New-FieldDef 'ArticleId' 'Single line text' $true),
    (New-FieldDef 'BindingId' 'Single line text' $false),
    (New-FieldDef 'Operation' 'Choice' $true $null $choiceDefaults.Operation),
    (New-FieldDef 'Destination' 'Choice' $true $null $choiceDefaults.Destination),
    (New-FieldDef 'ErrorSummary' 'Multiple lines plain text' $true),
    (New-FieldDef 'RetryStatus' 'Choice' $false $null $choiceDefaults.RetryStatus),
    (New-FieldDef 'LastAttemptDateUtc' 'DateTime' $false)
  )

  $schemas['HB Article Promotion Rules'] = @(
    (New-FieldDef 'RuleId' 'Single line text' $true),
    (New-FieldDef 'Destination' 'Choice' $true $null $choiceDefaults.Destination),
    # SharePoint reserves internal name ContentType; use stable alias for promotion-rule scoping.
    (New-FieldDef 'ContentType' 'Choice' $false $null $choiceDefaults.ContentType 'RuleContentType'),
    (New-FieldDef 'Scope' 'Choice' $true $null $choiceDefaults.Scope),
    (New-FieldDef 'FeaturedDefault' 'Yes/No' $false '0'),
    (New-FieldDef 'PinnedDefault' 'Yes/No' $false '0'),
    (New-FieldDef 'FeedWindowDays' 'Number' $false),
    (New-FieldDef 'ManualOverrideAllowed' 'Yes/No' $false '1'),
    (New-FieldDef 'IsActive' 'Yes/No' $true '1'),
    (New-FieldDef 'Notes' 'Multiple lines plain text' $false)
  )

  return $schemas
}

$schemas = Get-Schemas
$validation = New-Object System.Collections.Generic.List[object]

try {
  Connect-PublisherPnP

  foreach ($listTitle in $schemas.Keys) {
    Write-Host "`n=== Processing list: $listTitle ===" -ForegroundColor Cyan
    $list = Ensure-List -Title $listTitle

    foreach ($fieldDef in $schemas[$listTitle]) {
      Ensure-Field -ListTitle $listTitle -FieldDef $fieldDef -ChoiceDefaults (Get-ChoiceDefaults)
    }

    foreach ($fieldDef in $schemas[$listTitle]) {
      $validation.Add((Validate-Field -ListTitle $listTitle -FieldDef $fieldDef))
    }

    $listObj = Get-PnPList -Identity $listTitle
    $listUrl = "https://hedrickbrotherscom.sharepoint.com$($listObj.RootFolder.ServerRelativeUrl)/AllItems.aspx"
    Write-Host "List URL: $listUrl" -ForegroundColor Gray
  }

  Write-Host "`n=== Validation Summary ===" -ForegroundColor Cyan
  $validation | Format-Table List, Field, InternalName, Exists, ExpectedType, ActualType, TypeMatch, RequiredExpected, RequiredActual, RequiredMatch, DefaultExpected, DefaultActual, DefaultMatch -AutoSize

  $missing = $validation | Where-Object { -not $_.Exists }
  $typeMismatch = $validation | Where-Object { -not $_.TypeMatch }
  $requiredMismatch = $validation | Where-Object { -not $_.RequiredMatch }
  $defaultMismatch = $validation | Where-Object { -not $_.DefaultMatch }

  if ($missing.Count -gt 0 -or $typeMismatch.Count -gt 0 -or $requiredMismatch.Count -gt 0 -or $defaultMismatch.Count -gt 0) {
    throw "Schema validation failed. Missing=$($missing.Count), TypeMismatch=$($typeMismatch.Count), RequiredMismatch=$($requiredMismatch.Count), DefaultMismatch=$($defaultMismatch.Count)."
  }

  Write-Host "`nProvisioning and validation completed successfully for all publisher lists." -ForegroundColor Green
}
finally {
  $conn = Get-PnPConnection -ErrorAction SilentlyContinue
  if ($null -ne $conn) {
    Disconnect-PnPOnline -ErrorAction SilentlyContinue
  }
}
