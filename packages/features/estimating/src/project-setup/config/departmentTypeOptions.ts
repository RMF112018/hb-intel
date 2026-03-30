import type { ProjectDepartment } from '@hbc/models';

export interface IWizardOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export const OFFICE_DIVISION_OPTIONS: readonly IWizardOption[] = [
  { value: 'Luxury Residential (01-10)', label: 'Luxury Residential (01-10)' },
  { value: 'HB HQ Aerospace (01-41)', label: 'HB HQ Aerospace (01-41)' },
  { value: 'HB HQ General Commercial (01-43)', label: 'HB HQ General Commercial (01-43)' },
  {
    value: 'HB HQ Country Clubs & Hospitality (01-44)',
    label: 'HB HQ Country Clubs & Hospitality (01-44)',
  },
  { value: 'HB HQ Educational & Municipal (01-45)', label: 'HB HQ Educational & Municipal (01-45)' },
  { value: 'HB HQ Multi-Family (01-48)', label: 'HB HQ Multi-Family (01-48)' },
  { value: 'South Aerospace (01-51)', label: 'South Aerospace (01-51)' },
  { value: 'South General Commercial (01-53)', label: 'South General Commercial (01-53)' },
  {
    value: 'South Country Clubs & Hospitality (01-44)',
    label: 'South Country Clubs & Hospitality (01-44)',
  },
  { value: 'South Educational & Municipal (01-55)', label: 'South Educational & Municipal (01-55)' },
  { value: 'South Multi-Family (01-58)', label: 'South Multi-Family (01-58)' },
  { value: 'Central Aerospace (01-61)', label: 'Central Aerospace (01-61)' },
  { value: 'Central General Commercial (01-63)', label: 'Central General Commercial (01-63)' },
  {
    value: 'Central Country Clubs & Hospitality (01-64)',
    label: 'Central Country Clubs & Hospitality (01-64)',
  },
  {
    value: 'Central Educational & Municipal (01-65)',
    label: 'Central Educational & Municipal (01-65)',
  },
  { value: 'Central Multi-Family (01-68)', label: 'Central Multi-Family (01-68)' },
  { value: 'Space Coast Aerospace (01-31)', label: 'Space Coast Aerospace (01-31)' },
  {
    value: 'Space Coast General Commercial (01-33)',
    label: 'Space Coast General Commercial (01-33)',
  },
  {
    value: 'Space Coast Country Clubs & Hospitality (01-34)',
    label: 'Space Coast Country Clubs & Hospitality (01-34)',
  },
  {
    value: 'Space Coast Educational & Municipal (01-35)',
    label: 'Space Coast Educational & Municipal (01-35)',
  },
  { value: 'Space Coast Multi-Family (01-38)', label: 'Space Coast Multi-Family (01-38)' },
  {
    value: 'Hedrick Overhead or Related Entity (01-05)',
    label: 'Hedrick Overhead or Related Entity (01-05)',
  },
] as const;

