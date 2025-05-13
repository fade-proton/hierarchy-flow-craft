import { Edge, MarkerType, Node } from "@xyflow/react";
import { HierarchyNodeData } from "@/types/node";

export interface FlowStructure {
  name: string;
  id: string;
  category: string;
  code: string;
  isActive: boolean;
  description?: string;
  content?: string;
  connections: { targetId: string; }[];
}

export interface FlowExport {
  structures: FlowStructure[];
}

export interface FlowAction {
  type: string;
  timestamp: number;
  details: Record<string, any>;
}

export const nodesToExportFormat = (nodes: Node<HierarchyNodeData>[], edges: Edge[]): FlowExport => {
  const structures: FlowStructure[] = nodes.map(node => {
    const connections = edges
      .filter(edge => edge.source === node.id)
      .map(edge => ({ targetId: edge.target }));

    return {
      name: node.data.label,
      id: node.id,
      category: node.data.category,
      code: node.data.code,
      isActive: node.data.isActive,
      description: node.data.description,
      content: node.data.content,
      connections: connections,
    };
  });

  return { structures };
};

export const importFormatToNodes = (importData: FlowExport): { nodes: Node<HierarchyNodeData>[], edges: Edge[] } => {
  const nodes: Node<HierarchyNodeData>[] = [];
  const edges: Edge[] = [];

  // Create nodes
  importData.structures.forEach(structure => {
    nodes.push({
      id: structure.id,
      type: "hierarchyNode",
      data: {
        label: structure.name,
        level: 0, // You might want to recalculate levels based on connections
        category: structure.category,
        code: structure.code,
        isActive: structure.isActive,
        description: structure.description,
        content: structure.content,
      },
      position: { x: Math.random() * 500, y: Math.random() * 500 }, // Adjust position as needed
    });
  });

  // Create edges
  importData.structures.forEach(structure => {
    const sourceNodeId = structure.id;
    
    // Create connections
    structure.connections.forEach(conn => {
      const targetNodeId = conn.targetId;
      
      edges.push({
        id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        source: sourceNodeId,
        target: targetNodeId,
        animated: true,
        style: { stroke: "#0FA0CE", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed, // Use enum value instead of string
          color: "#0FA0CE",
        },
      });
    });
  });

  return { nodes, edges };
};

export const generateNodePath = (nodeId: string, nodes: Node<HierarchyNodeData>[], edges: Edge[]): string => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return 'Node not found';

  let path = node.data.label;
  let currentId = nodeId;

  while (true) {
    const parentEdge = edges.find(e => e.target === currentId);
    if (!parentEdge) break;

    const parentNode = nodes.find(n => n.id === parentEdge.source);
    if (!parentNode) break;

    path = `${parentNode.data.label} > ${path}`;
    currentId = parentNode.id;
  }

  return path;
};
