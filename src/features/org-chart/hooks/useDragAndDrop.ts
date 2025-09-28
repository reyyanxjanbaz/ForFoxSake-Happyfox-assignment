// Modern drag and drop hook using @dnd-kit for employee reassignment

import { useCallback, useState } from 'react';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import type { Employee } from '../state/employee';
import { detectCycle, buildOrgHierarchy } from '../state/orgHierarchy';
import { employeeApi, type EmployeeUpdateRequest } from '../services/api';

export interface DragState {
  isDragging: boolean;
  draggedEmployeeId: string | null;
  hoveredTargetId: string | null;
  validDropTargets: string[];
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
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
  isValidDropTarget: (sourceId: string, targetId: string) => boolean;
  getValidDropTargets: (employeeId: string) => string[];
}

const initialDragState: DragState = {
  isDragging: false,
  draggedEmployeeId: null,
  hoveredTargetId: null,
  validDropTargets: [],
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

    // Can't make someone their own subordinate (already same manager)
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

  // Handle drag start with @dnd-kit
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const employeeId = event.active.id as string;
    const validTargets = getValidDropTargets(employeeId);
    
    setDragState({
      isDragging: true,
      draggedEmployeeId: employeeId,
      hoveredTargetId: null,
      validDropTargets: validTargets,
    });

    console.log(`🚀 Drag started for employee: ${employeeId}`);
    console.log(`✅ Valid drop targets: ${validTargets.length} employees`);
    onDragStart?.(employeeId);
  }, [getValidDropTargets, onDragStart]);

  // Handle drag over with @dnd-kit
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over || !dragState.isDragging) return;

    const targetId = over.id as string;
    const sourceId = active.id as string;
    
    setDragState(prev => ({
      ...prev,
      hoveredTargetId: targetId,
    }));

    console.log(`🎯 Dragging ${sourceId} over ${targetId}`);
  }, [dragState.isDragging]);

  // Handle drag end with @dnd-kit
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset drag state first
    setDragState(initialDragState);
    
    if (!over) {
      console.log('❌ Drag ended without drop target');
      onDragEnd?.(false);
      return;
    }

    const sourceId = active.id as string;
    const targetId = over.id as string;
    
    console.log(`🎯 Attempting to drop ${sourceId} on ${targetId}`);
    
    // Validate the drop operation
    if (!isValidDropTarget(sourceId, targetId)) {
      console.log('❌ Invalid drop target');
      
      // Check if it would create a cycle and notify
      const hierarchy = buildOrgHierarchy(employees);
      const wouldCreateCycle = detectCycle(sourceId, targetId, hierarchy);
      if (wouldCreateCycle) {
        onCycleDetected?.([sourceId, targetId]);
      }
      
      onDragEnd?.(false, sourceId, targetId);
      return;
    }

    try {
      console.log('🔄 Updating employee manager...');
      
      // Update the employee's manager via API
      const updateRequest: EmployeeUpdateRequest = {
        managerId: targetId,
      };

      const updatedEmployee = await employeeApi.updateEmployee(sourceId, updateRequest);
      
      if (onEmployeeUpdate) {
        const updatedEmployees = employees.map(emp =>
          emp.id === sourceId ? updatedEmployee : emp
        );
        onEmployeeUpdate(updatedEmployees);
      }

      console.log('✅ Employee successfully reassigned!');
      onDragEnd?.(true, sourceId, targetId);

    } catch (error) {
      console.error('❌ Error during drag and drop operation:', error);
      onDragEnd?.(false, sourceId, targetId);
    }
  }, [employees, isValidDropTarget, onEmployeeUpdate, onDragEnd, onCycleDetected]);

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    isValidDropTarget,
    getValidDropTargets,
  };
};