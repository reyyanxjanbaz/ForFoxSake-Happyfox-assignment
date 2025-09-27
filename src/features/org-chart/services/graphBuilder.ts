// Graph builder for React Flow using @dagrejs/dagre for hierarchical layout

import * as dagre from '@dagrejs/dagre';
import type { Node, Edge, Position, MarkerType } from 'reactflow';
import type { Employee } from '../state/employee';
import type { EmployeeCollection } from '../services/api';

// React Flow node types
export interface OrgChartNode extends Node {
  id: string;
  type: 'employee';
  position: { x: number; y: number };
  data: {
    employee: Employee;
    isHighlighted: boolean;
    tier: Employee['tier'];
    isSelected?: boolean;
    onSelect?: (employeeId: string) => void;
    onDeleteBranch?: (employeeId: string) => void;
    isBranchMember?: boolean;
  };
  sourcePosition?: Position;
  targetPosition?: Position;
}

// Layout configuration
const LAYOUT_CONFIG = {
  nodeWidth: 280,
  nodeHeight: 120,
  rankSeparation: 100, // Vertical spacing between tiers
  nodeSeparation: 40,  // Horizontal spacing between nodes
  edgeSeparation: 20,  // Spacing between edges
  marginX: 50,
  marginY: 50,
};

// Tier-based styling configuration
const TIER_STYLES: Record<Employee['tier'], { color: string; borderColor: string; level: number }> = {
  'executive': { color: '#FFF7ED', borderColor: '#FB923C', level: 0 },
  'lead': { color: '#FFF7ED', borderColor: '#FB923C', level: 1 },
  'manager': { color: '#FFFFFF', borderColor: '#D1D5DB', level: 2 },
  'individual': { color: '#FFFFFF', borderColor: '#D1D5DB', level: 3 },
  'intern': { color: '#F9FAFB', borderColor: '#D1D5DB', level: 4 },
};

// Create dagre graph instance
const createDagreGraph = () => {
  const graph = new dagre.graphlib.Graph();
  
  // Configure graph
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: 'TB', // Top-to-bottom direction
    align: 'UL',   // Upper-left alignment
    nodesep: LAYOUT_CONFIG.nodeSeparation,
    ranksep: LAYOUT_CONFIG.rankSeparation,
    marginx: LAYOUT_CONFIG.marginX,
    marginy: LAYOUT_CONFIG.marginY,
  });

  return graph;
};

// Build React Flow nodes from employee data
export const buildNodes = (employees: Employee[]): OrgChartNode[] => {
  return employees.map((employee) => {
    const tierStyle = TIER_STYLES[employee.tier];
    
    const node: OrgChartNode = {
      id: employee.id,
      type: 'employee',
      position: { x: 0, y: 0 }, // Will be calculated by dagre
      data: {
        employee,
        isHighlighted: employee.highlightState.active,
        tier: employee.tier,
        isSelected: false,
        isBranchMember: false,
      },
      sourcePosition: 'bottom' as Position,
      targetPosition: 'top' as Position,
      style: {
        width: LAYOUT_CONFIG.nodeWidth,
        height: LAYOUT_CONFIG.nodeHeight,
        backgroundColor: tierStyle.color,
        border: `2px solid ${tierStyle.borderColor}`,
        borderRadius: '12px',
        padding: '16px',
        boxShadow: employee.highlightState.active 
          ? '0 0 20px rgba(251, 146, 60, 0.6)' 
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      },
    };

    return node;
  });
};

// Build React Flow edges from hierarchy relationships
export const buildEdges = (hierarchy: EmployeeCollection['hierarchy']): Edge[] => {
  const edges: Edge[] = [];

  // Create edges from parent to children
  Object.entries(hierarchy.children).forEach(([parentId, childIds]) => {
    childIds.forEach((childId) => {
      edges.push({
        id: `edge-${parentId}-${childId}`,
        source: parentId,
        target: childId,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: '#94A3B8',
          strokeWidth: 2,
        },
        markerEnd: {
          type: 'arrow' as MarkerType,
          color: '#94A3B8',
          width: 20,
          height: 20,
        },
      });
    });
  });

  return edges;
};

