// Org hierarchy utilities for maintaining tree structure and layout coordination

import type { Employee } from './employee';

export interface OrgHierarchy {
  roots: string[];
  children: Record<string, string[]>;
  levels: Record<string, number>;
}

// Build hierarchy structure from employee list
export const buildOrgHierarchy = (employees: Employee[]): OrgHierarchy => {
  const roots: string[] = [];
  const children: Record<string, string[]> = {};
  const levels: Record<string, number> = {};

  // Initialize children map for all employees
  employees.forEach(emp => {
    children[emp.id] = [];
  });

  // Build parent-child relationships and identify roots
  employees.forEach(emp => {
    if (emp.managerId === null) {
      roots.push(emp.id);
      levels[emp.id] = 0;
    } else {
      if (children[emp.managerId]) {
        children[emp.managerId].push(emp.id);
      }
    }
  });

  // Calculate levels using BFS from roots
  const queue = [...roots];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentLevel = levels[currentId] || 0;
    const childIds = children[currentId] || [];

    childIds.forEach(childId => {
      levels[childId] = currentLevel + 1;
      queue.push(childId);
    });
  }

  // Sort children by tier and name for deterministic ordering
  Object.keys(children).forEach(parentId => {
    children[parentId].sort((a, b) => {
      const empA = employees.find(e => e.id === a);
      const empB = employees.find(e => e.id === b);
      if (!empA || !empB) return 0;
      
      // Sort by tier first, then by name
      const tierOrder = { executive: 0, lead: 1, manager: 2, individual: 3, intern: 4 };
      const tierDiff = tierOrder[empA.tier] - tierOrder[empB.tier];
      return tierDiff !== 0 ? tierDiff : empA.name.localeCompare(empB.name);
    });
  });

  return { roots, children, levels };
};

// Detect if reassignment would create a cycle
export const detectCycle = (
  employeeId: string, 
  newManagerId: string, 
  hierarchy: OrgHierarchy
): boolean => {
  if (employeeId === newManagerId) {
    return true; // Employee cannot manage themselves
  }

  // Check if newManagerId is a descendant of employeeId
  const isDescendant = (ancestorId: string, descendantId: string, visited = new Set<string>()): boolean => {
    if (visited.has(descendantId)) return false; // Prevent infinite loops
    visited.add(descendantId);

    const childIds = hierarchy.children[descendantId] || [];
    
    if (childIds.includes(ancestorId)) {
      return true;
    }

    return childIds.some(childId => isDescendant(ancestorId, childId, visited));
  };

  return isDescendant(employeeId, newManagerId);
};

// Update hierarchy after employee reassignment
export const updateHierarchyOnReassignment = (
  hierarchy: OrgHierarchy,
  employeeId: string,
  oldManagerId: string | null,
  newManagerId: string | null
): OrgHierarchy => {
  const newHierarchy: OrgHierarchy = {
    roots: [...hierarchy.roots],
    children: { ...hierarchy.children },
    levels: { ...hierarchy.levels },
  };

  // Remove from old manager's children
  if (oldManagerId && newHierarchy.children[oldManagerId]) {
    newHierarchy.children[oldManagerId] = newHierarchy.children[oldManagerId].filter(
      id => id !== employeeId
    );
  } else {
    // Remove from roots if was a root employee
    newHierarchy.roots = newHierarchy.roots.filter(id => id !== employeeId);
  }

  // Add to new manager's children
  if (newManagerId) {
    if (!newHierarchy.children[newManagerId]) {
      newHierarchy.children[newManagerId] = [];
    }
    newHierarchy.children[newManagerId].push(employeeId);
  } else {
    // Add to roots if new manager is null
    newHierarchy.roots.push(employeeId);
  }

  // Recalculate levels for affected subtree
  const recalculateLevels = (nodeId: string, level: number) => {
    newHierarchy.levels[nodeId] = level;
    const childIds = newHierarchy.children[nodeId] || [];
    childIds.forEach(childId => recalculateLevels(childId, level + 1));
  };

  const newLevel = newManagerId ? (newHierarchy.levels[newManagerId] || 0) + 1 : 0;
  recalculateLevels(employeeId, newLevel);

  return newHierarchy;
};

// Get all descendants of an employee
export const getDescendants = (employeeId: string, hierarchy: OrgHierarchy): string[] => {
  const descendants: string[] = [];
  const queue = [employeeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const childIds = hierarchy.children[currentId] || [];
    
    childIds.forEach(childId => {
      descendants.push(childId);
      queue.push(childId);
    });
  }

  return descendants;
};

// Get path from root to employee
export const getPathToRoot = (employeeId: string, employees: Employee[]): string[] => {
  const path: string[] = [];
  let currentEmployee = employees.find(emp => emp.id === employeeId);

  while (currentEmployee) {
    path.unshift(currentEmployee.id);
    if (currentEmployee.managerId) {
      currentEmployee = employees.find(emp => emp.id === currentEmployee!.managerId);
    } else {
      break;
    }
  }

  return path;
};