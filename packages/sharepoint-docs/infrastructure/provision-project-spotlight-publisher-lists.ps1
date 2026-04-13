<#
.SYNOPSIS
  Idempotently provisions the architecture-aligned Project Spotlight publisher
  SharePoint list schema on HBCentral.

.DESCRIPTION
  Architecture authority:
    docs/architecture/plans/MASTER/spfx/publisher/architecture/README.md
    docs/architecture/plans/MASTER/spfx/publisher/architecture/02-List-By-List-Architecture.md
    docs/architecture/plans/MASTER/spfx/publisher/architecture/03-Exact-Field-Definitions.md
    docs/architecture/plans/MASTER/spfx/publisher/architecture/04-Child-Record-Relationships.md
    docs/architecture/plans/MASTER/spfx/publisher/architecture/05-Template-Registry-Schema.md
    docs/architecture/plans/MASTER/spfx/publisher/architecture/06-Article-Page-Binding-Schema.md

  Scope:
    - Provisions the seven architecture-mandated lists on HBCentral.
    - Only MVP=Yes fields from architecture doc 03 are created at first pass.
    - Idempotent: creates missing lists and adds missing fields; never deletes
      rows, system fields, or columns. Existing field type mismatches raise.
    - Validates the schema in the same run and fails the run on any mismatch.

  Relationship to legacy provisioner:
    The sibling script `provision-publisher-lists.ps1` provisions the
    legacy "HB Articles / ArticleId" schema that Phase-01 Team Viewer
    currently reads. This new script is additive and does not modify
    those legacy lists. Migration of the Team Viewer binding to the
    architecture-aligned lists is a separately scheduled prompt.

  Default list host (architecture doc 02 §Notes + HBCentral lock committed
  2026-04-13 for Team Viewer):
    https://hedrickbrotherscom.sharepoint.com/sites/HBCentral

  Note on reserved internal names:
    SharePoint reserves `ContentType`. Architecture doc 03 does not use
    that internal name for publisher columns, so no alias is required here.

.USAGE
  Device login (delegated):
    pwsh ./packages/sharepoint-docs/infrastructure/provision-project-spotlight-publisher-lists.ps1 \
      -ClientId "<entra-app-id>" \
      -Tenant  "0e834bd7-628b-42c8-b9ec-ecebc9719be4" \
      -DeviceLogin

  App secret login:
    pwsh ./packages/sharepoint-docs/infrastructure/provision-project-spotlight-publisher-lists.ps1 \
      -ClientId "<entra-app-id>" \
      -Tenant  "0e834bd7-628b-42c8-b9ec-ecebc9719be4" \
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
    Name         = $Name
    InternalName = $resolvedInternalName
    TypeLabel    = $TypeLabel
    Required     = $Required
    DefaultValue = $DefaultValue
    Choices      = $Choices
  }
}

function Convert-TypeLabelToFieldSpec {
  param([string]$TypeLabel)

  $normalized = $TypeLabel.Trim().ToLowerInvariant()
  switch -Regex ($normalized) {
    '^single line text$'                    { return @{ Type = 'Text';        RichText = $null } }
    '^single line text / json$'             { return @{ Type = 'Text';        RichText = $null } }
    '^multiple lines plain text$'           { return @{ Type = 'Note';        RichText = $false } }
    '^multiple lines plain text / json$'    { return @{ Type = 'Note';        RichText = $false } }
    '^multiple lines rich text$'            { return @{ Type = 'Note';        RichText = $true } }
    '^choice$'                              { return @{ Type = 'Choice';      RichText = $null } }
    '^choice or taxonomy$'                  { return @{ Type = 'Choice';      RichText = $null } }
    '^choice multi$'                        { return @{ Type = 'MultiChoice'; RichText = $null } }
    '^choice multi or taxonomy$'            { return @{ Type = 'MultiChoice'; RichText = $null } }
    '^yes/no$'                              { return @{ Type = 'Boolean';     RichText = $null } }
    '^datetime$'                            { return @{ Type = 'DateTime';    RichText = $null } }
    '^number$'                              { return @{ Type = 'Number';      RichText = $null } }
    '^hyperlink$'                           { return @{ Type = 'URL';         RichText = $null } }
    '^hyperlink/image reference$'           { return @{ Type = 'URL';         RichText = $null } }
    '^person or text reference$'            { return @{ Type = 'User';        RichText = $null } }
    default {
      throw "Unsupported type label '$TypeLabel'."
    }
  }
}

