
// Flow utility functions for JSON export/import, history tracking

import { Node, Edge, MarkerType } from "@xyflow/react";
import { HierarchyNodeData } from "@/components/HierarchyNode";

export interface FlowStructure {
  tempId: string;
  name: string;
  code: string;
  type: string;
  description: string;
  levelRank: number;
  parentTempId: string | null;
}

export interface FlowExport {
  structures: FlowStructure[];
}

export interface FlowAction {
  type: 'node-added' | 'node-removed' | 'connection-created' | 'connection-removed' | 'level-recalculated' | 'flow-imported';
  timestamp: number;
  details: Record<string, any>;
}

/**
 * Convert application nodes and edges to structured export format
 */
export const nodesToExportFormat = (
  nodes: Node<HierarchyNodeData>[],
  edges: Edge[]
): FlowExport => {
  // Create a map of child nodes to their parent node IDs
  const childToParent: Record<string, string> = {};
  edges.forEach(edge => {
    // Assume source is the parent and target is the child
    childToParent[edge.target] = edge.source;
  });

  // Convert each node to the export structure format
  const structures: FlowStructure[] = nodes.map(node => {
    return {
      tempId: node.id,
      name: node.data.label || "Unnamed Node",
      code: node.data.code || node.id.substring(0, 4).toUpperCase(),
      type: node.data.category || "default",
      description: node.data.description || "",
      levelRank: node.data.level || 0,
      parentTempId: childToParent[node.id] || null
    };
  });

  return { structures };
};

/**
 * Convert import format back to nodes and edges
 */
export const importFormatToNodes = (
  importData: FlowExport
): { nodes: Node<HierarchyNodeData>[], edges: Edge[] } => {
  const nodes: Node<HierarchyNodeData>[] = [];
  const edges: Edge[] = [];
  
  // Create a base position for nodes (will be adjusted for better visualization)
  let xPosition = 100;
  let yPosition = 100;
  const xStep = 200;
  const yStep = 150;
  
  // Process each structure into a node
  importData.structures.forEach((structure, index) => {
    // For layout purposes, organize by level
    const x = xPosition + (structure.levelRank * xStep);
    const y = yPosition + (index % 3) * yStep; // Simple row-based positioning
    
    // Create the node
    nodes.push({
      id: structure.tempId,
      type: "hierarchyNode",
      position: { x, y },
      data: {
        label: structure.name,
        level: structure.levelRank,
        category: structure.type,
        description: structure.description,
        code: structure.code,
      }
    });
    
    // If this node has a parent, create an edge
    if (structure.parentTempId) {
      edges.push({
        id: `edge-${structure.parentTempId}-${structure.tempId}`,
        source: structure.parentTempId,
        target: structure.tempId,
        animated: true,
        style: { stroke: "#0FA0CE", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#0FA0CE",
        },
      });
    }
  });
  
  return { nodes, edges };
};

/**
 * Generate a path string for a node by traversing up to root
 */
export const generateNodePath = (
  nodeId: string, 
  nodes: Node<HierarchyNodeData>[],
  edges: Edge[]
): string => {
  // Create a map of child nodes to their parent nodes
  const childToParent: Record<string, string> = {};
  edges.forEach(edge => {
    childToParent[edge.target] = edge.source;
  });
  
  // Start with the current node
  const path: string[] = [];
  let currentNodeId = nodeId;
  
  // Maximum path depth to prevent infinite loops
  const maxDepth = 20;
  let depth = 0;
  
  while (currentNodeId && depth < maxDepth) {
    // Find the node by ID
    const node = nodes.find(n => n.id === currentNodeId);
    if (!node) break;
    
    // Add this node's label to the path
    path.unshift(node.data.label || "Unknown");
    
    // Move up to the parent, if any
    currentNodeId = childToParent[currentNodeId];
    depth++;
  }
  
  return path.join(" / ");
};
