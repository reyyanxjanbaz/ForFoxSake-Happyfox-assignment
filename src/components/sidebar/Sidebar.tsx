// Sidebar tree component with collapsible groups and ARIA tree roles

import React, { useState, useEffect } from 'react';
import { ProfileCard } from '../shared';
import type { Employee } from '../../features/org-chart/state/employee';
import type { EmployeeCollection } from '../../features/org-chart/services/api';

export interface SidebarProps {
  employees?: Employee[];
  hierarchy?: EmployeeCollection['hierarchy'];
  highlightedEmployees?: string[];
  onEmployeeClick?: (employee: Employee) => void;
  onAddEmployee?: () => void;
  selectedEmployeeId?: string | null;
  className?: string;
}

interface TreeNode {
  employee: Employee;
  children: TreeNode[];
  level: number;
  isExpanded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  employees = [],
  hierarchy,
  highlightedEmployees = [],
  onEmployeeClick,
  onAddEmployee,
  selectedEmployeeId = null,
  className = '',
}) => {
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Automatically expand roots and first-level children when hierarchy updates for the first time
  useEffect(() => {
    if (!hierarchy) return;

    setExpandedNodes(prev => {
      if (prev.size > 0) {
        return prev;
      }

      const initial = new Set<string>();
      hierarchy.roots.forEach(rootId => {
        initial.add(rootId);
        const childIds = hierarchy.children[rootId] || [];
        childIds.forEach(childId => initial.add(childId));
      });
      return initial;
    });
  }, [hierarchy]);

  // Ensure highlighted employees and their ancestors are expanded for visibility
  useEffect(() => {
    const idsToExpand = [
      ...highlightedEmployees,
      ...(selectedEmployeeId ? [selectedEmployeeId] : []),
    ];

    if (!hierarchy || idsToExpand.length === 0 || employees.length === 0) {
      return;
    }

    const employeeMap = new Map<string, Employee>(employees.map(emp => [emp.id, emp]));

    setExpandedNodes(prev => {
      const next = new Set(prev);

      idsToExpand.forEach(employeeId => {
        let currentId: string | null | undefined = employeeId;
        while (currentId) {
          next.add(currentId);
          const managerId: string | null | undefined = employeeMap.get(currentId)?.managerId;
          currentId = managerId;
        }
      });

      if (next.size === prev.size && Array.from(next).every(id => prev.has(id))) {
        return prev;
      }

      return next;
    });
  }, [hierarchy, highlightedEmployees, employees, selectedEmployeeId]);

  // Build tree structure from employees and hierarchy
  useEffect(() => {
    if (!employees.length || !hierarchy) {
      setTreeNodes([]);
      return;
    }

    const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
    const builtNodes: TreeNode[] = [];

    const buildNode = (employeeId: string, level: number = 0): TreeNode | null => {
      const employee = employeeMap.get(employeeId);
      if (!employee) return null;

      const childIds = hierarchy.children[employeeId] || [];
      const childNodes = childIds
        .map(childId => buildNode(childId, level + 1))
        .filter((node): node is TreeNode => node !== null);

      return {
        employee,
        children: childNodes,
        level,
        isExpanded: expandedNodes.has(employeeId) || level < 2, // Auto-expand first 2 levels
      };
    };

    // Build tree from root nodes
    hierarchy.roots.forEach(rootId => {
      const rootNode = buildNode(rootId);
      if (rootNode) {
        builtNodes.push(rootNode);
      }
    });

    setTreeNodes(builtNodes);
  }, [employees, hierarchy, expandedNodes]);

  const toggleNodeExpansion = (employeeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent, employeeId: string, hasChildren: boolean) => {
    switch (event.key) {
      case 'ArrowRight':
        if (hasChildren && !expandedNodes.has(employeeId)) {
          event.preventDefault();
          toggleNodeExpansion(employeeId);
        }
        break;
      case 'ArrowLeft':
        if (hasChildren && expandedNodes.has(employeeId)) {
          event.preventDefault();
          toggleNodeExpansion(employeeId);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (hasChildren) {
          toggleNodeExpansion(employeeId);
        } else if (onEmployeeClick) {
          const employee = employees.find(emp => emp.id === employeeId);
          if (employee) {
            onEmployeeClick(employee);
          }
        }
        break;
    }
  };

  const renderTreeNode = (node: TreeNode): React.ReactElement => {
    const { employee, children, level } = node;
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(employee.id) || (expandedNodes.size === 0 && level < 2);
  const isHighlighted = highlightedEmployees.includes(employee.id) || employee.id === selectedEmployeeId;

    const nodeStyle: React.CSSProperties = {
      marginLeft: `${level * 16}px`,
      marginBottom: 'var(--space-1)',
    };

    const expanderStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: 'var(--space-1)',
      cursor: hasChildren ? 'pointer' : 'default',
      borderRadius: 'var(--radius-md)',
      transition: 'background-color var(--duration-fast) ease',
    };

    const expanderButtonStyle: React.CSSProperties = {
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: hasChildren ? 'var(--color-text-secondary)' : 'transparent',
      fontSize: '0.75rem',
      transition: 'transform var(--duration-fast) ease',
      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
    };

    return (
      <li
        key={employee.id}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-level={level + 1}
        aria-setsize={children.length}
        tabIndex={0}
        style={nodeStyle}
        onKeyDown={(e) => handleKeyDown(e, employee.id, hasChildren)}
      >
        <div style={expanderStyle}>
          {/* Expander button */}
          <button
            style={expanderButtonStyle}
            onClick={() => hasChildren && toggleNodeExpansion(employee.id)}
            aria-label={
              hasChildren
                ? `${isExpanded ? 'Collapse' : 'Expand'} ${employee.name}'s team`
                : undefined
            }
            tabIndex={-1} // Let parent handle focus
          >
            {hasChildren ? '▶' : ''}
          </button>

          {/* Profile Card */}
          <div style={{ flex: 1 }}>
            <ProfileCard
              employee={employee}
              isHighlighted={isHighlighted}
              size="small"
              showRole={true}
              showTeam={false}
              onClick={onEmployeeClick}
            />
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <ul
            role="group"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              marginTop: 'var(--space-1)',
            }}
          >
            {children.map(renderTreeNode)}
          </ul>
        )}
      </li>
    );
  };

  const sidebarStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    padding: 'var(--space-4)',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-white)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    margin: 0,
    marginBottom: 'var(--space-2)',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    margin: 0,
  };

  const treeContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: 'var(--space-3)',
  };

  const treeStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const emptyStateStyle: React.CSSProperties = {
    padding: 'var(--space-8)',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: '0.875rem',
  };

  return (
    <div className={`sidebar ${className}`} style={sidebarStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>Organization</h2>
        <p style={subtitleStyle}>
          {employees.length} employee{employees.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tree */}
      <div style={treeContainerStyle}>
        {treeNodes.length > 0 ? (
          <ul
            role="tree"
            aria-label="Organization hierarchy"
            style={treeStyle}
          >
            {treeNodes.map(renderTreeNode)}
          </ul>
        ) : (
          <div style={emptyStateStyle}>
            <p>No employees found</p>
            <p style={{ fontSize: '0.75rem', marginTop: 'var(--space-2)' }}>
              Loading organization data...
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: 'var(--space-4)',
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-white)',
      }}>
        <button
          style={{
            width: '100%',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color var(--duration-fast) ease',
          }}
          onClick={onAddEmployee}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
          }}
        >
          + Add Employee
        </button>
        
        <button
          style={{
            width: '100%',
            padding: 'var(--space-2)',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            marginTop: 'var(--space-2)',
            transition: 'all var(--duration-fast) ease',
          }}
          onClick={() => {
            // Expand all nodes
            const allIds = new Set(employees.map(emp => emp.id));
            setExpandedNodes(allIds);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Expand All
        </button>
      </div>
    </div>
  );
};

export default Sidebar;