// Apply dagre layout to nodes
export const applyDagreLayout = (
  nodes: OrgChartNode[], 
  edges: Edge[]
): { nodes: OrgChartNode[]; edges: Edge[] } => {
  const graph = createDagreGraph();

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: LAYOUT_CONFIG.nodeWidth,
      height: LAYOUT_CONFIG.nodeHeight,
    });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(graph);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = graph.node(node.id);
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - LAYOUT_CONFIG.nodeWidth / 2,
        y: nodeWithPosition.y - LAYOUT_CONFIG.nodeHeight / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
  };
};

// Main function to build complete graph from employee data
export const buildOrgChart = (employeeData: EmployeeCollection): {
  nodes: OrgChartNode[];
  edges: Edge[];
  bounds: { width: number; height: number };
} => {
  // Build initial nodes and edges
  const nodes = buildNodes(employeeData.data);
  const edges = buildEdges(employeeData.hierarchy);
  
  // Apply dagre layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = applyDagreLayout(nodes, edges);
  
  // Calculate bounding box for the entire graph
  const bounds = calculateGraphBounds(layoutedNodes);
  
  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
    bounds,
  };
};

// Calculate graph bounding box
export const calculateGraphBounds = (nodes: OrgChartNode[]): { width: number; height: number } => {
  if (nodes.length === 0) {
    return { width: 800, height: 600 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + LAYOUT_CONFIG.nodeWidth);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + LAYOUT_CONFIG.nodeHeight);
  });

  return {
    width: maxX - minX + LAYOUT_CONFIG.marginX * 2,
    height: maxY - minY + LAYOUT_CONFIG.marginY * 2,
  };
};

// Update node highlights based on filter results
export const updateNodeHighlights = (
  nodes: OrgChartNode[], 
  highlightedEmployeeIds: string[],
  selectedEmployeeId: string | null,
  branchMemberIds: Set<string>
): OrgChartNode[] => {
  const highlightSet = new Set(highlightedEmployeeIds);
  
  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      isHighlighted: highlightSet.has(node.id),
      isSelected: selectedEmployeeId === node.id,
      isBranchMember: branchMemberIds.has(node.id),
    },
    style: {
      ...node.style,
      boxShadow: highlightSet.has(node.id)
        ? '0 0 20px rgba(251, 146, 60, 0.6)'
        : '0 4px 6px rgba(0, 0, 0, 0.1)',
      transform: highlightSet.has(node.id) || selectedEmployeeId === node.id ? 'scale(1.02)' : 'scale(1)',
      borderColor: selectedEmployeeId === node.id
        ? '#EA580C'
        : branchMemberIds.has(node.id)
          ? '#FED7AA'
          : node.style?.borderColor,
    },
  }));
};

// Find node by employee ID
export const findNodeByEmployeeId = (
  nodes: OrgChartNode[], 
  employeeId: string
): OrgChartNode | undefined => {
  return nodes.find(node => node.id === employeeId);
};

// Get nodes by tier
export const getNodesByTier = (
  nodes: OrgChartNode[], 
  tier: Employee['tier']
): OrgChartNode[] => {
  return nodes.filter(node => node.data.tier === tier);
};

// Calculate center position for focusing viewport
export const calculateCenterPosition = (nodes: OrgChartNode[]): { x: number; y: number } => {
  if (nodes.length === 0) {
    return { x: 0, y: 0 };
  }

  const bounds = calculateGraphBounds(nodes);
  return {
    x: bounds.width / 2,
    y: bounds.height / 2,
  };
};

// Re-layout graph after structural changes (add/remove nodes)
export const relayoutGraph = (
  currentNodes: OrgChartNode[], 
  currentEdges: Edge[], 
  employeeData: EmployeeCollection
): {
  nodes: OrgChartNode[];
  edges: Edge[];
  bounds: { width: number; height: number };
} => {
  // Preserve highlight states from current nodes
  const highlightMap = new Map(
    currentNodes.map(node => [node.id, node.data.isHighlighted])
  );
  
  // Build fresh graph
  const { nodes, edges, bounds } = buildOrgChart(employeeData);
  
  // Restore highlight states
  const restoredNodes = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      isHighlighted: highlightMap.get(node.id) || false,
      isSelected: node.data.isSelected,
      isBranchMember: node.data.isBranchMember,
    },
    style: {
      ...node.style,
      boxShadow: highlightMap.get(node.id)
        ? '0 0 20px rgba(251, 146, 60, 0.6)'
        : '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  }));
  
  return {
    nodes: restoredNodes,
    edges,
    bounds,
  };
};