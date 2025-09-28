// Context provider that integrates all org chart state and services

import React, { createContext, useContext, useCallback, useEffect, useReducer } from 'react';
import type { Employee } from '../state/employee';
import type { FilterState } from '../state/filterState';
import type { OrgHierarchy } from '../state/orgHierarchy';
import { buildOrgHierarchy, getDescendants } from '../state/orgHierarchy';
import { initialFilterState, updateFilterQuery, clearAllFilters } from '../state/filterState';
import { employeeApi } from '../services/api';
import { useHighlights } from '../hooks/useHighlights';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

// Combined application state
export interface OrgChartState {
  employees: Employee[];
  hierarchy: OrgHierarchy | null;
  filterState: FilterState;
  loading: boolean;
  error: string | null;
  selectedEmployeeId: string | null;
  isAddModalOpen: boolean;
}

// Action types for state management
export type OrgChartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'SET_HIERARCHY'; payload: OrgHierarchy }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'REMOVE_EMPLOYEES'; payload: string[] }
  | { type: 'UPDATE_FILTER'; payload: { field: 'name' | 'designation' | 'employeeId'; query: string } }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SELECTED_EMPLOYEE'; payload: string | null }
  | { type: 'SET_ADD_MODAL_OPEN'; payload: boolean }
  | { type: 'UPDATE_EMPLOYEE_HIGHLIGHTS'; payload: Employee[] };

// Initial state
const initialState: OrgChartState = {
  employees: [],
  hierarchy: null,
  filterState: initialFilterState,
  loading: false,
  error: null,
  selectedEmployeeId: null,
  isAddModalOpen: false,
};

const fallbackEmployeeId = (employee: Employee, index: number): string => {
  if (employee.employeeId && employee.employeeId.trim().length > 0) {
    return employee.employeeId.trim();
  }

  const fromId = employee.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
  if (fromId) {
    return `EMP-${fromId}`;
  }

  return `EMP-${String(index + 1).padStart(5, '0')}`;
};

const ensureEmployeesHaveIds = (employees: Employee[]): Employee[] => {
  return employees.map((employee, index) => {
    const normalizedId = fallbackEmployeeId(employee, index);
    if (normalizedId === employee.employeeId) {
      return employee;
    }

    return {
      ...employee,
      employeeId: normalizedId,
    };
  });
};

// State reducer
function orgChartReducer(state: OrgChartState, action: OrgChartAction): OrgChartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_EMPLOYEES': {
      const normalizedEmployees = ensureEmployeesHaveIds(action.payload);
      return {
        ...state,
        employees: normalizedEmployees,
        hierarchy: buildOrgHierarchy(normalizedEmployees),
      };
    }

    case 'SET_HIERARCHY':
      return { ...state, hierarchy: action.payload };
    
    case 'UPDATE_EMPLOYEE': {
      const normalizedEmployee = ensureEmployeesHaveIds([action.payload])[0];
      const updatedEmployees = state.employees.map(emp =>
        emp.id === normalizedEmployee.id ? normalizedEmployee : emp
      );
      return {
        ...state,
        employees: updatedEmployees,
        hierarchy: buildOrgHierarchy(updatedEmployees),
      };
    }
    
    case 'ADD_EMPLOYEE': {
      const normalizedEmployee = ensureEmployeesHaveIds([action.payload])[0];
      const newEmployees = [...state.employees, normalizedEmployee];
      return {
        ...state,
        employees: newEmployees,
        hierarchy: buildOrgHierarchy(newEmployees),
      };
    }

    case 'REMOVE_EMPLOYEES': {
      const remainingEmployees = state.employees.filter(
        employee => !action.payload.includes(employee.id)
      );
      return {
        ...state,
        employees: remainingEmployees,
        hierarchy: buildOrgHierarchy(remainingEmployees),
        selectedEmployeeId: action.payload.includes(state.selectedEmployeeId ?? '')
          ? null
          : state.selectedEmployeeId,
      };
    }
    
    case 'UPDATE_FILTER':
      return {
        ...state,
        filterState: updateFilterQuery(
          state.filterState,
          action.payload.field,
          action.payload.query,
          state.employees
        ),
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filterState: clearAllFilters(),
      };
    
    case 'SET_SELECTED_EMPLOYEE':
      return { ...state, selectedEmployeeId: action.payload };
    
    case 'SET_ADD_MODAL_OPEN':
      return { ...state, isAddModalOpen: action.payload };
    
    case 'UPDATE_EMPLOYEE_HIGHLIGHTS':
      return { ...state, employees: ensureEmployeesHaveIds(action.payload) };
    
    default:
      return state;
  }
}

// Context interface
export interface OrgChartContextValue {
  // State
  state: OrgChartState;
  
  // Employee operations
  loadEmployees: () => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  addEmployee: (employee: Employee) => void;
  removeEmployeeBranch: (employeeId: string) => Promise<void>;
  
  // Filter operations
  updateFilter: (field: 'name' | 'designation' | 'employeeId', query: string) => void;
  clearFilters: () => void;
  
  // Selection operations
  selectEmployee: (employeeId: string | null) => void;
  
