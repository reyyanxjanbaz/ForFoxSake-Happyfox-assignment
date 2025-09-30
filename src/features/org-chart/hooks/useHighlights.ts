// Highlight orchestration hook to sync FilterState results to sidebar/chart pulses

import { useEffect, useCallback, useMemo, useRef } from 'react';
import type { Employee } from '../state/employee';
import type { FilterState } from '../state/filterState';
import { combineFilters } from '../state/filterState';

export interface UseHighlightsProps {
  employees: Employee[];
  filterState: FilterState;
  onEmployeeHighlight?: (employeeIds: string[], active: boolean, reason: 'filter' | 'drag' | null) => void;
}

export interface UseHighlightsReturn {
  highlightedEmployeeIds: string[];
  highlightEmployee: (employeeId: string, reason: 'filter' | 'drag') => void;
  unhighlightEmployee: (employeeId: string) => void;
  clearAllHighlights: () => void;
  isEmployeeHighlighted: (employeeId: string) => boolean;
  getHighlightReason: (employeeId: string) => 'filter' | 'drag' | null;
}

export const useHighlights = ({
  employees,
  filterState,
  onEmployeeHighlight,
}: UseHighlightsProps): UseHighlightsReturn => {
  const previousFilterIdsRef = useRef<string[]>([]);
  
  // Calculate filtered employee IDs based on current filter state
  const filteredEmployeeIds = useMemo(() => {
    if (!filterState.activeFilters.name && 
        !filterState.activeFilters.designation && 
        !filterState.activeFilters.employeeId) {
      return [];
    }

    return combineFilters(filterState, employees);
  }, [employees, filterState]);

  // Sync filter highlights with parent component
  useEffect(() => {
    if (!onEmployeeHighlight) {
      previousFilterIdsRef.current = filteredEmployeeIds;
      return;
    }

    const previousIds = previousFilterIdsRef.current;
    const currentIds = filteredEmployeeIds;
    
    // Always clear ALL previous filter highlights first
    if (previousIds.length > 0) {
      onEmployeeHighlight(previousIds, false, null);
    }
    
    // Then apply new highlights if any
    if (currentIds.length > 0) {
      onEmployeeHighlight(currentIds, true, 'filter');
    }

    previousFilterIdsRef.current = currentIds;
  }, [filteredEmployeeIds, onEmployeeHighlight, filterState]);

  // Get all currently highlighted employee IDs
  const highlightedEmployeeIds = useMemo(() => {
    return employees
      .filter(emp => emp.highlightState.active)
      .map(emp => emp.id);
  }, [employees]);

  // Highlight a specific employee with a reason
  const highlightEmployee = useCallback((employeeId: string, reason: 'filter' | 'drag') => {
    if (onEmployeeHighlight) {
      onEmployeeHighlight([employeeId], true, reason);
    }
  }, [onEmployeeHighlight]);

  // Remove highlight from a specific employee
  const unhighlightEmployee = useCallback((employeeId: string) => {
    if (onEmployeeHighlight) {
      onEmployeeHighlight([employeeId], false, null);
    }
  }, [onEmployeeHighlight]);

  // Clear all highlights regardless of reason
  const clearAllHighlights = useCallback(() => {
    if (onEmployeeHighlight && highlightedEmployeeIds.length > 0) {
      onEmployeeHighlight(highlightedEmployeeIds, false, null);
    }
  }, [onEmployeeHighlight, highlightedEmployeeIds]);

  // Check if a specific employee is highlighted
  const isEmployeeHighlighted = useCallback((employeeId: string): boolean => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.highlightState.active || false;
  }, [employees]);

  // Get the highlight reason for a specific employee
  const getHighlightReason = useCallback((employeeId: string): 'filter' | 'drag' | null => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.highlightState.reason || null;
  }, [employees]);

  return {
    highlightedEmployeeIds,
    highlightEmployee,
    unhighlightEmployee,
    clearAllHighlights,
    isEmployeeHighlighted,
    getHighlightReason,
  };
};

// Higher-level hook for managing filter-based highlights specifically
export interface UseFilterHighlightsProps {
  employees: Employee[];
  filterState: FilterState;
  onUpdateEmployees?: (updatedEmployees: Employee[]) => void;
}

export const useFilterHighlights = ({
  employees,
  filterState,
  onUpdateEmployees,
}: UseFilterHighlightsProps) => {
  
  const handleEmployeeHighlight = useCallback((
    employeeIds: string[], 
    active: boolean, 
    reason: 'filter' | 'drag' | null
  ) => {
    if (!onUpdateEmployees) return;

    const updatedEmployees = employees.map(employee => {
      if (employeeIds.includes(employee.id)) {
        return {
          ...employee,
          highlightState: {
            active,
            reason,
          },
          lastUpdatedAt: new Date().toISOString(),
        };
      }
      return employee;
    });

    onUpdateEmployees(updatedEmployees);
  }, [employees, onUpdateEmployees]);

  const highlights = useHighlights({
    employees,
    filterState,
    onEmployeeHighlight: handleEmployeeHighlight,
  });

  return highlights;
};

// Hook for managing drag-based highlights during reassignment operations
export interface UseDragHighlightsProps {
  employees: Employee[];
  onUpdateEmployees?: (updatedEmployees: Employee[]) => void;
}

export const useDragHighlights = ({
  employees,
  onUpdateEmployees,
}: UseDragHighlightsProps) => {
  
  const highlightDragTarget = useCallback((employeeId: string) => {
    if (!onUpdateEmployees) return;

    const updatedEmployees = employees.map(employee => {
      if (employee.id === employeeId) {
        return {
          ...employee,
          highlightState: {
            active: true,
            reason: 'drag' as const,
          },
          lastUpdatedAt: new Date().toISOString(),
        };
      }
      return employee;
    });

    onUpdateEmployees(updatedEmployees);
  }, [employees, onUpdateEmployees]);

  const clearDragHighlights = useCallback(() => {
    if (!onUpdateEmployees) return;

    const updatedEmployees = employees.map(employee => {
      if (employee.highlightState.active && employee.highlightState.reason === 'drag') {
        return {
          ...employee,
          highlightState: {
            active: false,
            reason: null,
          },
          lastUpdatedAt: new Date().toISOString(),
        };
      }
      return employee;
    });

    onUpdateEmployees(updatedEmployees);
  }, [employees, onUpdateEmployees]);

  const getDragHighlightedEmployees = useCallback(() => {
    return employees.filter(emp => 
      emp.highlightState.active && emp.highlightState.reason === 'drag'
    );
  }, [employees]);

  return {
    highlightDragTarget,
    clearDragHighlights,
    getDragHighlightedEmployees,
  };
};