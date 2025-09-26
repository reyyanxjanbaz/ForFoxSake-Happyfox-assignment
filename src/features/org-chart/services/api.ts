// API service wrapper for employee operations

import type { Employee } from '../state/employee';

// API response types matching OpenAPI contract
export interface EmployeeCollection {
  data: Employee[];
  hierarchy: {
    roots: string[];
    children: Record<string, string[]>;
    levels: Record<string, number>;
  };
}

export interface EmployeeCreateRequest {
  name: string;
  designation: string;
  tier: Employee['tier'];
  team: string;
  managerId: string | null;
}

export interface EmployeeUpdateRequest {
  name?: string;
  designation?: string;
  tier?: Employee['tier'];
  team?: string;
  managerId?: string | null;
  highlightState?: Employee['highlightState'];
}

export interface ApiError {
  status: string;
  message: string;
}

// Base API configuration
const API_BASE_URL = '/api';

// Helper for API requests with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json() as ApiError;
      throw new Error(`API Error ${response.status}: ${errorData.message}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Network error: Failed to ${options.method || 'GET'} ${endpoint}`);
  }
}

// Employee API service methods
export const employeeApi = {
  // Load all employees with hierarchy metadata
  async loadEmployees(): Promise<EmployeeCollection> {
    return apiRequest<EmployeeCollection>('/employees');
  },

  // Create a new employee
  async createEmployee(employee: EmployeeCreateRequest): Promise<Employee> {
    return apiRequest<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  },

  // Update an existing employee
  async updateEmployee(id: string, updates: EmployeeUpdateRequest): Promise<Employee> {
    return apiRequest<Employee>(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Promote employee (change tier and potentially designation)
  async promoteEmployee(
    id: string, 
    newTier: Employee['tier'], 
    newDesignation?: string
  ): Promise<Employee> {
    const updates: EmployeeUpdateRequest = {
      tier: newTier,
      ...(newDesignation && { designation: newDesignation }),
    };
    
    return this.updateEmployee(id, updates);
  },

  // Reassign employee to new manager
  async reassignEmployee(id: string, newManagerId: string | null): Promise<Employee> {
    return this.updateEmployee(id, { managerId: newManagerId });
  },

  // Update employee highlight state
  async updateHighlight(
    id: string, 
    active: boolean, 
    reason: Employee['highlightState']['reason'] = null
  ): Promise<Employee> {
    return this.updateEmployee(id, {
      highlightState: { active, reason },
    });
  },

  // Bulk update highlights (for filter results)
  async updateMultipleHighlights(
    employeeIds: string[], 
    active: boolean, 
    reason: Employee['highlightState']['reason'] = 'filter'
  ): Promise<Employee[]> {
    const updatePromises = employeeIds.map(id => 
      this.updateHighlight(id, active, reason)
    );
    
    return Promise.all(updatePromises);
  },

  // Clear all highlights
  async clearAllHighlights(): Promise<void> {
    // First fetch all employees to get their IDs
    const { data: employees } = await this.loadEmployees();
    const highlightedEmployees = employees.filter(emp => emp.highlightState.active);
    
    // Clear highlights for currently highlighted employees
    if (highlightedEmployees.length > 0) {
      await this.updateMultipleHighlights(
        highlightedEmployees.map(emp => emp.id), 
        false, 
        null
      );
    }
  },
};

// Higher-level business logic operations
export const employeeOperations = {
  // Add new employee with auto-generated data
  async addEmployeeToManager(
    managerId: string | null,
    managerTier: Employee['tier'],
    employeeData: Partial<EmployeeCreateRequest> = {}
  ): Promise<Employee> {
    // Determine appropriate tier for new employee (one level below manager)
    const tierMapping: Record<Employee['tier'], Employee['tier']> = {
      'executive': 'lead',
      'lead': 'manager',
      'manager': 'individual',
      'individual': 'intern',
      'intern': 'intern', // Bottom tier stays same
    };

    const newEmployeeTier = tierMapping[managerTier] || 'intern';

    // Create employee with provided data or defaults
    const createRequest: EmployeeCreateRequest = {
      name: employeeData.name || 'New Employee',
      designation: employeeData.designation || 'TBD',
      tier: employeeData.tier || newEmployeeTier,
      team: employeeData.team || 'Unassigned',
      managerId,
    };

    return employeeApi.createEmployee(createRequest);
  },

  // Perform bulk reassignment with validation
  async bulkReassign(reassignments: Array<{ employeeId: string; newManagerId: string | null }>): Promise<{
    successful: Employee[];
    failed: Array<{ employeeId: string; error: string }>;
  }> {
    const results = {
      successful: [] as Employee[],
      failed: [] as Array<{ employeeId: string; error: string }>,
    };

    // Process reassignments sequentially to avoid race conditions
    for (const { employeeId, newManagerId } of reassignments) {
      try {
        const updatedEmployee = await employeeApi.reassignEmployee(employeeId, newManagerId);
        results.successful.push(updatedEmployee);
      } catch (error) {
        results.failed.push({
          employeeId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  },

  // Get filtered employees based on search criteria
  async searchEmployees(filters: {
    name?: string;
    designation?: string;
    tier?: Employee['tier'];
    team?: string;
  }): Promise<Employee[]> {
    const { data: employees } = await employeeApi.loadEmployees();
    
    return employees.filter(employee => {
      if (filters.name && !employee.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.designation && !employee.designation.toLowerCase().includes(filters.designation.toLowerCase())) {
        return false;
      }
      if (filters.tier && employee.tier !== filters.tier) {
        return false;
      }
      if (filters.team && employee.team !== filters.team) {
        return false;
      }
      return true;
    });
  },

  // Get employee hierarchy path (from root to employee)
  async getEmployeeHierarchyPath(employeeId: string): Promise<Employee[]> {
    const { data: employees } = await employeeApi.loadEmployees();
    const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
    
    const path: Employee[] = [];
    let currentId: string | null = employeeId;
    
    while (currentId) {
      const employee = employeeMap.get(currentId);
      if (!employee) break;
      
      path.unshift(employee); // Add to beginning to build root-to-employee path
      currentId = employee.managerId;
    }
    
    return path;
  },
};

// Export everything for convenience
export default {
  api: employeeApi,
  operations: employeeOperations,
};