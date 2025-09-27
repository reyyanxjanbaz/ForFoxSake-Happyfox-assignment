// Simple React Flow org chart canvas based on user's example

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, Node, Edge, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls, MiniMap } from 'reactflow';
import type { Connection, EdgeChange, NodeChange } from 'reactflow';
import type { Employee } from '../state/employee';

import 'reactflow/dist/style.css';

// Create org chart nodes with hierarchical positioning
const createOrgChartNodes = (employees: Employee[]): Node[] => {
  // Group employees by tier for hierarchical layout
  const tierBuckets: Record<Employee['tier'], Employee[]> = {
    executive: [],
    lead: [],
    manager: [],
    individual: [],
    intern: [],
  };

  employees.forEach(emp => {
    tierBuckets[emp.tier].push(emp);
  });

  const tierOrder: Employee['tier'][] = ['executive', 'lead', 'manager', 'individual', 'intern'];

  const nodes: Node[] = [];
  let yOffset = 50;

  // Position each tier
  tierOrder.forEach(tier => {
    const tierEmployees = tierBuckets[tier];
    if (tierEmployees.length === 0) return;
    
    const nodeWidth = 200;
    const nodeSpacing = 50;
    const totalWidth = tierEmployees.length * (nodeWidth + nodeSpacing) - nodeSpacing;
    const startX = -totalWidth / 2;
    
    tierEmployees.forEach((employee, index) => {
      nodes.push({
        id: employee.id,
        type: 'default',
        position: { 
          x: startX + index * (nodeWidth + nodeSpacing),
          y: yOffset
        },
        data: { 
          label: `${employee.name}\n${employee.designation}\n${employee.team}` 
        },
        style: {
          background: employee.tier === 'executive' ? '#ff6b6b' : 
                      employee.tier === 'manager' ? '#4ecdc4' : 
                      employee.tier === 'lead' ? '#45b7d1' : 
                      employee.tier === 'individual' ? '#96ceb4' : '#f39c12',
          color: 'white',
          border: '1px solid #222138',
          width: nodeWidth,
          fontSize: '12px',
          textAlign: 'center',
          borderRadius: '8px',
          padding: '10px',
        },
      });
    });
    
    yOffset += 150; // Space between tiers
  });
  
  return nodes;
};

// Create edges based on manager relationships
const createOrgChartEdges = (employees: Employee[]): Edge[] => {
  const edges: Edge[] = [];
  
  employees.forEach((employee) => {
    if (employee.managerId) {
      edges.push({
        id: `${employee.managerId}-${employee.id}`,
        source: employee.managerId,
        target: employee.id,
        type: 'smoothstep',
        animated: true,
      });
    }
  });
  
  return edges;
};

interface OrgChartCanvasProps {
  employees: Employee[];
  showMiniMap?: boolean;
  showControls?: boolean;
  showBackground?: boolean;
  allowInteraction?: boolean;
}

export default function OrgChartCanvas({ 
  employees,
  showMiniMap = true,
  showControls = true,
  showBackground = true,
  allowInteraction = true 
}: OrgChartCanvasProps) {
  const memoizedNodes = useMemo(() => createOrgChartNodes(employees), [employees]);
  const memoizedEdges = useMemo(() => createOrgChartEdges(employees), [employees]);
  const flowKey = useMemo(() => employees.map(emp => emp.id).join('-'), [employees]);

  const [nodes, setNodes] = useState<Node[]>(memoizedNodes);
  const [edges, setEdges] = useState<Edge[]>(memoizedEdges);

  useEffect(() => {
    setNodes(memoizedNodes);
    setEdges(memoizedEdges);
  }, [memoizedNodes, memoizedEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes(nodesSnapshot => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges(edgesSnapshot => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  
  const onConnect = useCallback(
    (params: Connection) => setEdges(edgesSnapshot => addEdge(params, edgesSnapshot)),
    [],
  );

  if (memoizedNodes.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>
        Loading org chart...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        key={flowKey}
        nodes={nodes}
        edges={edges}
        onNodesChange={allowInteraction ? onNodesChange : undefined}
        onEdgesChange={allowInteraction ? onEdgesChange : undefined}
        onConnect={allowInteraction ? onConnect : undefined}
        fitView
      >
        {showBackground && <Background />}
        {showControls && <Controls />}
        {showMiniMap && <MiniMap />}
      </ReactFlow>
    </div>
  );
}