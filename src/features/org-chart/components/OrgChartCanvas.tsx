import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
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
  const dragActionsRef = useRef<UseDragAndDropReturn | undefined>();
  const dragContextRef = useRef<{
    sourceId: string;
    pointerId: number;
    startX: number;
    startY: number;
    started: boolean;
    lastTargetId: string | null;
    cleanup?: (success: boolean) => void;
  } | null>(null);

  useEffect(() => {
    dragActionsRef.current = dragAndDrop;
  }, [dragAndDrop]);

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

  const getEmployeeIdFromPoint = useCallback((clientX: number, clientY: number): string | null => {
    if (typeof document === 'undefined') {
      return null;
    }

    const element = document.elementFromPoint(clientX, clientY);
    if (!element || typeof (element as globalThis.Element).closest !== 'function') {
      return null;
    }

    const nodeElement = (element as globalThis.Element).closest('[data-employee-node="true"]');
    if (!nodeElement) {
      return null;
    }

    const employeeId = (nodeElement as HTMLElement).dataset.employeeId;
    return employeeId ?? null;
  }, []);

  const startPointerDrag = useCallback((employeeId: string, event: React.PointerEvent<HTMLDivElement>) => {
    const actions = dragActionsRef.current;
    if (!actions) {
      return;
    }

    if (dragContextRef.current?.cleanup) {
      dragContextRef.current.cleanup(false);
    }

    const activeDrag = {
      sourceId: employeeId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      started: false,
      lastTargetId: null as string | null,
      cleanup: undefined as ((success: boolean) => void) | undefined,
    };

    dragContextRef.current = activeDrag;

    const thresholdSquared = 16; // 4px movement threshold

    const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
      if (!dragContextRef.current || dragContextRef.current !== activeDrag) {
        return;
      }

      if (moveEvent.pointerId !== activeDrag.pointerId) {
        return;
      }

      const deltaX = moveEvent.clientX - activeDrag.startX;
      const deltaY = moveEvent.clientY - activeDrag.startY;

      if (!activeDrag.started) {
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;
        if (distanceSquared < thresholdSquared) {
          return;
        }

        activeDrag.started = true;
        actions.handleDragStart?.(employeeId);
        document.body.classList.add('org-chart--dragging');
        if (typeof window !== 'undefined' && typeof window.getSelection === 'function') {
          const selection = window.getSelection();
          selection?.removeAllRanges?.();
        }
      }

      moveEvent.preventDefault();

      const targetId = getEmployeeIdFromPoint(moveEvent.clientX, moveEvent.clientY);
      if (targetId && targetId !== employeeId) {
        if (targetId !== activeDrag.lastTargetId) {
          if (activeDrag.lastTargetId) {
            actions.handleDragLeave?.();
          }
          actions.handleDragOver?.(targetId);
          activeDrag.lastTargetId = targetId;
        }
      } else if (activeDrag.lastTargetId) {
        actions.handleDragLeave?.();
        activeDrag.lastTargetId = null;
      }
    };

    const finalizeDrag = (_success: boolean) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);

      if (activeDrag.lastTargetId) {
        actions.handleDragLeave?.();
        activeDrag.lastTargetId = null;
      }

      if (activeDrag.started) {
        actions.handleDragEnd?.();
      }

      dragContextRef.current = null;
      activeDrag.cleanup = undefined;
      document.body.classList.remove('org-chart--dragging');
    };

    const handlePointerUp = (upEvent: globalThis.PointerEvent) => {
      if (!dragContextRef.current || dragContextRef.current !== activeDrag) {
        return;
      }

      if (upEvent.pointerId !== activeDrag.pointerId) {
        return;
      }

      if (!activeDrag.started) {
        finalizeDrag(false);
        return;
      }

      upEvent.preventDefault();

      const targetId = getEmployeeIdFromPoint(upEvent.clientX, upEvent.clientY);
      if (targetId && targetId !== employeeId) {
        const dropResult = actions.handleDrop?.(targetId);

        if (dropResult instanceof Promise) {
          dropResult
            .then((success) => finalizeDrag(Boolean(success)))
            .catch(() => finalizeDrag(false));
        } else {
          finalizeDrag(Boolean(dropResult));
        }
      } else {
        finalizeDrag(false);
      }
    };

    const handlePointerCancel = () => {
      if (!dragContextRef.current || dragContextRef.current !== activeDrag) {
        return;
      }
      finalizeDrag(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    activeDrag.cleanup = finalizeDrag;
  }, [getEmployeeIdFromPoint]);

  const dragCallbacks = useMemo<DragCallbacks | undefined>(() => {
    if (!dragAndDrop) {
      return undefined;
    }

    return {
      onDragStart: startPointerDrag,
      onDragOver: dragAndDrop.handleDragOver,
      onDragLeave: dragAndDrop.handleDragLeave,
      onDrop: dragAndDrop.handleDrop,
      onDragEnd: dragAndDrop.handleDragEnd,
    };
  }, [dragAndDrop, startPointerDrag]);

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

  useEffect(() => {
    return () => {
      if (dragContextRef.current?.cleanup) {
        dragContextRef.current.cleanup(false);
      }
    };
  }, []);

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