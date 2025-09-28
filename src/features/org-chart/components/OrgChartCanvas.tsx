import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type ReactFlowInstance,
} from 'reactflow';
import type { Employee } from '../state/employee';
import type { OrgHierarchy } from '../state/orgHierarchy';
import { buildOrgHierarchy, getDescendants } from '../state/orgHierarchy';
import { buildOrgChart, type OrgChartNode, type DragCallbacks } from '../services/graphBuilder';
import OrgChartNodeComponent from './OrgChartNode';
import type { UseDragAndDropReturn } from '../hooks/useDragAndDrop';

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
  dragAndDrop?: UseDragAndDropReturn;
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
  dragAndDrop,
  showMiniMap = true,
  showControls = true,
  showBackground = true,
  allowInteraction = true,
}: OrgChartCanvasProps) {
  const [nodes, setNodes] = useState<OrgChartNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [shouldRefit, setShouldRefit] = useState(false);

  const effectiveHierarchy = useMemo(
    () => hierarchy ?? buildOrgHierarchy(employees),
    [employees, hierarchy],
  );

  const layoutKey = useMemo(() => {
    if (!employees.length) {
      return 'empty';
    }

    const serializedIds = employees.map(emp => emp.id).join('-');
    const serializedHierarchy = Object.entries(effectiveHierarchy.children)
      .map(([parentId, childIds]) => `${parentId}:${childIds.join(',')}`)
      .join('|');

    return `${serializedIds}|${serializedHierarchy}`;
  }, [employees, effectiveHierarchy]);

  const branchMemberIds = useMemo(() => {
    if (!selectedEmployeeId) {
      return new Set<string>();
    }

    const descendants = getDescendants(selectedEmployeeId, effectiveHierarchy);
    return new Set<string>([selectedEmployeeId, ...descendants]);
  }, [selectedEmployeeId, effectiveHierarchy]);

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep' as const,
      animated: false,
      style: { stroke: '#94A3B8', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94A3B8',
        width: 18,
        height: 18,
      },
    }),
    [],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((currentNodes) => applyNodeChanges(changes, currentNodes)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges)),
    [],
  );

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((currentEdges) => addEdge({ ...defaultEdgeOptions, ...connection }, currentEdges)),
    [defaultEdgeOptions],
  );

  useEffect(() => {
    setShouldRefit(true);
  }, [layoutKey]);

  useEffect(() => {
    if (!reactFlowInstance) {
      return;
    }

    setShouldRefit(true);
  }, [reactFlowInstance]);

  useEffect(() => {
    if (!reactFlowInstance || !shouldRefit || nodes.length === 0) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      reactFlowInstance.fitView({ padding: 0.25, duration: 300 });
      setShouldRefit(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [reactFlowInstance, shouldRefit, nodes.length]);

  const dragCallbacks = useMemo<DragCallbacks | undefined>(() => {
    if (!dragAndDrop) {
      return undefined;
    }

    return {
      onDragStart: dragAndDrop.handleDragStart,
      onDragOver: dragAndDrop.handleDragOver,
      onDragLeave: dragAndDrop.handleDragLeave,
      onDrop: dragAndDrop.handleDrop,
      onDragEnd: dragAndDrop.handleDragEnd,
    };
  }, [dragAndDrop]);

  const chart = useMemo(() => {
    if (!employees.length) {
      return { nodes: [], edges: [], size: { width: 0, height: 0 } };
    }

    return buildOrgChart({
      employees,
      hierarchy: effectiveHierarchy,
      highlightedEmployeeIds,
      selectedEmployeeId,
      branchMemberIds,
      onSelectEmployee,
      onDeleteBranch,
      dragCallbacks,
    });
  }, [
    employees,
    effectiveHierarchy,
    highlightedEmployeeIds,
    selectedEmployeeId,
    branchMemberIds,
    onSelectEmployee,
    onDeleteBranch,
    dragCallbacks,
  ]);

  useEffect(() => {
    setNodes(chart.nodes);
    setEdges(chart.edges);
  }, [chart]);

  const dragState = dragAndDrop?.dragState;

  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          dragState,
        },
      })),
    );
  }, [dragState]);

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
        key={layoutKey}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        onInit={setReactFlowInstance}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll={allowInteraction}
        selectionOnDrag={false}
        zoomOnScroll={allowInteraction}
        zoomOnPinch={allowInteraction}
  panOnDrag={false}
      >
        {showBackground && <Background gap={24} size={1.5} />}
        {showControls && <Controls showZoom={allowInteraction} showInteractive={false} />}
        {showMiniMap && (
          <MiniMap
            nodeStrokeColor={(node) => (node.data?.isHighlighted ? '#fb923c' : '#1f2937')}
            nodeColor={(node) => (node.data?.isHighlighted ? '#fde68a' : '#cbd5f5')}
            maskColor="rgba(15, 23, 42, 0.12)"
          />
        )}
      </ReactFlow>
    </div>
  );
}