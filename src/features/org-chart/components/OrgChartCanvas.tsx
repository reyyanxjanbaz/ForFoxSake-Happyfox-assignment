// React Flow org chart canvas with ProfileCard nodes and dagre layout

import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Custom node component that wraps ProfileCard with animations
const ProfileNode = ({ data, selected }: { data: Employee; selected?: boolean }) => {
  const { highlightState } = data;
  const [isNewNode, setIsNewNode] = useState(false);
  
  // Check if this is a newly added node
  useEffect(() => {
    const nodeAge = Date.now() - new Date(data.lastUpdatedAt).getTime();
    if (nodeAge < 3000) { // Consider nodes new for 3 seconds
      setIsNewNode(true);
      const timer = setTimeout(() => setIsNewNode(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [data.lastUpdatedAt]);
  
  return (
    <motion.div 
      className={`org-chart-node ${selected ? 'selected' : ''} ${isNewNode ? 'new-node' : ''}`}
      initial={{ scale: isNewNode ? 0.8 : 1, opacity: isNewNode ? 0 : 1 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        boxShadow: isNewNode 
          ? '0 0 30px rgba(234, 88, 12, 0.6), 0 0 60px rgba(234, 88, 12, 0.3)' 
          : selected 
            ? '0 4px 12px rgba(234, 88, 12, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}
      transition={{ 
        duration: 0.5, 
        ease: 'easeOut',
        boxShadow: { duration: isNewNode ? 2 : 0.3 }
      }}
      whileHover={{ 
        y: -2, 
        transition: { duration: 0.2 } 
      }}
    >
      <ProfileCard
        employee={data}
        size="medium"
        isHighlighted={highlightState.active}
        className="profile-node-card"
      />
    </motion.div>
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
  const reactFlowInstance = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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

  // Keyboard navigation for canvas
  const handleCanvasKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!allowInteraction || nodes.length === 0) return;

      const currentIndex = selectedNodeId 
        ? nodes.findIndex(node => node.id === selectedNodeId)
        : -1;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = currentIndex < nodes.length - 1 ? currentIndex + 1 : 0;
          const nextNode = nodes[nextIndex];
          setSelectedNodeId(nextNode.id);
          reactFlowInstance.fitView({ 
            nodes: [nextNode], 
            duration: 300,
            padding: 0.3 
          });
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : nodes.length - 1;
          const prevNode = nodes[prevIndex];
          setSelectedNodeId(prevNode.id);
          reactFlowInstance.fitView({ 
            nodes: [prevNode], 
            duration: 300,
            padding: 0.3 
          });
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (selectedNodeId) {
            const selectedNode = nodes.find(node => node.id === selectedNodeId);
            if (selectedNode && onNodeClick) {
              onNodeClick(selectedNode.data);
            }
          }
          break;

        case 'Home':
          event.preventDefault();
          if (nodes.length > 0) {
            const firstNode = nodes[0];
            setSelectedNodeId(firstNode.id);
            reactFlowInstance.fitView({ 
              nodes: [firstNode], 
              duration: 300,
              padding: 0.3 
            });
          }
          break;

        case 'End':
          event.preventDefault();
          if (nodes.length > 0) {
            const lastNode = nodes[nodes.length - 1];
            setSelectedNodeId(lastNode.id);
            reactFlowInstance.fitView({ 
              nodes: [lastNode], 
              duration: 300,
              padding: 0.3 
            });
          }
          break;
      }
    },
    [allowInteraction, nodes, selectedNodeId, reactFlowInstance, onNodeClick]
  );

  // Handle node click events
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
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
      
      <div
        ref={canvasRef}
        tabIndex={0}
        role="application"
        aria-label={`Organization chart with ${nodes.length} employees. Use arrow keys to navigate, Enter to select.`}
        onKeyDown={handleCanvasKeyDown}
        style={{ 
          height: '100%', 
          outline: 'none',
          position: 'relative' 
        }}
      >
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            selected: node.id === selectedNodeId
          }))}
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