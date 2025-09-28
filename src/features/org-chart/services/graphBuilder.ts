// Graph builder for React Flow with new tree layout and node/edge factories
import { MarkerType, Position } from 'reactflow';
import type { Edge, Node } from 'reactflow';
import type { Employee } from '../state/employee';
import type { OrgHierarchy } from '../state/orgHierarchy';
import type { OrgChartNodeData } from '../components/OrgChartNode';

const NODE_WIDTH = 280;
const NODE_HEIGHT = 160;
const HORIZONTAL_SPACING = 80;
const VERTICAL_SPACING = 160;
const MARGIN_X = 48;
const MARGIN_Y = 48;

const EDGE_STYLE = {
  stroke: '#94A3B8',
  strokeWidth: 2,
};

export type OrgChartNode = Node<OrgChartNodeData>;

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
  width: number;
  height: number;
}

interface LayoutRange {
  left: number;
  right: number;
}

const ensureChildrenMap = (employees: Employee[], hierarchy: OrgHierarchy): Map<string, string[]> => {
  const map = new Map<string, string[]>();

  employees.forEach((employee) => {
    map.set(employee.id, []);
  });

  Object.entries(hierarchy.children).forEach(([parentId, childIds]) => {
    const existing = map.get(parentId) ?? [];
    map.set(parentId, [...existing, ...childIds]);
  });

  return map;
};

const resolveRoots = (employees: Employee[], hierarchy: OrgHierarchy): string[] => {
  if (hierarchy.roots.length > 0) {
    return hierarchy.roots;
  }

  return employees
    .filter((employee) => employee.managerId === null)
    .map((employee) => employee.id);
};

const computeTreeLayout = (employees: Employee[], hierarchy: OrgHierarchy): LayoutResult => {
  const childrenMap = ensureChildrenMap(employees, hierarchy);
  const roots = resolveRoots(employees, hierarchy);
  const visited = new Set<string>();
  const positions = new Map<string, { x: number; y: number }>();

  const slotWidth = NODE_WIDTH + HORIZONTAL_SPACING;
  const levelHeight = NODE_HEIGHT + VERTICAL_SPACING;

  let nextLeafIndex = 0;
  let minCenter = Number.POSITIVE_INFINITY;
  let maxCenter = Number.NEGATIVE_INFINITY;
  let maxDepth = 0;

  const assignNode = (nodeId: string, depth: number): LayoutRange => {
    if (visited.has(nodeId)) {
      const center = MARGIN_X + NODE_WIDTH / 2 + slotWidth * nextLeafIndex;
      const x = center - NODE_WIDTH / 2;
      const y = MARGIN_Y + depth * levelHeight;

      positions.set(nodeId, { x, y });
      nextLeafIndex += 1;
      minCenter = Math.min(minCenter, center);
      maxCenter = Math.max(maxCenter, center);
      maxDepth = Math.max(maxDepth, depth);

      return { left: center, right: center };
    }

    visited.add(nodeId);
    maxDepth = Math.max(maxDepth, depth);

    const childIds = childrenMap.get(nodeId) ?? [];

    if (childIds.length === 0) {
      const center = MARGIN_X + NODE_WIDTH / 2 + slotWidth * nextLeafIndex;
      const x = center - NODE_WIDTH / 2;
      const y = MARGIN_Y + depth * levelHeight;

      positions.set(nodeId, { x, y });
      nextLeafIndex += 1;
      minCenter = Math.min(minCenter, center);
      maxCenter = Math.max(maxCenter, center);

      return { left: center, right: center };
    }

    let leftBoundary = Number.POSITIVE_INFINITY;
    let rightBoundary = Number.NEGATIVE_INFINITY;

    childIds.forEach((childId) => {
      const range = assignNode(childId, depth + 1);
      leftBoundary = Math.min(leftBoundary, range.left);
      rightBoundary = Math.max(rightBoundary, range.right);
    });

    if (!Number.isFinite(leftBoundary) || !Number.isFinite(rightBoundary)) {
      const center = MARGIN_X + NODE_WIDTH / 2 + slotWidth * nextLeafIndex;
      const x = center - NODE_WIDTH / 2;
      const y = MARGIN_Y + depth * levelHeight;

      positions.set(nodeId, { x, y });
      nextLeafIndex += 1;
      minCenter = Math.min(minCenter, center);
      maxCenter = Math.max(maxCenter, center);

      return { left: center, right: center };
    }

    const center = (leftBoundary + rightBoundary) / 2;
    const x = center - NODE_WIDTH / 2;
    const y = MARGIN_Y + depth * levelHeight;

    positions.set(nodeId, { x, y });
    minCenter = Math.min(minCenter, leftBoundary, center);
    maxCenter = Math.max(maxCenter, rightBoundary, center);

    return { left: leftBoundary, right: rightBoundary };
  };

  roots.forEach((rootId, index) => {
    assignNode(rootId, 0);
    if (index < roots.length - 1) {
      nextLeafIndex += 1; // Spacer between root clusters
    }
  });

  if (!Number.isFinite(minCenter) || !Number.isFinite(maxCenter)) {
    minCenter = MARGIN_X + NODE_WIDTH / 2;
    maxCenter = minCenter + slotWidth;
  }

  const totalWidth = (maxCenter - minCenter) + NODE_WIDTH + MARGIN_X * 2;
  const totalHeight = MARGIN_Y * 2 + (maxDepth + 1) * NODE_HEIGHT + maxDepth * VERTICAL_SPACING;

  return {
    positions,
    width: totalWidth,
    height: totalHeight,
  };
};

