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
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { Employee } from '../state/employee';
import type { OrgHierarchy } from '../state/orgHierarchy';
import { buildOrgHierarchy, getDescendants } from '../state/orgHierarchy';
import { buildOrgChart, type OrgChartNode, type DragCallbacks } from '../services/graphBuilder';
import OrgChartNodeComponent, { type OrgChartNodeData } from './OrgChartNode';
import type { UseDragAndDropReturn } from '../hooks/useDragAndDrop';
import { UndoAlert } from './UndoAlert';

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
  onClearSelection?: () => void;
  onDeleteBranch?: (employeeId: string) => void;
  onRestoreFromUndo?: () => void;
  dragAndDrop?: UseDragAndDropReturn;
  showMiniMap?: boolean;
  showControls?: boolean;
  showBackground?: boolean;
  allowInteraction?: boolean;
  theme?: 'light' | 'dark';
}

export default function OrgChartCanvas({
  employees,
  hierarchy,
  highlightedEmployeeIds = [],
  selectedEmployeeId = null,
  onSelectEmployee,
  onClearSelection,
  onDeleteBranch,
  onRestoreFromUndo,
  dragAndDrop,
  showMiniMap = true,
  showControls = true,
  showBackground = true,
  allowInteraction = true,
  theme = 'light',
}: OrgChartCanvasProps) {
  const isDarkMode = theme === 'dark';
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
    () => {
      const stroke = isDarkMode ? '#64748b' : '#94A3B8';
      return {
        type: 'smoothstep' as const,
        animated: false,
        style: { stroke, strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: stroke,
          width: 18,
          height: 18,
        },
      };
    },
    [isDarkMode],
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
      enableDragAndDrop: true,
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
      theme,
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
    theme,
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
          enableDragAndDrop: Boolean(dragAndDrop),
        },
      })),
    );
  }, [dragState, dragAndDrop]);

  if (!employees.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={dragAndDrop?.handleDragStart}
        onDragOver={dragAndDrop?.handleDragOver}
        onDragEnd={dragAndDrop?.handleDragEnd}
      >
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
          elementsSelectable={false}
          selectNodesOnDrag={false}
          onPaneClick={() => {
            if (!allowInteraction) return;
            onClearSelection?.();
          }}
        >
          {showBackground && (
            <Background
              gap={24}
              size={1.5}
              color={isDarkMode ? '#1f2937' : '#dbeafe'}
            />
          )}
          {showControls && <Controls showZoom={allowInteraction} showInteractive={false} />}
          {showMiniMap && (
            <MiniMap
              nodeStrokeColor={(node) => {
                const data = node.data as OrgChartNodeData | undefined;
                if (data?.isHighlighted || data?.isSelected) {
                  return '#fb923c';
                }
                if (data?.isBranchMember) {
                  return '#facc15';
                }
                return isDarkMode ? '#e2e8f0' : '#1f2937';
              }}
              nodeColor={(node) => {
                const data = node.data as OrgChartNodeData | undefined;
                if (data?.isHighlighted || data?.isSelected) {
                  return isDarkMode ? '#f97316' : '#fde68a';
                }
                if (data?.isBranchMember) {
                  return isDarkMode ? '#facc15' : '#fef08a';
                }
                return isDarkMode ? '#334155' : '#cbd5f5';
              }}
              maskColor={isDarkMode ? 'rgba(2, 6, 23, 0.55)' : 'rgba(15, 23, 42, 0.12)'}
            />
          )}
        </ReactFlow>
      </DndContext>
      
      {/* Undo Alert */}
      <UndoAlert onUndo={onRestoreFromUndo || (() => {})} />
    </div>
  );
}