import React, { useMemo, useEffect, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, type Edge } from 'reactflow';
import type { Employee } from '../state/employee';
import type { OrgHierarchy } from '../state/orgHierarchy';
import { buildOrgHierarchy, getDescendants } from '../state/orgHierarchy';
import { buildOrgChart, updateNodeHighlights, type OrgChartNode } from '../services/graphBuilder';
import OrgChartNodeComponent from './OrgChartNode';

import 'reactflow/dist/style.css';

const nodeTypes = {
  employee: OrgChartNodeComponent,
};

interface OrgChartCanvasProps {
  employees: Employee[];
  hierarchy?: OrgHierarchy | null;
  highlightedEmployeeIds?: string[];
  selectedEmployeeId?: string | null;
  onSelectEmployee?: (employeeId: string) => void;
  onDeleteBranch?: (employeeId: string) => void;
  showMiniMap?: boolean;
  showControls?: boolean;
  showBackground?: boolean;
  allowInteraction?: boolean;
}

export default function OrgChartCanvas({
  employees,
  hierarchy,
  highlightedEmployeeIds = [],
  selectedEmployeeId = null,
  onSelectEmployee,
  onDeleteBranch,
  showMiniMap = true,
  showControls = true,
  showBackground = true,
  allowInteraction = true,
}: OrgChartCanvasProps) {
  const [nodes, setNodes] = useState<OrgChartNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const employeeCollection = useMemo(() => {
    const computedHierarchy = hierarchy ?? buildOrgHierarchy(employees);
    return {
      data: employees,
      hierarchy: computedHierarchy,
    };
  }, [employees, hierarchy]);

  const branchMemberIds = useMemo(() => {
    if (!selectedEmployeeId) {
      return new Set<string>();
    }

    const descendants = getDescendants(selectedEmployeeId, employeeCollection.hierarchy);
    return new Set<string>([selectedEmployeeId, ...descendants]);
  }, [selectedEmployeeId, employeeCollection]);

  useEffect(() => {
    if (!employees.length) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } = buildOrgChart(employeeCollection);

    const preparedNodes = layoutedNodes.map((node) => ({
      ...node,
      draggable: false,
      selectable: false,
      data: {
        ...node.data,
        onSelect: onSelectEmployee,
        onDeleteBranch,
        isSelected: selectedEmployeeId === node.id,
        isHighlighted: highlightedEmployeeIds.includes(node.id),
        isBranchMember: branchMemberIds.has(node.id),
      },
    }));

    setNodes(preparedNodes);
    setEdges(layoutedEdges);
  }, [employees, employeeCollection, onSelectEmployee, onDeleteBranch, selectedEmployeeId, highlightedEmployeeIds, branchMemberIds]);

  useEffect(() => {
    if (!nodes.length) return;
    setNodes((currentNodes) => updateNodeHighlights(
      currentNodes,
      highlightedEmployeeIds,
      selectedEmployeeId,
      branchMemberIds
    ));
  }, [highlightedEmployeeIds, selectedEmployeeId, branchMemberIds, nodes.length]);

  if (!employees.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>
        Loading org chart...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll
        selectionOnDrag={false}
        zoomOnScroll={allowInteraction}
        zoomOnPinch={allowInteraction}
        panOnDrag={allowInteraction}
      >
  {showBackground && <Background gap={24} size={1.5} />}
        {showControls && <Controls showZoom={allowInteraction} showInteractive={false} />}
        {showMiniMap && <MiniMap nodeStrokeColor="#cbd5f5" nodeColor="#f8fafc" maskColor="rgba(15, 23, 42, 0.08)" />}
      </ReactFlow>
    </div>
  );
}