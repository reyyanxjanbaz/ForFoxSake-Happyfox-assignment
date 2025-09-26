// Dummy data generator using Faker for realistic employee data

import { faker } from '@faker-js/faker';
import type { Employee } from '../state/employee';

// Tier-aware designation mappings
const DESIGNATIONS_BY_TIER: Record<Employee['tier'], string[]> = {
  'executive': ['Chief Executive Officer', 'President', 'Chief Operating Officer'],
  'lead': ['Vice President', 'Senior Director', 'Chief Technology Officer', 'Chief Financial Officer'],
  'manager': ['Director', 'Senior Manager', 'Department Head', 'Principal Engineer'],
  'individual': ['Manager', 'Team Lead', 'Senior Developer', 'Product Manager', 'Senior Analyst'],
  'intern': ['Developer', 'Analyst', 'Coordinator', 'Specialist', 'Associate'],
};

// Photo asset keys for deterministic image assignment
const PHOTO_ASSETS = [
  'person-01', 'person-02', 'person-03', 'person-04', 'person-05',
  'person-06', 'person-07', 'person-08', 'person-09', 'person-10',
  'person-11', 'person-12', 'person-13', 'person-14', 'person-15',
  'person-16', 'person-17', 'person-18', 'person-19', 'person-20',
];

// Generate a single employee with tier-appropriate designation
export const generateEmployee = (
  tier: Employee['tier'],
  managerId: string | null = null,
  seed?: string
): Employee => {
  // Use seed for deterministic generation in tests
  if (seed) {
    faker.seed(parseInt(seed, 36));
  }

  const id = `emp_${faker.string.alphanumeric(8)}`;
  const employeeId = `EMP${faker.string.numeric(4)}`;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  
  // Select designation based on tier
  const tierDesignations = DESIGNATIONS_BY_TIER[tier] || DESIGNATIONS_BY_TIER['intern'];
  const designation = faker.helpers.arrayElement(tierDesignations);
  
  // Assign photo asset deterministically based on ID
  const photoIndex = parseInt(id.slice(-2), 36) % PHOTO_ASSETS.length;
  const photoAssetKey = PHOTO_ASSETS[photoIndex];

  // Generate team name
  const team = faker.helpers.arrayElement([
    'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 
    'Operations', 'Finance', 'HR', 'Legal'
  ]);

  return {
    id,
    name,
    designation,
    tier,
    team,
    managerId,
    photoAssetKey,
    employeeId,
    highlightState: {
      active: false,
      reason: null,
    },
    lastUpdatedAt: new Date().toISOString(),
  };
};

// Generate employees for a specific tier with count
export const generateEmployeesForTier = (
  tier: Employee['tier'],
  count: number,
  managerIds: string[] = []
): Employee[] => {
  const employees: Employee[] = [];

  for (let i = 0; i < count; i++) {
    // Assign manager if available (round-robin distribution)
    const managerId = managerIds.length > 0 
      ? managerIds[i % managerIds.length] 
      : null;

    employees.push(generateEmployee(tier, managerId));
  }

  return employees;
};

// Generate a complete five-tier organizational hierarchy
export const generateOrgHierarchy = (): Employee[] => {
  const employees: Employee[] = [];

  // Executive: CEO (1 person, no manager)
  const executives = generateEmployeesForTier('executive', 1);
  employees.push(...executives);

  // Lead: VPs (3 people, report to CEO)
  const ceoId = executives[0].id;
  const leads = generateEmployeesForTier('lead', 3, [ceoId]);
  employees.push(...leads);

  // Manager: Directors (6 people, report to VPs)
  const leadIds = leads.map(emp => emp.id);
  const managers = generateEmployeesForTier('manager', 6, leadIds);
  employees.push(...managers);

  // Individual: Senior ICs (12 people, report to Directors)
  const managerIds = managers.map(emp => emp.id);
  const individuals = generateEmployeesForTier('individual', 12, managerIds);
  employees.push(...individuals);

  // Intern: Junior staff (20 people, report to Senior ICs)
  const individualIds = individuals.map(emp => emp.id);
  const interns = generateEmployeesForTier('intern', 20, individualIds);
  employees.push(...interns);

  return employees;
};

// Generate additional employees for a specific manager (for add-node functionality)
export const generateEmployeeForManager = (
  managerId: string,
  managerTier: Employee['tier']
): Employee => {
  // New employee should be one tier below manager
  const tierMapping: Record<Employee['tier'], Employee['tier']> = {
    'executive': 'lead',
    'lead': 'manager',
    'manager': 'individual',
    'individual': 'intern',
    'intern': 'intern', // Bottom tier stays same
  };

  const newEmployeeTier = tierMapping[managerTier] || 'intern';
  return generateEmployee(newEmployeeTier, managerId);
};

// Utility to reseed faker for consistent test data
export const seedFakerForTesting = (seed: number = 12345): void => {
  faker.seed(seed);
};

// Get random photo key (for manual employee creation)
export const getRandomPhotoKey = (): string => {
  return faker.helpers.arrayElement(PHOTO_ASSETS);
};

// Get designation options for a tier (for UI dropdowns)
export const getDesignationsForTier = (tier: Employee['tier']): string[] => {
  return DESIGNATIONS_BY_TIER[tier] || DESIGNATIONS_BY_TIER['intern'];
};

// Validate if a tier is valid
export const isValidTier = (tier: string): tier is Employee['tier'] => {
  return (Object.keys(DESIGNATIONS_BY_TIER) as Employee['tier'][]).includes(tier as Employee['tier']);
};