// Filter state management with AND logic for employee search

import type { Employee } from './employee';

export interface FilterState {
  nameQuery: string;
  designationQuery: string;
  employeeIdQuery: string;
  activeFilters: {
    name: boolean;
    designation: boolean;
    employeeId: boolean;
  };
  results: string[];
}

export const initialFilterState: FilterState = {
  nameQuery: '',
  designationQuery: '',
  employeeIdQuery: '',
  activeFilters: {
    name: false,
    designation: false,
    employeeId: false,
  },
  results: [],
};

// Filter predicate functions
export const filterByName = (employees: Employee[], query: string): Employee[] => {
  if (!query.trim()) return employees;
  const normalizedQuery = query.toLowerCase().trim();
  return employees.filter(emp => 
    emp.name.toLowerCase().includes(normalizedQuery)
  );
};

export const filterByDesignation = (employees: Employee[], query: string): Employee[] => {
  if (!query.trim()) return employees;
  const normalizedQuery = query.toLowerCase().trim();
  return employees.filter(emp => 
    emp.designation.toLowerCase().includes(normalizedQuery)
  );
};

export const filterByEmployeeId = (employees: Employee[], query: string): Employee[] => {
  if (!query.trim()) return employees;
  
  const normalizedQuery = query.trim();
  
  return employees.filter(emp => {
    const employeeId = emp.employeeId;
    
    // Check for exact match
    if (employeeId === normalizedQuery) {
      return true;
    }
    
    // If query starts with #, check exact match
    if (normalizedQuery.startsWith('#')) {
      return employeeId === normalizedQuery;
    }
    
    // If query is just numbers, check if it matches the number part (e.g., "4325" matches "#4325")
    if (/^\d+$/.test(normalizedQuery)) {
      const numberPart = employeeId.replace('#', '');
      return numberPart === normalizedQuery;
    }
    
    // Partial match for any other case
    return employeeId.includes(normalizedQuery);
  });
};

// Apply AND logic to combine multiple active filters
export const combineFilters = (
  filterState: FilterState, 
  employees: Employee[]
): string[] => {
  const { activeFilters, nameQuery, designationQuery, employeeIdQuery } = filterState;
  
  // If no filters are active, return empty results
  const hasActiveFilters = Object.values(activeFilters).some(active => active);
  if (!hasActiveFilters) {
    return [];
  }

  let filteredEmployees = [...employees];

  // Apply name filter if active
  if (activeFilters.name && nameQuery.trim()) {
    filteredEmployees = filterByName(filteredEmployees, nameQuery);
  }

  // Apply designation filter if active
  if (activeFilters.designation && designationQuery.trim()) {
    filteredEmployees = filterByDesignation(filteredEmployees, designationQuery);
  }

  // Apply employee ID filter if active
  if (activeFilters.employeeId && employeeIdQuery.trim()) {
    filteredEmployees = filterByEmployeeId(filteredEmployees, employeeIdQuery);
  }

  return filteredEmployees.map(emp => emp.id);
};

// Update filter query and recalculate results
export const updateFilterQuery = (
  filterState: FilterState,
  field: 'name' | 'designation' | 'employeeId',
  query: string,
  employees: Employee[]
): FilterState => {
  const newState: FilterState = {
    ...filterState,
    [`${field}Query`]: query,
    activeFilters: {
      ...filterState.activeFilters,
      [field]: query.trim().length > 0,
    },
  };

  // Recalculate results with updated filters
  newState.results = combineFilters(newState, employees);
  
  return newState;
};

// Clear specific filter
export const clearFilter = (
  filterState: FilterState,
  field: 'name' | 'designation' | 'employeeId',
  employees: Employee[]
): FilterState => {
  const newState: FilterState = {
    ...filterState,
    [`${field}Query`]: '',
    activeFilters: {
      ...filterState.activeFilters,
      [field]: false,
    },
  };

  // Recalculate results after clearing filter
  newState.results = combineFilters(newState, employees);
  
  return newState;
};

// Clear all filters
export const clearAllFilters = (): FilterState => {
  return { ...initialFilterState };
};

// Check if any filters are currently active
export const hasActiveFilters = (filterState: FilterState): boolean => {
  return Object.values(filterState.activeFilters).some(active => active);
};

// Get filter summary for UI display
export const getFilterSummary = (filterState: FilterState) => {
  const activeCount = Object.values(filterState.activeFilters).filter(Boolean).length;
  const resultCount = filterState.results.length;
  const lastUpdated = new Date().toISOString();

  return {
    activeFilterCount: activeCount,
    resultCount,
    hasResults: resultCount > 0,
    isEmpty: activeCount > 0 && resultCount === 0,
    lastUpdated,
  };
};