# Canonical choice-value sets from architecture doc 03.
# Keep this table in lockstep with apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts
function Get-ChoiceDefaults {
  return @{
    PostFamily              = @('monthlySpotlight', 'milestoneSpotlight', 'projectUpdate', 'projectStory')
    SpotlightType           = @('inProgress', 'milestone', 'update', 'feature')
    ProjectStage            = @('preconstruction', 'inProgress', 'closeout', 'completed')
    ArticleSubject          = @('general', 'people', 'project', 'operations', 'safety')
    WorkflowState           = @('draft', 'inReview', 'approved', 'scheduled', 'published', 'archived', 'withdrawn')
    BannerThemeVariant      = @('default', 'light', 'dark')
    HeroRendererKind        = @('oobPageTitle', 'hbSignatureHero')
    BannerRendererKind      = @('oobPageTitle', 'hbSignatureHero')
    BodyRendererKind        = @('oobText')
    TeamRendererKind        = @('teamViewer', 'none')
    GalleryRendererKind     = @('oobImageGallery', 'none')
    TeamViewerLayout        = @('grid', 'list')
    TeamViewerDensity       = @('standard', 'compact', 'comfortable')
    GalleryLayoutProfile    = @('grid', 'carousel', 'shellDefault')
    PageSyncStatus          = @('pending', 'inSync', 'error', 'staleShell', 'staleTemplate')
    TemplateStatus          = @('active', 'inactive', 'deprecated', 'draft')
    MediaRole               = @('gallery', 'supporting', 'hero', 'secondary')
    BindingStatus           = @('previewOnly', 'published', 'archived', 'withdrawn', 'error')
    LastOperation           = @('preview', 'publish', 'republish', 'regenerate', 'archive', 'withdraw')
    WorkflowHistoryAction   = @('transition', 'publish', 'republish', 'regenerate', 'archive', 'withdraw', 'approvalDecision')
    PublishingErrorCategory = @('templateResolution', 'validation', 'pageGeneration', 'pageSync', 'binding', 'unknown')
    PublishingErrorOperation= @('preview', 'publish', 'republish', 'regenerate', 'archive', 'withdraw')
    RetryStatus             = @('none', 'pending', 'resolved')
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
      List             = $ListTitle
      InternalName     = $FieldDef.InternalName
      DisplayName      = $FieldDef.Name
      Type             = $type
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
      List             = $ListTitle
      Field            = $FieldDef.Name
      InternalName     = $FieldDef.InternalName
      Exists           = $false
      ExpectedType     = $expectedType
      ActualType       = 'Missing'
      TypeMatch        = $false
      RequiredExpected = $FieldDef.Required
      RequiredActual   = $null
      RequiredMatch    = $false
      DefaultExpected  = if ($null -ne $FieldDef.DefaultValue) { [string]$FieldDef.DefaultValue } else { $null }
      DefaultActual    = $null
      DefaultMatch     = ($null -eq $FieldDef.DefaultValue)
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
    List             = $ListTitle
    Field            = $FieldDef.Name
    InternalName     = $FieldDef.InternalName
    Exists           = $true
    ExpectedType     = $expectedType
    ActualType       = $actualType
    TypeMatch        = ($actualType -eq $expectedType)
    RequiredExpected = [bool]$FieldDef.Required
    RequiredActual   = $requiredActual
    RequiredMatch    = ($requiredActual -eq [bool]$FieldDef.Required)
    DefaultExpected  = $defaultExpected
    DefaultActual    = $defaultActual
    DefaultMatch     = $defaultMatch
  }
}