export interface DragCallbacks {
  enableDragAndDrop?: boolean;
}

export interface BuildOrgChartParams {
  employees: Employee[];
  hierarchy: OrgHierarchy;
  highlightedEmployeeIds?: string[];
  selectedEmployeeId?: string | null;
  branchMemberIds?: Set<string>;
  onSelectEmployee?: (employeeId: string) => void;
  onDeleteBranch?: (employeeId: string) => void;
  dragCallbacks?: DragCallbacks;
}

export interface BuildOrgChartResult {
  nodes: OrgChartNode[];
  edges: Edge[];
  size: { width: number; height: number };
}

const buildEdgesFromHierarchy = (hierarchy: OrgHierarchy): Edge[] => {
  const edges: Edge[] = [];

  Object.entries(hierarchy.children).forEach(([parentId, childIds]) => {
    childIds.forEach((childId) => {
      edges.push({
        id: `edge-${parentId}-${childId}`,
        source: parentId,
        target: childId,
        type: 'smoothstep',
        animated: false,
        style: EDGE_STYLE,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: EDGE_STYLE.stroke,
          width: 18,
          height: 18,
        },
      });
    });
  });

  return edges;
};

export const buildOrgChart = (params: BuildOrgChartParams): BuildOrgChartResult => {
  const {
    employees,
    hierarchy,
    highlightedEmployeeIds = [],
    selectedEmployeeId = null,
    branchMemberIds = new Set<string>(),
    onSelectEmployee,
    onDeleteBranch,
    dragCallbacks,
  } = params;

  if (!employees.length) {
    return { nodes: [], edges: [], size: { width: 0, height: 0 } };
  }

  const highlightSet = new Set(highlightedEmployeeIds);
  const branchSet = branchMemberIds;

  const { positions, width, height } = computeTreeLayout(employees, hierarchy);
  const edges = buildEdgesFromHierarchy(hierarchy);

  const nodes: OrgChartNode[] = employees.map((employee) => {
    const position = positions.get(employee.id) ?? { x: MARGIN_X, y: MARGIN_Y };

    return {
      id: employee.id,
      type: 'employee',
      position,
      positionAbsolute: position,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      draggable: false,
      selectable: false,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      data: {
        employee,
        isHighlighted: highlightSet.has(employee.id),
        isSelected: selectedEmployeeId === employee.id,
        isBranchMember: branchSet.has(employee.id),
        onSelect: onSelectEmployee,
        onDeleteBranch,
        enableDragAndDrop: dragCallbacks?.enableDragAndDrop ?? false,
      },
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        padding: 0,
        background: 'transparent',
        border: 'none',
      },
    };
  });

  return {
    nodes,
    edges,
    size: {
      width,
      height,
    },
  };
};