export const PROJECT_STAGE_OPTIONS: readonly IWizardOption[] = [
  { value: 'Lead', label: 'Lead' },
  { value: 'Pursuit', label: 'Pursuit' },
  { value: 'Preconstruction', label: 'Preconstruction' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Closeout', label: 'Closeout' },
  { value: 'Warranty', label: 'Warranty' },
] as const;

export const CONTRACT_TYPE_OPTIONS: readonly IWizardOption[] = [
  { value: 'Lump Sum / Stipulated Sum Contract', label: 'Lump Sum / Stipulated Sum Contract' },
  {
    value: 'Fixed Price with Economic Adjustment Contract',
    label: 'Fixed Price with Economic Adjustment Contract',
  },
  { value: 'Unit Price / Item Rate Contract', label: 'Unit Price / Item Rate Contract' },
  { value: 'Cost Plus Fixed Fee (CPFF) Contract', label: 'Cost Plus Fixed Fee (CPFF) Contract' },
  { value: 'Cost Plus Incentive Fee (CPIF) Contract', label: 'Cost Plus Incentive Fee (CPIF) Contract' },
  { value: 'Cost Plus Award Fee (CPAF) Contract', label: 'Cost Plus Award Fee (CPAF) Contract' },
  {
    value: 'Cost Plus Percentage of Cost Contract',
    label: 'Cost Plus Percentage of Cost Contract',
  },
  { value: 'Time and Materials (T&M) Contract', label: 'Time and Materials (T&M) Contract' },
  { value: 'Guaranteed Maximum Price (GMP) Contract', label: 'Guaranteed Maximum Price (GMP) Contract' },
  { value: 'Target Cost Contract', label: 'Target Cost Contract' },
  { value: 'Design-Bid-Build (DBB) Contract', label: 'Design-Bid-Build (DBB) Contract' },
  { value: 'Design-Build (DB) Contract', label: 'Design-Build (DB) Contract' },
  {
    value: 'Construction Management at Risk (CMAR) Contract',
    label: 'Construction Management at Risk (CMAR) Contract',
  },
  {
    value: 'Construction Management Agency (CMA) Contract',
    label: 'Construction Management Agency (CMA) Contract',
  },
  { value: 'Integrated Project Delivery (IPD) Contract', label: 'Integrated Project Delivery (IPD) Contract' },
  {
    value: 'Engineer-Procure-Construct (EPC) Contract',
    label: 'Engineer-Procure-Construct (EPC) Contract',
  },
  { value: 'Turnkey Contract', label: 'Turnkey Contract' },
  { value: 'Job Order Contracting (JOC) Contract', label: 'Job Order Contracting (JOC) Contract' },
  {
    value: 'Progressive Design-Build Contract',
    label: 'Progressive Design-Build Contract',
  },
  {
    value: 'Public-Private Partnership (P3 / PPP) Contract',
    label: 'Public-Private Partnership (P3 / PPP) Contract',
  },
  { value: 'Incentive Contract', label: 'Incentive Contract' },
  { value: 'Alliance Contracting Agreement', label: 'Alliance Contracting Agreement' },
  { value: 'Joint Venture Agreement', label: 'Joint Venture Agreement' },
  {
    value: 'Indefinite Delivery / Indefinite Quantity (IDIQ) Contract',
    label: 'Indefinite Delivery / Indefinite Quantity (IDIQ) Contract',
  },
] as const;

function header(label: string): IWizardOption {
  return { value: `__header__${label}`, label, disabled: true };
}

const COMMERCIAL_PROJECT_TYPE_OPTIONS: readonly IWizardOption[] = [
  header('Office Buildings'),
  { value: 'Corporate headquarters', label: 'Corporate headquarters' },
  { value: 'Multi-tenant Class A, B, and C buildings', label: 'Multi-tenant Class A, B, and C buildings' },
  { value: 'Low-rise, mid-rise, and high-rise towers', label: 'Low-rise, mid-rise, and high-rise towers' },
  { value: 'Flex office spaces with showroom elements', label: 'Flex office spaces with showroom elements' },
  header('Retail Facilities'),
  { value: 'Strip malls and neighborhood shopping centers', label: 'Strip malls and neighborhood shopping centers' },
  { value: 'Regional and super-regional malls', label: 'Regional and super-regional malls' },
  { value: 'Outlet centers', label: 'Outlet centers' },
  { value: 'Big-box stores and supermarkets', label: 'Big-box stores and supermarkets' },
  { value: 'Standalone storefronts and pad sites', label: 'Standalone storefronts and pad sites' },
  header('Hospitality and Lodging'),
  { value: 'Luxury, boutique, and mid-scale hotels', label: 'Luxury, boutique, and mid-scale hotels' },
  { value: 'Motels and extended-stay facilities', label: 'Motels and extended-stay facilities' },
  { value: 'Resorts and conference centers', label: 'Resorts and conference centers' },
  { value: 'Mixed-use lodging with integrated retail or dining', label: 'Mixed-use lodging with integrated retail or dining' },
  header('Restaurants and Food Service'),
  { value: 'Quick-service and fast-casual establishments', label: 'Quick-service and fast-casual establishments' },
  { value: 'Full-service restaurants and cafes', label: 'Full-service restaurants and cafes' },
  { value: 'Food halls and entertainment dining complexes', label: 'Food halls and entertainment dining complexes' },
  header('Industrial and Logistics'),
  { value: 'Manufacturing and assembly plants', label: 'Manufacturing and assembly plants' },
  { value: 'Warehouses and distribution centers', label: 'Warehouses and distribution centers' },
  { value: 'Flex industrial spaces', label: 'Flex industrial spaces' },
  { value: 'Cold storage and specialized logistics hubs', label: 'Cold storage and specialized logistics hubs' },
  header('Private Healthcare Facilities'),
  { value: 'Medical office buildings', label: 'Medical office buildings' },
  { value: 'Outpatient clinics and ambulatory surgery centers', label: 'Outpatient clinics and ambulatory surgery centers' },
  { value: 'Specialty diagnostic and surgical centers', label: 'Specialty diagnostic and surgical centers' },
  { value: 'Rehabilitation and long-term care facilities', label: 'Rehabilitation and long-term care facilities' },
  header('Mixed-Use Developments'),
  { value: 'Vertical combinations (retail/office/residential)', label: 'Vertical combinations (retail/office/residential)' },
  { value: 'Horizontal planned communities with multiple building types', label: 'Horizontal planned communities with multiple building types' },
  { value: 'Transit-oriented mixed-use projects', label: 'Transit-oriented mixed-use projects' },
  header('Entertainment Venues'),
  { value: 'Theaters, cinemas, and performing arts centers', label: 'Theaters, cinemas, and performing arts centers' },
  { value: 'Casinos and amusement facilities', label: 'Casinos and amusement facilities' },
  { value: 'Private sports arenas and recreational complexes', label: 'Private sports arenas and recreational complexes' },
  header('Financial Institutions'),
  { value: 'Banks and credit unions', label: 'Banks and credit unions' },
  { value: 'Trading floors and financial centers', label: 'Trading floors and financial centers' },
  header('Automotive Facilities'),
  { value: 'Dealerships and showrooms', label: 'Dealerships and showrooms' },
  { value: 'Service centers and car washes', label: 'Service centers and car washes' },
  header('Data Centers and Technology Facilities'),
  { value: 'Server farms and colocation facilities', label: 'Server farms and colocation facilities' },
  { value: 'High-tech research and development buildings', label: 'High-tech research and development buildings' },
  header('Public Construction Types'),
  header('Educational Facilities'),
  { value: 'K-12 schools and academies', label: 'K-12 schools and academies' },
  { value: 'Colleges, universities, and technical institutes', label: 'Colleges, universities, and technical institutes' },
  { value: 'Research laboratories and libraries', label: 'Research laboratories and libraries' },
  header('Government and Civic Buildings'),
  { value: 'City halls and administrative offices', label: 'City halls and administrative offices' },
  { value: 'Courthouses and federal/state buildings', label: 'Courthouses and federal/state buildings' },
  { value: 'Embassies and diplomatic facilities', label: 'Embassies and diplomatic facilities' },
  header('Public Safety Facilities'),
  { value: 'Police stations and headquarters', label: 'Police stations and headquarters' },
  { value: 'Fire stations and training facilities', label: 'Fire stations and training facilities' },
  { value: 'Emergency operations centers', label: 'Emergency operations centers' },
  header('Cultural and Institutional Buildings'),
  { value: 'Public libraries and archives', label: 'Public libraries and archives' },
  { value: 'Museums and galleries', label: 'Museums and galleries' },
  { value: 'Performing arts centers', label: 'Performing arts centers' },
  header('Recreational Facilities'),
  { value: 'Public parks, playgrounds, and trails', label: 'Public parks, playgrounds, and trails' },
  { value: 'Community centers and recreation halls', label: 'Community centers and recreation halls' },
  { value: 'Public sports complexes, stadiums, and arenas', label: 'Public sports complexes, stadiums, and arenas' },
  header('Transportation Infrastructure'),
  { value: 'Airports and aviation terminals', label: 'Airports and aviation terminals' },
  { value: 'Train stations and bus terminals', label: 'Train stations and bus terminals' },
  { value: 'Ports, harbors, and ferry terminals', label: 'Ports, harbors, and ferry terminals' },
  { value: 'Public transit stations and facilities', label: 'Public transit stations and facilities' },
  header('Public Healthcare Facilities'),
  { value: 'Public hospitals and acute-care centers', label: 'Public hospitals and acute-care centers' },
  { value: 'Veterans hospitals and clinics', label: 'Veterans hospitals and clinics' },
  { value: 'Public health departments and clinics', label: 'Public health departments and clinics' },
  header('Correctional Facilities'),
  { value: 'Prisons and penitentiaries', label: 'Prisons and penitentiaries' },
  { value: 'Jails, detention centers, and juvenile facilities', label: 'Jails, detention centers, and juvenile facilities' },
  header('Public Utilities and Infrastructure'),
  { value: 'Water treatment plants and reservoirs', label: 'Water treatment plants and reservoirs' },
  { value: 'Wastewater and sewage treatment facilities', label: 'Wastewater and sewage treatment facilities' },
  { value: 'Power plants, substations, and renewable energy sites', label: 'Power plants, substations, and renewable energy sites' },
  { value: 'Roads, highways, bridges, and tunnels', label: 'Roads, highways, bridges, and tunnels' },
  header('Private Construction Types'),
  header('Residential Facilities'),
  { value: 'Single-family detached homes', label: 'Single-family detached homes' },
  { value: 'Custom luxury estates and villas', label: 'Custom luxury estates and villas' },
  { value: 'Townhomes, row houses, and duplexes', label: 'Townhomes, row houses, and duplexes' },
  header('Multifamily Housing'),
  { value: 'Apartment complexes and garden-style units', label: 'Apartment complexes and garden-style units' },
  { value: 'Condominium developments', label: 'Condominium developments' },
  { value: 'Student housing and dormitories', label: 'Student housing and dormitories' },
  header('Senior Living Communities'),
  { value: 'Assisted living and memory care facilities', label: 'Assisted living and memory care facilities' },
  {
    value: 'Independent living and continuing care retirement communities',
    label: 'Independent living and continuing care retirement communities',
  },
  header('Private Educational Institutions'),
  { value: 'Private schools, academies, and preparatory institutions', label: 'Private schools, academies, and preparatory institutions' },
  { value: 'Private colleges and specialized training centers', label: 'Private colleges and specialized training centers' },
  header('Religious Facilities'),
  { value: 'Churches, temples, mosques, and synagogues', label: 'Churches, temples, mosques, and synagogues' },
  { value: 'Community worship and fellowship halls', label: 'Community worship and fellowship halls' },
  header('Private Recreational Facilities'),
  { value: 'Country clubs and golf courses', label: 'Country clubs and golf courses' },
  { value: 'Private gyms, fitness centers, and spas', label: 'Private gyms, fitness centers, and spas' },
  { value: 'Marinas, yacht clubs, and private resorts', label: 'Marinas, yacht clubs, and private resorts' },
  header('Agricultural and Farming Facilities'),
  { value: 'Large-scale barns, stables, and livestock housing', label: 'Large-scale barns, stables, and livestock housing' },
  { value: 'Processing plants and greenhouses', label: 'Processing plants and greenhouses' },
  { value: 'Storage silos and equipment buildings', label: 'Storage silos and equipment buildings' },
] as const;

const LUXURY_RESIDENTIAL_PROJECT_TYPE_OPTIONS: readonly IWizardOption[] = [
  header('Single-Family Detached Homes'),
  { value: 'Tract and production homes', label: 'Tract and production homes' },
  { value: 'Custom-built luxury residences', label: 'Custom-built luxury residences' },
  { value: 'Entry-level and starter homes', label: 'Entry-level and starter homes' },
  { value: 'Vacation homes and cabins', label: 'Vacation homes and cabins' },
  { value: 'Estate homes and compounds', label: 'Estate homes and compounds' },
  header('Single-Family Attached Homes'),
  { value: 'Townhomes and row houses', label: 'Townhomes and row houses' },
  { value: 'Duplexes, triplexes, and fourplexes', label: 'Duplexes, triplexes, and fourplexes' },
  { value: 'Zero-lot-line and patio homes', label: 'Zero-lot-line and patio homes' },
  header('Multifamily Residential Buildings'),
  { value: 'Garden-style apartment complexes', label: 'Garden-style apartment complexes' },
  { value: 'Mid-rise apartment buildings', label: 'Mid-rise apartment buildings' },
  { value: 'High-rise residential towers', label: 'High-rise residential towers' },
  { value: 'Condominium developments', label: 'Condominium developments' },
  { value: 'Apartment communities with amenities', label: 'Apartment communities with amenities' },
  header('Specialized Residential Communities'),
  { value: 'Senior living and retirement communities', label: 'Senior living and retirement communities' },
  { value: 'Assisted living and memory care facilities', label: 'Assisted living and memory care facilities' },
  { value: 'Independent living facilities', label: 'Independent living facilities' },
  { value: 'Continuing care retirement communities (CCRCs)', label: 'Continuing care retirement communities (CCRCs)' },
  header('Student and Group Housing'),
  { value: 'College dormitories and residence halls', label: 'College dormitories and residence halls' },
  { value: 'Student apartment complexes', label: 'Student apartment complexes' },
  { value: 'Group homes and supportive housing', label: 'Group homes and supportive housing' },
  header('Affordable and Workforce Housing'),
  { value: 'Low-income housing developments', label: 'Low-income housing developments' },
  { value: 'Mixed-income residential projects', label: 'Mixed-income residential projects' },
  { value: 'Workforce housing communities', label: 'Workforce housing communities' },
  header('Luxury and High-End Residential'),
  { value: 'Waterfront properties and estates', label: 'Waterfront properties and estates' },
  { value: 'Mountain and rural luxury homes', label: 'Mountain and rural luxury homes' },
  { value: 'Gated community residences', label: 'Gated community residences' },
  header('Renovation and Remodeling Projects'),
  { value: 'Whole-house renovations', label: 'Whole-house renovations' },
  { value: 'Home additions and expansions', label: 'Home additions and expansions' },
  { value: 'Kitchen and bathroom remodels', label: 'Kitchen and bathroom remodels' },
  { value: 'Basement and attic conversions', label: 'Basement and attic conversions' },
  { value: 'Historic home restorations', label: 'Historic home restorations' },
  header('Accessory Dwelling Units (ADUs) and Small Residential'),
  { value: 'Backyard cottages and granny flats', label: 'Backyard cottages and granny flats' },
  { value: 'Tiny homes', label: 'Tiny homes' },
  { value: 'Modular and prefabricated homes', label: 'Modular and prefabricated homes' },
  { value: 'Carriage houses and guest houses', label: 'Carriage houses and guest houses' },
] as const;

export const PROJECT_TYPE_OPTIONS_BY_DEPARTMENT: Readonly<Record<ProjectDepartment, readonly IWizardOption[]>> = {
  commercial: COMMERCIAL_PROJECT_TYPE_OPTIONS,
  'luxury-residential': LUXURY_RESIDENTIAL_PROJECT_TYPE_OPTIONS,
};

export function getProjectTypeOptionsForDepartment(
  department: ProjectDepartment | undefined,
): readonly IWizardOption[] {
  if (!department) return [];
  return PROJECT_TYPE_OPTIONS_BY_DEPARTMENT[department] ?? [];
}

export function isSelectableProjectType(option: Pick<IWizardOption, 'disabled'>): boolean {
  return !option.disabled;
}

export function isValidProjectTypeForDepartment(
  department: ProjectDepartment | undefined,
  projectType: string | undefined,
): boolean {
  if (!department || !projectType?.trim()) return false;
  return getProjectTypeOptionsForDepartment(department).some(
    (option) => option.value === projectType && isSelectableProjectType(option),
  );
}

export function isValidProjectStage(
  projectStage: string | undefined,
): projectStage is typeof PROJECT_STAGE_OPTIONS[number]['value'] {
  if (!projectStage) return false;
  return PROJECT_STAGE_OPTIONS.some((option) => option.value === projectStage);
}
