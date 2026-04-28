# Company-Level Model

## Objective
Represent enterprise-wide master data and canonical reference layers that make cross-project analytics possible.

## Primary grain
Company-level canonical entities should be maintained at their native company grain and linked downstream to projects and transactions.

## Recommended company-level entities

### Core dimensions
- company
- department
- trade
- permission_template
- distribution_group
- custom_field_definition
- custom_field_option
- generic_tool_type
- wbs_attribute
- wbs_attribute_item
- segment_item_list
- cost_code / wbs_code master where company-scoped
- vendor_organization
- user

### Company-to-project / company-to-entity bridges
- bridge_company_project
- bridge_company_user
- bridge_company_vendor
- bridge_company_distribution_group_member
- bridge_company_tool_permission_template

### Company operational reference entities
- company_settings
- company_configuration
- workflow_template
- workflow_manager_company
- project_template
- project_filter
- project_role_reference

## Purpose in analytics
This layer supports:
- portfolio rollups
- region / office / business-unit slicing
- standardized vendor and user dimensions
- cross-project comparability for WBS, cost, and labor
- security/ownership context for workflow and responsibility analytics
- configurable-schema interpretation for custom and required fields

## Key design choices
1. Preserve Procore company_id as the native anchor key.
2. Issue HB Intel surrogate keys only for conformed dimensions.
3. Separate company-scope custom-field definitions from project fact values.
4. Normalize vendors and users once and relate them to projects through bridges.
5. Preserve WBS reference data as its own conformed layer rather than re-embedding it in every financial fact.

## High-value company-level outputs for SharePoint / HB Intel
- company master and project catalog
- vendor master with trade and insurance/compliance indicators
- user master with department/role context
- WBS master explorer
- permission and responsibility reference data
- custom field dictionary
- enabled-tool matrix by project

## First-wave company-level entities
Must-have:
- company
- project
- user
- vendor_organization
- trade
- department
- wbs_code / cost_code layer
- custom_field_definition
- bridge_project_tool_enablement

Should-have:
- permission_template
- project_role_reference
- location hierarchy standard
- generic_tool_type for correspondence

Can defer:
- workflow templates/managers
- distribution groups
- project filters/templates
- niche config resources