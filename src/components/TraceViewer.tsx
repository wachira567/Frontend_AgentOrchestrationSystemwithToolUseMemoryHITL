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
  const { taskState, isPolling, activeThreadId, selectedNodeId, fetchNodeDetails, openSidePanel } = useAgentStore();

  const activeNodes = useMemo(() => {
    if (!taskState || !isPolling) return [];
    return taskState.next_nodes || [];
  }, [taskState, isPolling]);

  // Handle node click event for deep inspection
  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (activeThreadId) {
      fetchNodeDetails(activeThreadId, node.id);
    } else {
      openSidePanel(node.id);
    }
  };

  // Function to style nodes dynamically based on active and selected state
  const getNodeStyle = (nodeId: string, isTerminal = false) => {
    const isActive = activeNodes.includes(nodeId);
    const isSelected = selectedNodeId === nodeId;

    if (isTerminal) {
      return {
        background: isSelected ? '#e0f2fe' : '#f3f4f6',
        color: '#374151',
        border: isSelected ? '2px solid #0284c7' : '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '10px',
        cursor: 'pointer',
        boxShadow: isSelected ? '0 0 12px rgba(2, 132, 199, 0.3)' : 'none',
      };
    }
    
    let borderColor = '#e5e7eb';
    let bg = '#ffffff';
    let textColor = '#1f2937';
    let shadow = 'none';

    if (isActive) {
      bg = '#eff6ff';
      textColor = '#1d4ed8';
      borderColor = '#3b82f6';
      shadow = '0 0 15px rgba(59, 130, 246, 0.35)';
    }

    if (isSelected) {
      borderColor = '#6366f1';
      shadow = '0 0 0 3px rgba(99, 102, 241, 0.3)';
    }

    return {
      background: bg,
      color: textColor,
      border: `2px solid ${borderColor}`,
      boxShadow: shadow,
      borderRadius: '8px',
      padding: '12px 24px',
      fontWeight: '500',
      width: 180,
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: 'all 0.25s ease',
    };
  };

  const nodes: Node[] = [
    { id: 'start', position: { x: 250, y: 0 }, data: { label: 'Task Input' }, style: getNodeStyle('start', true) },
    { id: 'supervisor_node', position: { x: 250, y: 100 }, data: { label: 'Supervisor Agent' }, style: getNodeStyle('supervisor_node') },
    { id: 'escalation_node', position: { x: 50, y: 200 }, data: { label: 'Human-in-the-Loop' }, style: { ...getNodeStyle('escalation_node'), borderColor: activeNodes.includes('escalation_node') ? '#eab308' : (selectedNodeId === 'escalation_node' ? '#6366f1' : '#e5e7eb') } },
    { id: 'specialist_node', position: { x: 250, y: 300 }, data: { label: 'Specialist Agent' }, style: getNodeStyle('specialist_node') },
    { id: 'tools', position: { x: 500, y: 300 }, data: { label: 'Tool Execution' }, style: getNodeStyle('tools') },
    { id: 'reviewer_node', position: { x: 250, y: 450 }, data: { label: 'Reviewer Agent' }, style: getNodeStyle('reviewer_node') },
    { id: 'memorize_node', position: { x: 250, y: 600 }, data: { label: 'Save to Semantic Memory' }, style: { ...getNodeStyle('memorize_node'), borderColor: activeNodes.includes('memorize_node') ? '#22c55e' : (selectedNodeId === 'memorize_node' ? '#6366f1' : '#e5e7eb') } },
  ];

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={initialEdges}
        onNodeClick={handleNodeClick}
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
