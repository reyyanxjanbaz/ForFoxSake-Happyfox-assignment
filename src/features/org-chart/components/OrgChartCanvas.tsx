// React Flow org chart canvas with ProfileCard nodes and dagre layout

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MarkerType,
  NodeTypes,
  useReactFlow,
} from 'reactflow';
import { stratify, hierarchy } from 'd3-hierarchy';
import dagre from '@dagrejs/dagre';
import type { Employee } from '../state/employee';
import ProfileCard from '../../../components/shared/ProfileCard';
import SquaresBackground from '../../../components/shared/SquaresBackground';

import 'reactflow/dist/style.css';

// Custom node component that wraps ProfileCard
const ProfileNode = ({ data, selected }: { data: Employee; selected?: boolean }) => {
  const { highlightState } = data;
  
  return (
    <div className={`org-chart-node ${selected ? 'selected' : ''}`}>
      <ProfileCard
        employee={data}
        size="medium"
        isHighlighted={highlightState.active}
        className="profile-node-card"
      />
    </div>
  );
};

// Node types registry
const nodeTypes: NodeTypes = {
  profile: ProfileNode,
};

export interface OrgChartCanvasProps {
  employees: Employee[];
  onNodeClick?: (employee: Employee) => void;
  onNodeDoubleClick?: (employee: Employee) => void;
  onEdgeClick?: (fromEmployee: Employee, toEmployee: Employee) => void;
  className?: string;
  showMiniMap?: boolean;
  showControls?: boolean;
  showBackground?: boolean;
  allowInteraction?: boolean;
}

export const OrgChartCanvas: React.FC<OrgChartCanvasProps> = ({
  employees,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  className = '',
  showMiniMap = true,
  showControls = true,
  showBackground = true,
  allowInteraction = true,
}) => {
  // Convert employees to hierarchical structure for dagre layout
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    if (employees.length === 0) {
      return { nodes: [], edges: [] };
    }

    try {
      // Create hierarchical data structure
      const hierarchyData = employees.map(emp => ({
        id: emp.id,
        parentId: emp.managerId || null,
        data: emp,
      }));

      // Find root nodes (employees with no manager)
      const rootNodes = hierarchyData.filter(node => !node.parentId);
      if (rootNodes.length === 0) {
        console.warn('No root nodes found in employee hierarchy');
        return { nodes: [], edges: [] };
      }

      // Use d3-hierarchy to build tree structure
      const stratifiedData = stratify<typeof hierarchyData[0]>()
        .id(d => d.id)
        .parentId(d => d.parentId)(hierarchyData);

      const hierarchyTree = hierarchy(stratifiedData);

      // Create dagre graph for layout calculation
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));
      dagreGraph.setGraph({ 
        rankdir: 'TB', // Top to bottom
        nodesep: 60,   // Horizontal spacing between nodes
        ranksep: 80,   // Vertical spacing between ranks
        marginx: 20,
        marginy: 20,
      });

      // Add nodes to dagre graph
      hierarchyTree.descendants().forEach(node => {
        const nodeId = node.data.id;
        if (nodeId) {
          dagreGraph.setNode(nodeId, {
            width: 280,  // ProfileCard width
            height: 120, // ProfileCard height
          });
        }
      });

      // Add edges to dagre graph
      hierarchyTree.links().forEach(link => {
        const sourceId = link.source.data.id;
        const targetId = link.target.data.id;
        if (sourceId && targetId) {
          dagreGraph.setEdge(sourceId, targetId);
        }
      });

      // Calculate layout
      dagre.layout(dagreGraph);

      // Convert to React Flow nodes
      const nodes: Node[] = [];
      hierarchyTree.descendants().forEach(node => {
        const nodeId = node.data.id;
        if (nodeId) {
          const dagreNode = dagreGraph.node(nodeId);
          const employee = node.data.data;

          nodes.push({
            id: employee.id,
            type: 'profile',
            position: {
              x: dagreNode.x - dagreNode.width / 2,
              y: dagreNode.y - dagreNode.height / 2,
            },
            data: employee,
            draggable: allowInteraction,
            selectable: allowInteraction,
            connectable: false, // Prevent manual edge creation
          });
        }
      });

      // Convert to React Flow edges
      const edges: Edge[] = [];
      hierarchyTree.links().forEach(link => {
        const sourceId = link.source.data.id;
        const targetId = link.target.data.id;
        
        if (sourceId && targetId) {
          edges.push({
            id: `${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: 'var(--color-gray-300)',
              strokeWidth: 2,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'var(--color-gray-300)',
              width: 20,
              height: 20,
            },
          } as Edge);
        }
      });

      return { nodes, edges };

    } catch (error) {
      console.error('Error creating org chart layout:', error);
      return { nodes: [], edges: [] };
    }
  }, [employees, allowInteraction]);

  // React Flow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  // Update nodes when layout changes
  React.useEffect(() => {
    setNodes(layoutNodes);
  }, [layoutNodes, setNodes]);

  // Update edges when layout changes
  React.useEffect(() => {
    setEdges(layoutEdges);
  }, [layoutEdges, setEdges]);

  // Handle node click events
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeClick && node.data) {
        onNodeClick(node.data);
      }
    },
    [onNodeClick]
  );

  // Handle node double click events
  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeDoubleClick && node.data) {
        onNodeDoubleClick(node.data);
      }
    },
    [onNodeDoubleClick]
  );

  // Handle edge click events
  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (onEdgeClick) {
        const sourceEmployee = employees.find(emp => emp.id === edge.source);
        const targetEmployee = employees.find(emp => emp.id === edge.target);
        
        if (sourceEmployee && targetEmployee) {
          onEdgeClick(sourceEmployee, targetEmployee);
        }
      }
    },
    [onEdgeClick, employees]
  );

  // Fit view when employees change
  const { fitView } = useReactFlow();
  React.useEffect(() => {
    if (nodes.length > 0) {
      // Small delay to ensure nodes are rendered
      setTimeout(() => {
        fitView({ padding: 0.1, includeHiddenNodes: false });
      }, 50);
    }
  }, [nodes.length, fitView]);

  return (
    <div className={`org-chart-canvas ${className}`}>
      {showBackground && (
        <div className="org-chart-background">
          <SquaresBackground 
            count={15}
            speed={0.5}
            opacity={0.03}
            color="gray"
            animated={true}
          />
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={allowInteraction ? onNodesChange : undefined}
        onEdgesChange={allowInteraction ? onEdgesChange : undefined}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Strict}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        {showBackground && (
          <Background
            gap={20}
            size={1}
            color="var(--color-gray-200)"
          />
        )}
        
        {showControls && (
          <Controls
            position="bottom-right"
            showZoom={true}
            showFitView={true}
            showInteractive={allowInteraction}
          />
        )}
        
        {showMiniMap && (
          <MiniMap
            position="top-right"
            zoomable
            pannable
            nodeColor={(node) => {
              const employee = node.data as Employee;
              return employee.highlightState.active 
                ? 'var(--color-orange-500)' 
                : 'var(--color-gray-400)';
            }}
            nodeStrokeWidth={2}
            maskColor="rgba(255, 255, 255, 0.8)"
          />
        )}
      </ReactFlow>
    </div>
  );
};

// Wrapper component that provides ReactFlowProvider context
export const OrgChartCanvasWithProvider: React.FC<OrgChartCanvasProps> = (props) => {
  return (
    <div className="org-chart-canvas-wrapper">
      <ReactFlow>
        <OrgChartCanvas {...props} />
      </ReactFlow>
    </div>
  );
};