function Get-Schemas {
  $choiceDefaults = Get-ChoiceDefaults

  $schemas = [ordered]@{}

  # ----------------------------------------------------------------------
  # 1) Project Spotlight Posts (arch 03 §A, MVP=Yes only)
  # ----------------------------------------------------------------------
  $schemas['Project Spotlight Posts'] = @(
    (New-FieldDef 'PostId'                        'Single line text'           $true),
    (New-FieldDef 'Title'                         'Single line text'           $true),
    (New-FieldDef 'BannerTitleOverride'           'Single line text'           $false),
    (New-FieldDef 'Subhead'                       'Multiple lines plain text'  $true),
    (New-FieldDef 'SummaryExcerpt'                'Multiple lines plain text'  $true),
    (New-FieldDef 'BodyRichText'                  'Multiple lines rich text'   $true),
    (New-FieldDef 'PostFamily'                    'Choice'                     $true  $null $choiceDefaults.PostFamily),
    (New-FieldDef 'SpotlightType'                 'Choice'                     $false $null $choiceDefaults.SpotlightType),
    (New-FieldDef 'ProjectStage'                  'Choice'                     $false $null $choiceDefaults.ProjectStage),
    (New-FieldDef 'ArticleSubject'                'Choice or taxonomy'         $false $null $choiceDefaults.ArticleSubject),
    (New-FieldDef 'TemplateKey'                   'Single line text'           $true),
    (New-FieldDef 'PageShellKey'                  'Single line text'           $true),
    (New-FieldDef 'Slug'                          'Single line text'           $true),
    (New-FieldDef 'WorkflowState'                 'Choice'                     $true  'draft' $choiceDefaults.WorkflowState),
    (New-FieldDef 'AuthorEmail'                   'Single line text'           $false),
    (New-FieldDef 'AuthorDisplayName'             'Single line text'           $false),
    (New-FieldDef 'CreatedDateUtc'                'DateTime'                   $true),
    (New-FieldDef 'UpdatedDateUtc'                'DateTime'                   $true),
    (New-FieldDef 'PublishedDateUtc'              'DateTime'                   $false),
    (New-FieldDef 'ScheduledPublishDateUtc'       'DateTime'                   $false),
    (New-FieldDef 'ArchiveDateUtc'                'DateTime'                   $false),
    (New-FieldDef 'ProjectId'                     'Single line text'           $true),
    (New-FieldDef 'ProjectName'                   'Single line text'           $true),
    (New-FieldDef 'ProjectLocation'               'Single line text'           $false),
    (New-FieldDef 'ProjectSector'                 'Single line text'           $false),
    (New-FieldDef 'BannerImageUrl'                'Hyperlink/Image reference'  $true),
    (New-FieldDef 'BannerImageAltText'            'Multiple lines plain text'  $true),
    (New-FieldDef 'BannerEyebrow'                 'Single line text'           $false),
    (New-FieldDef 'BannerCategoryLabel'           'Single line text'           $false),
    (New-FieldDef 'BannerThemeVariant'            'Choice'                     $false $null $choiceDefaults.BannerThemeVariant),
    (New-FieldDef 'BannerShowPublishDate'         'Yes/No'                     $false),
    (New-FieldDef 'BannerShowGradient'            'Yes/No'                     $false),
    (New-FieldDef 'HeroRendererKind'              'Choice'                     $false 'oobPageTitle' $choiceDefaults.HeroRendererKind),
    (New-FieldDef 'ShowTeamViewer'                'Yes/No'                     $false),
    (New-FieldDef 'TeamSectionHeading'            'Single line text'           $false),
    (New-FieldDef 'TeamViewerLayout'              'Choice'                     $false 'grid'     $choiceDefaults.TeamViewerLayout),
    (New-FieldDef 'TeamViewerDensity'             'Choice'                     $false 'standard' $choiceDefaults.TeamViewerDensity),
    (New-FieldDef 'TeamViewerEnableProfileDrawer' 'Yes/No'                     $false),
    (New-FieldDef 'ShowGallery'                   'Yes/No'                     $false),
    (New-FieldDef 'GalleryLayoutProfile'          'Choice'                     $false 'shellDefault' $choiceDefaults.GalleryLayoutProfile),
    (New-FieldDef 'IsFeatured'                    'Yes/No'                     $false),
    (New-FieldDef 'FeaturedRank'                  'Number'                     $false),
    (New-FieldDef 'IsPinned'                      'Yes/No'                     $false),
    (New-FieldDef 'PinRank'                       'Number'                     $false),
    (New-FieldDef 'IncludeInProjectSpotlightRollups' 'Yes/No'                  $false),
    (New-FieldDef 'IncludeInArchive'              'Yes/No'                     $false),
    (New-FieldDef 'TargetSiteUrl'                 'Single line text'           $true),
    (New-FieldDef 'TargetSiteKey'                 'Single line text'           $true  'projectSpotlight'),
    (New-FieldDef 'GeneratedPageName'             'Single line text'           $false),
    (New-FieldDef 'PageUrl'                       'Hyperlink'                  $false),
    (New-FieldDef 'PageId'                        'Single line text'           $false),
    (New-FieldDef 'SourceTemplatePath'            'Single line text'           $true),
    (New-FieldDef 'AppliedTemplateVersion'        'Single line text'           $false),
    (New-FieldDef 'AppliedShellVersion'           'Single line text'           $false),
    (New-FieldDef 'LastPageSyncDateUtc'           'DateTime'                   $false),
    (New-FieldDef 'PageSyncStatus'                'Choice'                     $false 'pending' $choiceDefaults.PageSyncStatus),
    (New-FieldDef 'LastSuccessfulPublishDateUtc'  'DateTime'                   $false)
  )

  # ----------------------------------------------------------------------
  # 2) Project Spotlight Post Team Members (arch 03 §B, MVP=Yes only)
  # ----------------------------------------------------------------------
  $schemas['Project Spotlight Post Team Members'] = @(
    (New-FieldDef 'PostId'            'Single line text'           $true),
    (New-FieldDef 'TeamMemberId'      'Single line text'           $true),
    (New-FieldDef 'PersonPrincipal'   'Person or text reference'   $true),
    (New-FieldDef 'DisplayName'       'Single line text'           $true),
    (New-FieldDef 'JobTitle'          'Single line text'           $false),
    (New-FieldDef 'PhotoUrl'          'Hyperlink/Image reference'  $false),
    (New-FieldDef 'SortOrder'         'Number'                     $false),
    (New-FieldDef 'BioSnippet'        'Multiple lines plain text'  $false),
    (New-FieldDef 'ResumeRichText'    'Multiple lines rich text'   $false),
    (New-FieldDef 'ResumeDocumentUrl' 'Hyperlink'                  $false),
    (New-FieldDef 'ContactLink'       'Hyperlink'                  $false),
    (New-FieldDef 'IncludeInViewer'   'Yes/No'                     $false '1')
  )

  # ----------------------------------------------------------------------
  # 3) Project Spotlight Post Media (arch 03 §C, MVP=Yes only)
  # ----------------------------------------------------------------------
  $schemas['Project Spotlight Post Media'] = @(
    (New-FieldDef 'PostId'         'Single line text'           $true),
    (New-FieldDef 'MediaId'        'Single line text'           $true),
    (New-FieldDef 'MediaRole'      'Choice'                     $true  'gallery' $choiceDefaults.MediaRole),
    (New-FieldDef 'ImageAssetUrl'  'Hyperlink/Image reference'  $true),
    (New-FieldDef 'AltText'        'Multiple lines plain text'  $true),
    (New-FieldDef 'Caption'        'Multiple lines plain text'  $false),
    (New-FieldDef 'SortOrder'      'Number'                     $false)
  )

  # ----------------------------------------------------------------------
  # 4) Project Spotlight Template Registry (arch 03 §D, MVP=Yes only)
  # ----------------------------------------------------------------------
  $schemas['Project Spotlight Template Registry'] = @(
    (New-FieldDef 'TemplateKey'                    'Single line text'           $true),
    (New-FieldDef 'TemplateDisplayName'            'Single line text'           $true),
    (New-FieldDef 'TemplateStatus'                 'Choice'                     $true  'active' $choiceDefaults.TemplateStatus),
    (New-FieldDef 'TemplateVersion'                'Single line text'           $true),
    (New-FieldDef 'PageShellKey'                   'Single line text'           $true),
    (New-FieldDef 'PageShellVersion'               'Single line text'           $true),
    (New-FieldDef 'ShellSourceSiteUrl'             'Single line text'           $true),
    (New-FieldDef 'ShellSourcePagePath'            'Single line text'           $true),
    (New-FieldDef 'PostFamily'                     'Choice multi'               $true  $null $choiceDefaults.PostFamily),
    (New-FieldDef 'SpotlightType'                  'Choice multi'               $false $null $choiceDefaults.SpotlightType),
    (New-FieldDef 'ProjectStage'                   'Choice multi'               $false $null $choiceDefaults.ProjectStage),
    (New-FieldDef 'ArticleSubject'                 'Choice multi or taxonomy'   $false $null $choiceDefaults.ArticleSubject),
    (New-FieldDef 'BannerRendererKind'             'Choice'                     $true  'oobPageTitle'    $choiceDefaults.BannerRendererKind),
    (New-FieldDef 'BodyRendererKind'               'Choice'                     $true  'oobText'         $choiceDefaults.BodyRendererKind),
    (New-FieldDef 'TeamRendererKind'               'Choice'                     $false 'teamViewer'      $choiceDefaults.TeamRendererKind),
    (New-FieldDef 'GalleryRendererKind'            'Choice'                     $false 'oobImageGallery' $choiceDefaults.GalleryRendererKind),
    (New-FieldDef 'ShowTeamBlock'                  'Yes/No'                     $true  '1'),
    (New-FieldDef 'ShowGalleryBlock'               'Yes/No'                     $true  '1'),
    (New-FieldDef 'RequiredFieldSetKey'            'Single line text'           $true),
    (New-FieldDef 'ValidationProfileKey'           'Single line text'           $true),
    (New-FieldDef 'RenderProfileKey'               'Single line text'           $true),
    (New-FieldDef 'AllowRepublishInPlace'          'Yes/No'                     $false '1'),
    (New-FieldDef 'ForceRegenerationOnShellChange' 'Yes/No'                     $false '0'),
    (New-FieldDef 'ControlMapJson'                 'Multiple lines plain text / JSON' $false)
  )

  # ----------------------------------------------------------------------
  # 5) Project Spotlight Page Bindings (arch 03 §E, MVP=Yes only)
  # ----------------------------------------------------------------------
  $schemas['Project Spotlight Page Bindings'] = @(
    (New-FieldDef 'BindingId'                  'Single line text'           $true),
    (New-FieldDef 'PostId'                     'Single line text'           $true),
    (New-FieldDef 'TargetSiteUrl'              'Single line text'           $true),
    (New-FieldDef 'TargetSiteKey'              'Single line text'           $true  'projectSpotlight'),
    (New-FieldDef 'PageId'                     'Single line text'           $false),
    (New-FieldDef 'PageName'                   'Single line text'           $true),
    (New-FieldDef 'PageUrl'                    'Hyperlink'                  $false),
    (New-FieldDef 'SourceTemplatePath'         'Single line text'           $true),
    (New-FieldDef 'PageShellKey'               'Single line text'           $true),
    (New-FieldDef 'PageShellVersion'           'Single line text'           $true),
    (New-FieldDef 'TemplateKey'                'Single line text'           $true),
    (New-FieldDef 'TemplateVersion'            'Single line text'           $true),
    (New-FieldDef 'BindingStatus'              'Choice'                     $true  'previewOnly' $choiceDefaults.BindingStatus),
    (New-FieldDef 'LastOperation'              'Choice'                     $false $null $choiceDefaults.LastOperation),
    (New-FieldDef 'LastOperationDateUtc'       'DateTime'                   $false),
    (New-FieldDef 'LastSuccessfulSyncDateUtc'  'DateTime'                   $false)
  )

  # ----------------------------------------------------------------------
  # 6) Project Spotlight Workflow History (arch 03 §F)
  # ----------------------------------------------------------------------
  $schemas['Project Spotlight Workflow History'] = @(
    (New-FieldDef 'HistoryId'      'Single line text'          $true),
    (New-FieldDef 'PostId'         'Single line text'          $true),
    (New-FieldDef 'FromState'      'Choice'                    $false $null $choiceDefaults.WorkflowState),
    (New-FieldDef 'ToState'        'Choice'                    $true  $null $choiceDefaults.WorkflowState),
    (New-FieldDef 'Action'         'Choice'                    $true  'transition' $choiceDefaults.WorkflowHistoryAction),
    (New-FieldDef 'ActorEmail'     'Single line text'          $false),
    (New-FieldDef 'ActionDateUtc'  'DateTime'                  $true),
    (New-FieldDef 'Note'           'Multiple lines plain text' $false)
  )

  # ----------------------------------------------------------------------
  # 7) Project Spotlight Publishing Errors (arch 03 §G)
  # ----------------------------------------------------------------------
  $schemas['Project Spotlight Publishing Errors'] = @(
    (New-FieldDef 'ErrorId'          'Single line text'          $true),
    (New-FieldDef 'PostId'           'Single line text'          $true),
    (New-FieldDef 'BindingId'        'Single line text'          $false),
    (New-FieldDef 'Operation'        'Choice'                    $true  $null $choiceDefaults.PublishingErrorOperation),
    (New-FieldDef 'TemplateKey'      'Single line text'          $false),
    (New-FieldDef 'PageShellKey'     'Single line text'          $false),
    (New-FieldDef 'OccurredDateUtc'  'DateTime'                  $true),
    (New-FieldDef 'ErrorCategory'    'Choice'                    $true  'unknown' $choiceDefaults.PublishingErrorCategory),
    (New-FieldDef 'ErrorSummary'     'Multiple lines plain text' $true),
    (New-FieldDef 'ErrorDetails'     'Multiple lines plain text' $false),
    (New-FieldDef 'RetryStatus'      'Choice'                    $false 'none' $choiceDefaults.RetryStatus)
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

  $missing          = $validation | Where-Object { -not $_.Exists }
  $typeMismatch     = $validation | Where-Object { -not $_.TypeMatch }
  $requiredMismatch = $validation | Where-Object { -not $_.RequiredMatch }
  $defaultMismatch  = $validation | Where-Object { -not $_.DefaultMatch }

  if ($missing.Count -gt 0 -or $typeMismatch.Count -gt 0 -or $requiredMismatch.Count -gt 0 -or $defaultMismatch.Count -gt 0) {
    throw "Schema validation failed. Missing=$($missing.Count), TypeMismatch=$($typeMismatch.Count), RequiredMismatch=$($requiredMismatch.Count), DefaultMismatch=$($defaultMismatch.Count)."
  }

  Write-Host "`nProvisioning and validation completed successfully for all Project Spotlight publisher lists." -ForegroundColor Green
}
finally {
  $conn = Get-PnPConnection -ErrorAction SilentlyContinue
  if ($null -ne $conn) {
    Disconnect-PnPOnline -ErrorAction SilentlyContinue
  }
}
