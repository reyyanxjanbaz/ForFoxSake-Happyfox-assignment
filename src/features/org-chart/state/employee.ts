// Employee types and selectors for org chart state management

export interface Employee {
  id: string;
  name: string;
  designation: string;
  tier: 'executive' | 'lead' | 'manager' | 'individual' | 'intern';
  team: string;
  managerId: string | null;
  photoAssetKey: string | null;
  photoUrl?: string | null;
  employeeId: string;
  highlightState: {
    active: boolean;
    reason: 'filter' | 'drag' | null;
  };
  lastUpdatedAt: string;
}

export interface EmployeeCollection {
  data: Employee[];
  hierarchy: {
    roots: string[];
    children: Record<string, string[]>;
    levels: Record<string, number>;
  };
}

// Selectors for employee data manipulation
export const selectEmployeeById = (employees: Employee[], id: string): Employee | undefined => {
  return employees.find(emp => emp.id === id);
};

export const selectEmployeesByTier = (employees: Employee[], tier: Employee['tier']): Employee[] => {
  return employees.filter(emp => emp.tier === tier);
};

export const selectEmployeesByTeam = (employees: Employee[], team: string): Employee[] => {
  return employees.filter(emp => emp.team === team);
};

export const selectDirectReports = (employees: Employee[], managerId: string): Employee[] => {
  return employees.filter(emp => emp.managerId === managerId);
};

export const selectHighlightedEmployees = (employees: Employee[]): Employee[] => {
  return employees.filter(emp => emp.highlightState.active);
};

export const selectEmployeeHierarchyPath = (employees: Employee[], employeeId: string): Employee[] => {
  const path: Employee[] = [];
  let currentEmployee = selectEmployeeById(employees, employeeId);
  
  while (currentEmployee) {
    path.unshift(currentEmployee);
    if (currentEmployee.managerId) {
      currentEmployee = selectEmployeeById(employees, currentEmployee.managerId);
    } else {
      break;
    }
  }
  
  return path;
};

// Employee state mutations
export const updateEmployeeHighlight = (
  employee: Employee, 
  active: boolean, 
  reason: 'filter' | 'drag' | null = null
): Employee => {
  return {
    ...employee,
    highlightState: { active, reason },
    lastUpdatedAt: new Date().toISOString(),
  };
};

export const updateEmployeeManager = (
  employee: Employee, 
  newManagerId: string | null
): Employee => {
  return {
    ...employee,
    managerId: newManagerId,
    lastUpdatedAt: new Date().toISOString(),
  };
};

export const promoteEmployee = (
  employee: Employee, 
  newTier: Employee['tier'], 
  newDesignation: string
): Employee => {
  return {
    ...employee,
    tier: newTier,
    designation: newDesignation,
    lastUpdatedAt: new Date().toISOString(),
  };
};

export interface HighlightUpdateOptions {
  active: boolean;
  reason: 'filter' | 'drag' | null;
}

export const applyHighlightChanges = (
  employees: Employee[],
  employeeIds: string[],
  { active, reason }: HighlightUpdateOptions
): Employee[] => {
  const now = new Date().toISOString();

  return employees.map((employee) => {
    const isTargetEmployee = employeeIds.includes(employee.id);

    if (reason === 'filter') {
      if (active && isTargetEmployee) {
        return {
          ...employee,
          highlightState: {
            active: true,
            reason: 'filter' as const,
          },
          lastUpdatedAt: now,
        };
      }

      if (active && !isTargetEmployee && employee.highlightState.reason === 'filter') {
        return {
          ...employee,
          highlightState: {
            active: false,
            reason: null,
          },
          lastUpdatedAt: now,
        };
      }
    }

    if (!active && reason === null) {
      if (employee.highlightState.reason === 'filter' || isTargetEmployee) {
        return {
          ...employee,
          highlightState: {
            active: false,
            reason: null,
          },
          lastUpdatedAt: now,
        };
      }
    }

    if (reason === 'drag' && isTargetEmployee) {
      return {
        ...employee,
        highlightState: {
          active,
          reason: active ? ('drag' as const) : null,
        },
        lastUpdatedAt: now,
      };
    }

    return employee;
  });
};