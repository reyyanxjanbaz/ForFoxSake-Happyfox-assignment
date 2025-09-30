// Static dummy data curated by the user

import type { Employee } from '../state/employee';

interface StaticEmployeeSeed {
  id: string;
  name: string;
  designation: string;
  team: string;
  managerId: string | null;
  tier: Employee['tier'];
  photoUrl: string;
}

const STATIC_EMPLOYEES: StaticEmployeeSeed[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    designation: 'Chief Executive Officer',
    team: 'Executive',
    managerId: null,
    tier: 'executive',
    photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '2',
    name: 'Mark Hill',
    designation: 'Chief Technology Officer',
    team: 'Executive',
    managerId: '1',
    tier: 'executive',
    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '3',
    name: 'Sophia Lee',
    designation: 'Chief Marketing Officer',
    team: 'Executive',
    managerId: '1',
    tier: 'executive',
    photoUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    id: '4',
    name: 'David Kim',
    designation: 'Engineering Manager',
    team: 'Engineering',
    managerId: '2',
    tier: 'manager',
    photoUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
  },
  {
    id: '5',
    name: 'Emily Carter',
    designation: 'Product Manager',
    team: 'Product',
    managerId: '3',
    tier: 'manager',
    photoUrl: 'https://randomuser.me/api/portraits/women/47.jpg',
  },
  {
    id: '6',
    name: 'James White',
    designation: 'HR Manager',
    team: 'Human Resources',
    managerId: '1',
    tier: 'manager',
    photoUrl: 'https://randomuser.me/api/portraits/men/50.jpg',
  },
  {
    id: '7',
    name: 'Olivia Brown',
    designation: 'Frontend Lead',
    team: 'Engineering',
    managerId: '4',
    tier: 'lead',
    photoUrl: 'https://randomuser.me/api/portraits/women/55.jpg',
  },
  {
    id: '8',
    name: 'Ethan Davis',
    designation: 'Backend Lead',
    team: 'Engineering',
    managerId: '4',
    tier: 'lead',
    photoUrl: 'https://randomuser.me/api/portraits/men/60.jpg',
  },
  {
    id: '9',
    name: 'Sophia Green',
    designation: 'Marketing Lead',
    team: 'Marketing',
    managerId: '5',
    tier: 'lead',
    photoUrl: 'https://randomuser.me/api/portraits/women/64.jpg',
  },
  {
    id: '10',
    name: 'Liam Wilson',
    designation: 'Frontend Developer',
    team: 'Engineering',
    managerId: '7',
    tier: 'individual',
    photoUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  {
    id: '11',
    name: 'Mia Thomas',
    designation: 'Backend Developer',
    team: 'Engineering',
    managerId: '8',
    tier: 'individual',
    photoUrl: 'https://randomuser.me/api/portraits/women/77.jpg',
  },
  {
    id: '12',
    name: 'Noah Robinson',
    designation: 'Marketing Specialist',
    team: 'Marketing',
    managerId: '9',
    tier: 'individual',
    photoUrl: 'https://randomuser.me/api/portraits/men/79.jpg',
  },
  {
    id: '13',
    name: 'Ava Martinez',
    designation: 'Engineering Intern',
    team: 'Engineering',
    managerId: '10',
    tier: 'intern',
    photoUrl: 'https://randomuser.me/api/portraits/women/82.jpg',
  },
  {
    id: '14',
    name: 'Lucas Anderson',
    designation: 'Marketing Intern',
    team: 'Marketing',
    managerId: '12',
    tier: 'intern',
    photoUrl: 'https://randomuser.me/api/portraits/men/83.jpg',
  },
];

const mapSeedToEmployee = (seed: StaticEmployeeSeed, index: number): Employee => ({
  id: seed.id,
  name: seed.name,
  designation: seed.designation,
  tier: seed.tier,
  team: seed.team,
  managerId: seed.managerId,
  photoAssetKey: null,
  photoUrl: seed.photoUrl,
  employeeId: `#${1000 + parseInt(seed.id)}`,


  highlightState: {
    active: false,
    reason: null,
  },
  lastUpdatedAt: new Date(Date.now() - index * 60000).toISOString(),
});

// Return deep-cloned employees so callers can mutate safely
export const generateOrgHierarchy = (): Employee[] => {
  return STATIC_EMPLOYEES.map((seed, index) => ({ ...mapSeedToEmployee(seed, index) }));
};

// Helper for creating a new employee when using the add-node modal
export const createEmployeeForManager = (
  managerId: string | null,
  managerTier: Employee['tier'],
  overrides: Partial<Pick<Employee, 'name' | 'designation' | 'team' | 'tier'>> = {}
): Employee => {
  const tierMapping: Record<Employee['tier'], Employee['tier']> = {
    executive: 'lead',
    lead: 'manager',
    manager: 'individual',
    individual: 'intern',
    intern: 'intern',
  };

  const timestamp = Date.now();
  const id = `custom-${timestamp}`;
  const tier = overrides.tier || tierMapping[managerTier] || 'intern';

  return {
    id,
    name: overrides.name || 'New Team Member',
    designation: overrides.designation || 'Team Member',
    tier,
    team: overrides.team || 'Unassigned',
    managerId,
    photoAssetKey: null,
    photoUrl: null,
    employeeId: `#${Math.floor(Math.random() * 9000) + 1000}`,


    highlightState: {
      active: false,
      reason: null,
    },
    lastUpdatedAt: new Date().toISOString(),
  };
};