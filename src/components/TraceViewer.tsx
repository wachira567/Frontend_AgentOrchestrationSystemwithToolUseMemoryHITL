import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAgentStore } from '../store/useAgentStore';

const initialEdges: Edge[] = [
  { id: 'e-start-sup', source: 'start', target: 'supervisor_node', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-sup-spec', source: 'supervisor_node', target: 'specialist_node', label: 'Delegate', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-sup-esc', source: 'supervisor_node', target: 'escalation_node', label: 'Low Confidence', animated: true, style: { stroke: '#eab308' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-esc-spec', source: 'escalation_node', target: 'specialist_node', label: 'Approved', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-spec-tool', source: 'specialist_node', target: 'tools', label: 'Use Tool', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-tool-spec', source: 'tools', target: 'specialist_node', label: 'Result', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-spec-rev', source: 'specialist_node', target: 'reviewer_node', label: 'Review', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-rev-spec', source: 'reviewer_node', target: 'specialist_node', label: 'Reject', animated: true, style: { stroke: '#ef4444' }, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e-rev-mem', source: 'reviewer_node', target: 'memorize_node', label: 'Approve & Done', style: { stroke: '#22c55e' }, markerEnd: { type: MarkerType.ArrowClosed } },
];

export const TraceViewer: React.FC = () => {
  const { taskState, isPolling } = useAgentStore();

  const activeNodes = useMemo(() => {
    if (!taskState || !isPolling) return [];
    return taskState.next_nodes || [];
  }, [taskState, isPolling]);

  // Function to style nodes dynamically based on active state
  const getNodeStyle = (nodeId: string, isTerminal = false) => {
    const isActive = activeNodes.includes(nodeId);
    if (isTerminal) return { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px' };
    
    return {
      background: isActive ? '#eff6ff' : '#ffffff',
      color: isActive ? '#1d4ed8' : '#1f2937',
      border: isActive ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      boxShadow: isActive ? '0 0 15px rgba(59, 130, 246, 0.3)' : 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontWeight: '500',
      width: 180,
      textAlign: 'center' as const,
      transition: 'all 0.3s ease',
    };
  };

  const nodes: Node[] = [
    { id: 'start', position: { x: 250, y: 0 }, data: { label: 'Task Input' }, style: getNodeStyle('start', true) },
    { id: 'supervisor_node', position: { x: 250, y: 100 }, data: { label: 'Supervisor Agent' }, style: getNodeStyle('supervisor_node') },
    { id: 'escalation_node', position: { x: 50, y: 200 }, data: { label: 'Human-in-the-Loop' }, style: { ...getNodeStyle('escalation_node'), borderColor: activeNodes.includes('escalation_node') ? '#eab308' : '#e5e7eb' } },
    { id: 'specialist_node', position: { x: 250, y: 300 }, data: { label: 'Specialist Agent' }, style: getNodeStyle('specialist_node') },
    { id: 'tools', position: { x: 500, y: 300 }, data: { label: 'Tool Execution' }, style: getNodeStyle('tools') },
    { id: 'reviewer_node', position: { x: 250, y: 450 }, data: { label: 'Reviewer Agent' }, style: getNodeStyle('reviewer_node') },
    { id: 'memorize_node', position: { x: 250, y: 600 }, data: { label: 'Save to Semantic Memory' }, style: { ...getNodeStyle('memorize_node'), borderColor: activeNodes.includes('memorize_node') ? '#22c55e' : '#e5e7eb' } },
  ];

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={initialEdges}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap zoomable pannable />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};
