import { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
  Connection,
  NodeTypes,
  Edge,
  Node,
  BackgroundVariant,
} from "@xyflow/react";
import { toast } from "sonner";
import { Plus, Minus, Move, Save, Download, Upload } from "lucide-react";

import "@xyflow/react/dist/style.css";
import { Sidebar } from "./Sidebar";
import HierarchyNode, { HierarchyNodeData } from "./HierarchyNode";
import { Input } from "./ui/input";

// Define the nodeTypes correctly with proper type casting
const nodeTypes: NodeTypes = {
  hierarchyNode: HierarchyNode as any, // Use type assertion as a workaround
};

export const FlowBuilder = () => {
  // ... keep existing code (state declarations and other code)
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<HierarchyNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [entityName, setEntityName] = useState("");
  
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
  
  // Handle dropping a new node onto the canvas
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        return;
      }

      // When dropping a new entity, always set level to 0 initially
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<HierarchyNodeData> = {
        id: `node-${Date.now()}`,
        type: "hierarchyNode",
        position,
        data: { 
          label: entityName || "New Entity",
          level: 0,  // Default level - will be recalculated based on connections
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setEntityName("");  // Clear input field after creating node
      
      // After adding a node, recalculate levels if there are edges
      if (edges.length > 0) {
        setTimeout(() => {
          recalculateLevels();
        }, 0);
      }
    },
    [reactFlowInstance, setNodes, entityName, edges, recalculateLevels]
  );
  
  // Function to save the current flow
  const saveFlow = () => {
    if (nodes.length === 0) {
      toast.warning("No nodes to save");
      return;
    }
    
    const flow = { nodes, edges };
    const json = JSON.stringify(flow);
    localStorage.setItem("saved-hierarchy-flow", json);
    toast.success("Flow saved successfully");
  };
  
  // Function to load a saved flow
  const loadFlow = () => {
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
  };
  
  // Function to export the current flow
  const exportFlow = () => {
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
  };

  // Recalculate levels whenever edges change
  useEffect(() => {
    if (edges.length > 0 && nodes.length > 0) {
      recalculateLevels();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full w-full">
      <Sidebar />
      
      <div className="flex-1 h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes as any}
          edges={edges}
          onNodesChange={onNodesChange as any}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          deleteKeyCode={["Backspace", "Delete"]}
          className="bg-[#121520]" // Dark background for the canvas
        >
          <Background 
            color="#333" 
            gap={24} 
            size={2}
            variant={BackgroundVariant.DOTS}  // Using the correct enum value
          />
          <Controls className="bg-[#1A1F2C] border border-gray-700 text-white rounded-md overflow-hidden" />
          <MiniMap 
            nodeStrokeWidth={3} 
            zoomable 
            pannable
            className="bg-[#1A1F2C] border border-gray-700"
          />
          <Panel position="top-left" className="bg-[#1A1F2C] border border-gray-700 p-4 rounded-md shadow-md">
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-bold text-white">Add New Entity</h3>
              <div className="flex items-center space-x-2">
                <Input 
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="Entity Name"
                  className="text-sm bg-[#242938] text-white border-gray-700"
                />
                <button
                  className="p-2 bg-[#0FA0CE] text-white rounded hover:bg-[#0b8cba] transition-colors"
                  onClick={() => {
                    if (entityName.trim() && reactFlowInstance) {
                      const newNode: Node<HierarchyNodeData> = {
                        id: `node-${Date.now()}`,
                        type: "hierarchyNode",
                        position: {
                          x: Math.random() * 500,
                          y: Math.random() * 500
                        },
                        data: { 
                          label: entityName,
                          level: 0, // Default level - will be recalculated
                        },
                      };
                      setNodes((nds) => [...nds, newNode] as any);
                      setEntityName("");
                      
                      // Recalculate levels if there are edges
                      if (edges.length > 0) {
                        setTimeout(() => {
                          recalculateLevels();
                        }, 0);
                      }
                    }
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={saveFlow}
                  className="flex items-center space-x-1 px-3 py-1 bg-[#2A304A] text-white text-xs rounded hover:bg-[#3A405A] transition-colors border border-[#0FA0CE]"
                >
                  <Save size={12} />
                  <span>Save</span>
                </button>
                <button 
                  onClick={loadFlow}
                  className="flex items-center space-x-1 px-3 py-1 bg-[#2A304A] text-white text-xs rounded hover:bg-[#3A405A] transition-colors border border-[#0FA0CE]"
                >
                  <Download size={12} />
                  <span>Load</span>
                </button>
                <button 
                  onClick={exportFlow}
                  className="flex items-center space-x-1 px-3 py-1 bg-[#2A304A] text-white text-xs rounded hover:bg-[#3A405A] transition-colors border border-[#0FA0CE]"
                >
                  <Upload size={12} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};
