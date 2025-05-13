
import { Edge, Node } from "@xyflow/react";
import { HierarchyNodeData } from "@/types/node";

// Define the shape of exported data
export interface FlowExport {
  structures: {
    id: string;
    name: string;
    code: string;
    category: string;
    level: number;
    isActive: boolean;
    description?: string;
    children: string[];
  }[];
}

// Define the shape of action history events
export interface FlowAction {
  type: 'node-added' | 'node-removed' | 'connection-created' | 'connection-removed' | 'node-updated' | 'level-recalculated' | 'flow-imported';
  timestamp: number;
  details: Record<string, any>;
}

// Convert nodes and edges to export format
export const nodesToExportFormat = (nodes: Node<HierarchyNodeData>[], edges: Edge[]): FlowExport => {
  // Create a map to store child relationships
  const childrenMap: Record<string, string[]> = {};
  
  // Populate the children map
  edges.forEach(edge => {
    const sourceId = edge.source;
    const targetId = edge.target;
    
    if (!childrenMap[sourceId]) {
      childrenMap[sourceId] = [];
    }
    
    childrenMap[sourceId].push(targetId);
  });
  
  // Convert nodes to the export format
  const structures = nodes.map(node => ({
    id: node.id,
    name: node.data.label,
    code: node.data.code,
    category: node.data.category,
    level: node.data.level,
    isActive: node.data.isActive,
    description: node.data.description || '',
    children: childrenMap[node.id] || []
  }));
  
  return { structures };
};

// Convert import format back to nodes and edges
export const importFormatToNodes = (importData: FlowExport): { nodes: Node<HierarchyNodeData>[], edges: Edge[] } => {
  // Process nodes
  const nodes = importData.structures.map((item, index) => {
    // Calculate position based on index (grid layout)
    const column = index % 5;
    const row = Math.floor(index / 5);
    
    return {
      id: item.id,
      type: 'hierarchyNode',
      position: { x: column * 200, y: row * 150 },
      data: {
        label: item.name,
        code: item.code,
        category: item.category,
        level: item.level,
        isActive: item.isActive,
        description: item.description || ''
      }
    };
  });
  
  // Process edges
  const edges: Edge[] = [];
  
  importData.structures.forEach(item => {
    if (item.children && item.children.length > 0) {
      item.children.forEach(childId => {
        edges.push({
          id: `${item.id}-${childId}`,
          source: item.id,
          target: childId,
          animated: true,
          style: { stroke: "#0FA0CE", strokeWidth: 2 },
          markerEnd: {
            type: "arrowClosed",
            color: "#0FA0CE",
          },
        });
      });
    }
  });
  
  return { nodes, edges };
};

// Generate a path for a node based on its connections
export const generateNodePath = (nodeId: string, nodes: Node<HierarchyNodeData>[], edges: Edge[]): string => {
  // Create a map of parents for each node
  const parentMap: Record<string, string[]> = {};
  
  // Populate the parent map
  edges.forEach(edge => {
    const sourceId = edge.source;
    const targetId = edge.target;
    
    if (!parentMap[targetId]) {
      parentMap[targetId] = [];
    }
    
    parentMap[targetId].push(sourceId);
  });
  
  // Find root nodes (nodes with no parents)
  const rootNodes = nodes.filter(node => !parentMap[node.id] || parentMap[node.id].length === 0);
  
  // Function to build path from root to target
  const buildPath = (currentId: string, visited: Set<string> = new Set()): string | null => {
    // Check for cycles
    if (visited.has(currentId)) return null;
    visited.add(currentId);
    
    // Get the node
    const node = nodes.find(n => n.id === currentId);
    if (!node) return null;
    
    // If this is the target node, return its name
    if (currentId === nodeId) return node.data.label;
    
    // Check if any children lead to the target
    const childrenIds: string[] = [];
    edges.forEach(edge => {
      if (edge.source === currentId) {
        childrenIds.push(edge.target);
      }
    });
    
    // Try each child path
    for (const childId of childrenIds) {
      const childPath = buildPath(childId, new Set(visited));
      if (childPath) {
        return `${node.data.label} > ${childPath}`;
      }
    }
    
    return null;
  };
  
  // Try to build path from each root node
  for (const rootNode of rootNodes) {
    const path = buildPath(rootNode.id);
    if (path) return path;
  }
  
  // If no path found from roots, the node might be in a cycle
  // or not connected to any root, so just return its name
  const node = nodes.find(n => n.id === nodeId);
  return node ? node.data.label : "Unknown";
};