  // Modal operations
  openAddModal: () => void;
  closeAddModal: () => void;
  
  // Highlight operations (from useHighlights hook)
  highlightedEmployeeIds: string[];
  highlightEmployee: (employeeId: string, reason: 'filter' | 'drag') => void;
  unhighlightEmployee: (employeeId: string) => void;
  clearAllHighlights: () => void;
  isEmployeeHighlighted: (employeeId: string) => boolean;
  getHighlightReason: (employeeId: string) => 'filter' | 'drag' | null;
  
  // Drag and drop operations
  dragAndDrop: ReturnType<typeof useDragAndDrop>;
}

// Create context
const OrgChartContext = createContext<OrgChartContextValue | undefined>(undefined);

// Provider component
export interface OrgChartProviderProps {
  children: React.ReactNode;
}

export const OrgChartProvider: React.FC<OrgChartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(orgChartReducer, initialState);

  // Employee operations
  const loadEmployees = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const employeeCollection = await employeeApi.loadEmployees();
  dispatch({ type: 'SET_EMPLOYEES', payload: employeeCollection.data });
  dispatch({ type: 'SET_HIERARCHY', payload: employeeCollection.hierarchy });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load employees';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateEmployee = useCallback(async (employee: Employee) => {
    try {
      const updatedEmployee = await employeeApi.updateEmployee(employee.id, {
        name: employee.name,
        designation: employee.designation,
        tier: employee.tier,
        team: employee.team,
        managerId: employee.managerId,
        highlightState: employee.highlightState,
      });
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: updatedEmployee });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update employee';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const addEmployee = useCallback((employee: Employee) => {
    dispatch({ type: 'ADD_EMPLOYEE', payload: employee });
  }, []);

  const removeEmployeeBranch = useCallback(async (employeeId: string) => {
    const hierarchy = buildOrgHierarchy(state.employees);
    const descendantIds = getDescendants(employeeId, hierarchy);
    const branchIds = [employeeId, ...descendantIds];

    try {
      await employeeApi.deleteEmployee(employeeId, { cascade: true });
      dispatch({ type: 'REMOVE_EMPLOYEES', payload: branchIds });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete employee branch';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.employees]);

  // Filter operations
  const updateFilter = useCallback((field: 'name' | 'designation' | 'employeeId', query: string) => {
    dispatch({ type: 'UPDATE_FILTER', payload: { field, query } });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  // Selection operations
  const selectEmployee = useCallback((employeeId: string | null) => {
    dispatch({ type: 'SET_SELECTED_EMPLOYEE', payload: employeeId });
  }, []);

  // Modal operations
  const openAddModal = useCallback(() => {
    dispatch({ type: 'SET_ADD_MODAL_OPEN', payload: true });
  }, []);

  const closeAddModal = useCallback(() => {
    dispatch({ type: 'SET_ADD_MODAL_OPEN', payload: false });
  }, []);

  // Highlight operations using useHighlights hook
  const handleEmployeeHighlight = useCallback((
    employeeIds: string[],
    active: boolean,
    reason: 'filter' | 'drag' | null
  ) => {
    const updatedEmployees = state.employees.map(employee => {
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
    
    dispatch({ type: 'UPDATE_EMPLOYEE_HIGHLIGHTS', payload: updatedEmployees });
  }, [state.employees]);

  const highlights = useHighlights({
    employees: state.employees,
    filterState: state.filterState,
    onEmployeeHighlight: handleEmployeeHighlight,
  });

  // Drag and drop operations
  const handleDragEmployeeUpdate = useCallback((updatedEmployees: Employee[]) => {
  dispatch({ type: 'SET_EMPLOYEES', payload: updatedEmployees });
  }, []);

  const handleCycleDetected = useCallback((cycleNodes: string[]) => {
    const cycleNames = cycleNodes
      .map(id => state.employees.find(emp => emp.id === id)?.name)
      .filter(Boolean)
      .join(' → ');
    
    dispatch({ 
      type: 'SET_ERROR', 
      payload: `Cannot reassign: would create cycle (${cycleNames})` 
    });
  }, [state.employees]);

  const dragAndDrop = useDragAndDrop({
    employees: state.employees,
    onEmployeeUpdate: handleDragEmployeeUpdate,
    onCycleDetected: handleCycleDetected,
  });

  // Load employees on mount
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Context value
  const contextValue: OrgChartContextValue = {
    state,
    loadEmployees,
    updateEmployee,
    addEmployee,
    removeEmployeeBranch,
    updateFilter,
    clearFilters,
    selectEmployee,
    openAddModal,
    closeAddModal,
    ...highlights,
    dragAndDrop,
  };

  return (
    <OrgChartContext.Provider value={contextValue}>
      {children}
    </OrgChartContext.Provider>
  );
};

// Hook to use the context
export const useOrgChart = (): OrgChartContextValue => {
  const context = useContext(OrgChartContext);
  if (context === undefined) {
    throw new Error('useOrgChart must be used within an OrgChartProvider');
  }
  return context;
};

export default OrgChartProvider;