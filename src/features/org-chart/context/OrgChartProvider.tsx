// Context provider that integrates all org chart state and services

import React, { createContext, useContext, useCallback, useEffect, useReducer } from 'react';
import { applyHighlightChanges, type Employee } from '../state/employee';
import type { FilterState } from '../state/filterState';
import type { OrgHierarchy } from '../state/orgHierarchy';
import { buildOrgHierarchy, getDescendants } from '../state/orgHierarchy';
import { initialFilterState, updateFilterQuery, clearAllFilters } from '../state/filterState';
import { employeeApi } from '../services/api';
import { useHighlights } from '../hooks/useHighlights';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useUndoStore } from '../state/undoState';

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

const fallbackEmployeeId = (employee: Employee): string => {
  if (employee.employeeId && employee.employeeId.trim().length > 0) {
    return employee.employeeId.trim();
  }

  // Generate random 4-digit number for clean ID format
  const randomNum = Math.floor(Math.random() * 9000) + 1000; // Ensures 4 digits (1000-9999)
  return `#${randomNum}`;
};

const ensureEmployeesHaveIds = (employees: Employee[]): Employee[] => {
  return employees.map((employee) => {
    const normalizedId = fallbackEmployeeId(employee);
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
  restoreFromUndo: () => void;
  
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
  const { recordDelete, performUndo } = useUndoStore();

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
    
    // Find the employee being deleted and their children
    const employeeToDelete = state.employees.find(emp => emp.id === employeeId);
    const childrenToDelete = state.employees.filter(emp => branchIds.includes(emp.id) && emp.id !== employeeId);
    
    if (!employeeToDelete) {
      dispatch({ type: 'SET_ERROR', payload: 'Employee not found' });
      return;
    }

    try {
      await employeeApi.deleteEmployee(employeeId, { cascade: true });
      dispatch({ type: 'REMOVE_EMPLOYEES', payload: branchIds });
      
      // Record the deletion for undo functionality
      recordDelete({
        type: childrenToDelete.length > 0 ? 'DELETE_BRANCH' : 'DELETE_NODE',
        employee: employeeToDelete,
        parentId: employeeToDelete.managerId || undefined,
        children: childrenToDelete.length > 0 ? childrenToDelete : undefined,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete employee branch';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.employees, recordDelete]);

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

  // Undo operations
  const restoreFromUndo = useCallback(() => {
    const undoOperation = performUndo();
    
    if (!undoOperation) return;
    
    // Restore the deleted employee(s)
    const employeesToRestore = [undoOperation.employee];
    if (undoOperation.children) {
      employeesToRestore.push(...undoOperation.children);
    }
    
    // Add the employees back
    const restoredEmployees = [...state.employees, ...employeesToRestore];
    dispatch({ type: 'SET_EMPLOYEES', payload: restoredEmployees });
    
    // Show success message
    dispatch({ 
      type: 'SET_ERROR', 
      payload: `✅ Restored ${undoOperation.employee.name}${undoOperation.children ? ` and ${undoOperation.children.length} team member${undoOperation.children.length > 1 ? 's' : ''}` : ''}` 
    });
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      dispatch({ type: 'SET_ERROR', payload: null });
    }, 3000);
  }, [state.employees, performUndo]);

  // Highlight operations using useHighlights hook
  const handleEmployeeHighlight = useCallback((
    employeeIds: string[],
    active: boolean,
    reason: 'filter' | 'drag' | null
  ) => {
    const updatedEmployees = applyHighlightChanges(state.employees, employeeIds, { active, reason });
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

  const handleDragSuccess = useCallback((sourceId: string, targetId: string) => {
    const sourceEmployee = state.employees.find(emp => emp.id === sourceId);
    const targetEmployee = state.employees.find(emp => emp.id === targetId);
    
    if (sourceEmployee && targetEmployee) {
      // Clear any previous errors and show success (temporarily)
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Show success message briefly
      setTimeout(() => {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: `✅ ${sourceEmployee.name} moved to ${targetEmployee.name}'s team` 
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          dispatch({ type: 'SET_ERROR', payload: null });
        }, 3000);
      }, 100);
    }
  }, [state.employees]);

  const handleDragFailure = useCallback((sourceId: string, targetId: string) => {
    const sourceEmployee = state.employees.find(emp => emp.id === sourceId);
    const targetEmployee = state.employees.find(emp => emp.id === targetId);
    
    if (sourceEmployee && targetEmployee) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: `❌ Failed to move ${sourceEmployee.name} to ${targetEmployee.name}'s team` 
      });
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
      }, 3000);
    }
  }, [state.employees]);

  const dragAndDrop = useDragAndDrop({
    employees: state.employees,
    onEmployeeUpdate: handleDragEmployeeUpdate,
    onCycleDetected: handleCycleDetected,
    onDragEnd: (success, sourceId, targetId) => {
      if (success && sourceId && targetId) {
        handleDragSuccess(sourceId, targetId);
      } else if (!success && sourceId && targetId) {
        handleDragFailure(sourceId, targetId);
      }
    },
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
    restoreFromUndo,
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
// eslint-disable-next-line react-refresh/only-export-components
export const useOrgChart = (): OrgChartContextValue => {
  const context = useContext(OrgChartContext);
  if (context === undefined) {
    throw new Error('useOrgChart must be used within an OrgChartProvider');
  }
  return context;
};

export default OrgChartProvider;