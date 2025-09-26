// Drag and drop hook for employee reassignment with cycle validation

import { useCallback, useState } from 'react';
import type { Employee } from '../state/employee';
import { detectCycle, buildOrgHierarchy } from '../state/orgHierarchy';
import { employeeApi, type EmployeeUpdateRequest } from '../services/api';

export interface DragState {
  isDragging: boolean;
  draggedEmployeeId: string | null;
  validDropTargets: string[];
  hoveredTargetId: string | null;
  isValidDrop: boolean;
}

export interface UseDragAndDropProps {
  employees: Employee[];
  onEmployeeUpdate?: (updatedEmployees: Employee[]) => void;
  onDragStart?: (employeeId: string) => void;
  onDragEnd?: (success: boolean, employeeId?: string, newManagerId?: string) => void;
  onCycleDetected?: (cycleNodes: string[]) => void;
}

export interface UseDragAndDropReturn {
  dragState: DragState;
  handleDragStart: (employeeId: string) => void;
  handleDragOver: (targetEmployeeId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (targetEmployeeId: string) => Promise<boolean>;
  handleDragEnd: () => void;
  isValidDropTarget: (sourceId: string, targetId: string) => boolean;
  getValidDropTargets: (employeeId: string) => string[];
}

const initialDragState: DragState = {
  isDragging: false,
  draggedEmployeeId: null,
  validDropTargets: [],
  hoveredTargetId: null,
  isValidDrop: false,
};

export const useDragAndDrop = ({
  employees,
  onEmployeeUpdate,
  onDragStart,
  onDragEnd,
  onCycleDetected,
}: UseDragAndDropProps): UseDragAndDropReturn => {
  
  const [dragState, setDragState] = useState<DragState>(initialDragState);

  // Determine if a drop operation is valid
  const isValidDropTarget = useCallback((sourceId: string, targetId: string): boolean => {
    if (sourceId === targetId) return false;
    
    const sourceEmployee = employees.find(emp => emp.id === sourceId);
    const targetEmployee = employees.find(emp => emp.id === targetId);
    
    if (!sourceEmployee || !targetEmployee) return false;

    // Can't make someone their own subordinate
    if (sourceEmployee.managerId === targetId) return false;

    // Build hierarchy and check if the reassignment would create a cycle
    const hierarchy = buildOrgHierarchy(employees);
    const wouldCreateCycle = detectCycle(sourceId, targetId, hierarchy);
    if (wouldCreateCycle) return false;

    // Additional validation: interns can be reassigned anywhere
    if (sourceEmployee.tier === 'intern') return true;
    
    // Simple tier-based validation for others
    return true;
  }, [employees]);

  // Get all valid drop targets for a given employee
  const getValidDropTargets = useCallback((employeeId: string): string[] => {
    return employees
      .filter(emp => emp.id !== employeeId)
      .filter(emp => isValidDropTarget(employeeId, emp.id))
      .map(emp => emp.id);
  }, [employees, isValidDropTarget]);

  // Handle drag start
  const handleDragStart = useCallback((employeeId: string) => {
    const validTargets = getValidDropTargets(employeeId);
    
    setDragState({
      isDragging: true,
      draggedEmployeeId: employeeId,
      validDropTargets: validTargets,
      hoveredTargetId: null,
      isValidDrop: false,
    });

    onDragStart?.(employeeId);
  }, [getValidDropTargets, onDragStart]);

  // Handle drag over a potential target
  const handleDragOver = useCallback((targetEmployeeId: string) => {
    if (!dragState.isDragging || !dragState.draggedEmployeeId) return;

    const isValid = isValidDropTarget(dragState.draggedEmployeeId, targetEmployeeId);
    
    setDragState(prev => ({
      ...prev,
      hoveredTargetId: targetEmployeeId,
      isValidDrop: isValid,
    }));
  }, [dragState.isDragging, dragState.draggedEmployeeId, isValidDropTarget]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      hoveredTargetId: null,
      isValidDrop: false,
    }));
  }, []);

  // Handle drop operation
  const handleDrop = useCallback(async (targetEmployeeId: string): Promise<boolean> => {
    if (!dragState.isDragging || !dragState.draggedEmployeeId) {
      return false;
    }

    const sourceId = dragState.draggedEmployeeId;
    
    // Validate the drop operation
    if (!isValidDropTarget(sourceId, targetEmployeeId)) {
      // Check if it would create a cycle and notify
      const hierarchy = buildOrgHierarchy(employees);
      const wouldCreateCycle = detectCycle(sourceId, targetEmployeeId, hierarchy);
      if (wouldCreateCycle) {
        onCycleDetected?.([sourceId, targetEmployeeId]);
      }
      return false;
    }

    try {
      // Update the employee's manager via API
      const updateRequest: EmployeeUpdateRequest = {
        managerId: targetEmployeeId,
      };

      // Call the API update operation
      const updatedEmployee = await employeeApi.updateEmployee(sourceId, updateRequest);
      
      if (onEmployeeUpdate) {
        // Update local state with the returned employee data
        const updatedEmployees = employees.map(emp =>
          emp.id === sourceId ? updatedEmployee : emp
        );
        onEmployeeUpdate(updatedEmployees);
      }

      onDragEnd?.(true, sourceId, targetEmployeeId);
      return true;

    } catch (error) {
      console.error('Error during drag and drop operation:', error);
      onDragEnd?.(false, sourceId, targetEmployeeId);
      return false;
    }
  }, [
    dragState.isDragging, 
    dragState.draggedEmployeeId, 
    isValidDropTarget, 
    employees, 
    onEmployeeUpdate, 
    onDragEnd, 
    onCycleDetected
  ]);

  // Handle drag end (cleanup)
  const handleDragEnd = useCallback(() => {
    setDragState(initialDragState);
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    isValidDropTarget,
    getValidDropTargets,
  };
};