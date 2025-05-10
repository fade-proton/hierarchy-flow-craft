
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from "@xyflow/react";
import { toast } from "sonner";
import { HierarchyNodeData } from "@/components/HierarchyNode";

type FlowContextType = {
  nodes: Node<HierarchyNodeData>[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  reactFlowInstance: any;
  setReactFlowInstance: (instance: any) => void;
  recalculateLevels: () => void;
  saveFlow: () => void;
  loadFlow: () => void;
  exportFlow: () => void;
  createNode: (label: string, position: { x: number, y: number }) => void;
};

export const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow must be used within a FlowProvider");
  }
  return context;
};

type FlowProviderProps = {
  children: ReactNode;
};

export const FlowProvider = ({ children }: FlowProviderProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<HierarchyNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Handle new connections between nodes
  const onConnect = useCallback((params: Connection) => {
    // Create the edge
    setEdges((eds) => 
      addEdge({
        ...params,
        animated: true,
        style: { stroke: "#0FA0CE", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#0FA0CE",
        },
      }, eds)
    );
    
    // Recalculate levels after adding a new connection
    setTimeout(() => {
      recalculateLevels();
    }, 0);
  }, [setEdges]);

  // Function to recalculate all node levels based on connections
  const recalculateLevels = useCallback(() => {
    // Find all root nodes (no incoming edges)
    const nodesWithIncomingEdges = new Set(edges.map(edge => edge.target));
    const rootNodeIds = nodes
      .filter(node => !nodesWithIncomingEdges.has(node.id))
      .map(node => node.id);
    
    // Initialize levels object
    const nodeLevels: Record<string, number> = {};
    rootNodeIds.forEach(id => {
      nodeLevels[id] = 0;
    });
    
    // Create a map of parent-child relationships
    const childToParents: Record<string, string[]> = {};
    edges.forEach(edge => {
      if (!childToParents[edge.target]) {
        childToParents[edge.target] = [];
      }
      childToParents[edge.target].push(edge.source);
    });
    
    // Function to process a node and determine its level
    const processNode = (nodeId: string, visited: Set<string> = new Set()): number => {
      // If we've already processed this node, return its level
      if (nodeLevels[nodeId] !== undefined) {
        return nodeLevels[nodeId];
      }
      
      // If we're in a cycle, set level as max level of parents + 1
      if (visited.has(nodeId)) {
        const parentLevels = (childToParents[nodeId] || [])
          .map(parentId => nodeLevels[parentId] || 0);
        const maxParentLevel = Math.max(...parentLevels, -1);
        return maxParentLevel + 1;
      }
      
      // Mark node as visited
      visited.add(nodeId);
      
      // Get parent levels
      const parents = childToParents[nodeId] || [];
      const parentLevels = parents.map(parentId => processNode(parentId, new Set(visited)));
      
      // Node level is max of parent levels + 1
      const maxParentLevel = parentLevels.length > 0 ? Math.max(...parentLevels) : -1;
      const nodeLevel = maxParentLevel + 1;
      
      // Save the level
      nodeLevels[nodeId] = nodeLevel;
      return nodeLevel;
    };
    
    // Process all nodes
    nodes.forEach(node => {
      processNode(node.id);
    });
    
    // Update node levels
    setNodes(nds => 
      nds.map(node => ({
        ...node,
        data: {
          ...node.data,
          level: nodeLevels[node.id] || 0
        }
      }))
    );
  }, [nodes, edges, setNodes]);

  // Create a new node with given properties
  const createNode = useCallback((label: string, position: { x: number, y: number }) => {
    const newNode: Node<HierarchyNodeData> = {
      id: `node-${Date.now()}`,
      type: "hierarchyNode",
      position,
      data: { 
        label: label || "New Entity",
        level: 0,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    
    // After adding a node, recalculate levels if there are edges
    if (edges.length > 0) {
      setTimeout(() => {
        recalculateLevels();
      }, 0);
    }
  }, [edges.length, recalculateLevels, setNodes]);
  
  // Function to save the current flow
  const saveFlow = useCallback(() => {
    if (nodes.length === 0) {
      toast.warning("No nodes to save");
      return;
    }
    
    const flow = { nodes, edges };
    const json = JSON.stringify(flow);
    localStorage.setItem("saved-hierarchy-flow", json);
    toast.success("Flow saved successfully");
  }, [nodes, edges]);
  
  // Function to load a saved flow
  const loadFlow = useCallback(() => {
    const savedFlow = localStorage.getItem("saved-hierarchy-flow");
    if (savedFlow) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedFlow);
        setNodes(savedNodes);
        setEdges(savedEdges);
        toast.success("Flow loaded successfully");
        
        // Recalculate levels after loading
        setTimeout(() => {
          recalculateLevels();
        }, 0);
      } catch (error) {
        toast.error("Failed to load saved flow");
      }
    } else {
      toast.info("No saved flow found");
    }
  }, [recalculateLevels, setEdges, setNodes]);
  
  // Function to export the current flow
  const exportFlow = useCallback(() => {
    if (nodes.length === 0) {
      toast.warning("No nodes to export");
      return;
    }
    
    const flow = { nodes, edges };
    const json = JSON.stringify(flow);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hierarchy-flow.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [nodes, edges]);

  // Context value
  const value = {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    reactFlowInstance,
    setReactFlowInstance,
    recalculateLevels,
    saveFlow,
    loadFlow,
    exportFlow,
    createNode,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};
