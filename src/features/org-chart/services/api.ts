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
      let errorMessage = `API Error ${response.status}`;
      try {
        const errorData = await response.json() as ApiError;
        errorMessage = `${errorMessage}: ${errorData.message}`;
      } catch {
        // Ignore JSON parse errors for non-JSON responses
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return undefined as T;
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

  // Delete employee (optionally cascading to team)
  async deleteEmployee(id: string, options: { cascade?: boolean } = {}): Promise<void> {
  const params = new globalThis.URLSearchParams();
    if (options.cascade) {
      params.set('cascade', 'true');
    }

    const query = params.toString();
    await apiRequest<void>(`/employees/${id}${query ? `?${query}` : ''}`, {
      method: 'DELETE',
    });
  },
};