
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
  Node
} from "@xyflow/react";
import { toast } from "sonner";
import { Plus, Minus, Move, Save, Download, Upload } from "lucide-react";

import "@xyflow/react/dist/style.css";
import { Sidebar } from "./Sidebar";
import HierarchyNode from "./HierarchyNode";
import { HIERARCHY_LEVELS } from "@/lib/constants";
import { Input } from "./ui/input";

// Define types for our nodes with hierarchy data
type HierarchyNodeData = {
  label: string;
  level: number;
  color?: string;
};

type HierarchyNode = Node<HierarchyNodeData>;

// Define the nodeTypes object with proper typing
const nodeTypes: NodeTypes = {
  hierarchyNode: HierarchyNode as any, // Using 'as any' to bypass strict typing
};

export const FlowBuilder = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<HierarchyNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [entityName, setEntityName] = useState("");
  
  // Handle new connections between nodes
  const onConnect = useCallback((params: Connection) => {
    // Check if the connection would create a cycle
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    
    if (!sourceNode || !targetNode) return;
    
    // Check if this would create a parallel connection (same level nodes)
    const isParallel = sourceNode.data.level === targetNode.data.level;
    
    // Only allow parallel connections or connections to one level down
    if (sourceNode.data.level > targetNode.data.level) {
      toast.error("Cannot connect from lower to higher level");
      return;
    }
    
    // If not parallel, ensure it's only one level difference
    if (!isParallel && sourceNode.data.level !== targetNode.data.level - 1) {
      toast.error("Can only connect to adjacent level");
      return;
    }

    // Create the edge
    setEdges((eds) => 
      addEdge({
        ...params,
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#3b82f6",
        },
      }, eds)
    );
    
    // Recalculate levels if needed
    if (!isParallel) {
      recalculateLevels();
    }
  }, [nodes, setEdges]);
  
  // Function to recalculate all node levels based on connections
  const recalculateLevels = useCallback(() => {
    // First, find all root nodes (no incoming edges)
    const nodesWithIncomingEdges = new Set(edges.map(edge => edge.target));
    const rootNodeIds = nodes
      .filter(node => !nodesWithIncomingEdges.has(node.id))
      .map(node => node.id);
    
    // Assign level 0 to root nodes
    const nodeLevels: Record<string, number> = {};
    rootNodeIds.forEach(id => {
      nodeLevels[id] = 0;
    });
    
    // Function to get all outgoing edges from a node
    const getOutgoingEdges = (nodeId: string) => 
      edges.filter(edge => edge.source === nodeId);
    
    // Process nodes in topological order (BFS)
    const queue = [...rootNodeIds];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLevel = nodeLevels[currentId];
      
      // Process all children
      getOutgoingEdges(currentId).forEach(edge => {
        const targetId = edge.target;
        // Set target level to be one more than source, if it's not already higher
        if (!nodeLevels[targetId] || nodeLevels[targetId] <= currentLevel) {
          nodeLevels[targetId] = currentLevel + 1;
        }
        queue.push(targetId);
      });
    }
    
    // Update node levels
    setNodes(nds => 
      nds.map(node => {
        if (nodeLevels[node.id] !== undefined && node.data.level !== nodeLevels[node.id]) {
          return {
            ...node,
            data: {
              ...node.data,
              level: nodeLevels[node.id]
            }
          };
        }
        return node;
      })
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

      // When dropping a new entity, we'll just set it to level 0 initially
      // The level will be recalculated based on connections
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node-${Date.now()}`,
        type: "hierarchyNode",
        position,
        data: { 
          label: entityName || "New Entity",
          level: 0,  // Default level - will be recalculated based on connections
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setEntityName("");  // Clear input field after creating node
    },
    [reactFlowInstance, setNodes, entityName]
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

  return (
    <div className="flex h-full w-full">
      <Sidebar />
      
      <div className="flex-1 h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Background color="#aaaaaa" gap={16} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Panel position="top-left" className="bg-white p-4 rounded-md shadow-md">
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-bold">Add New Entity</h3>
              <div className="flex items-center space-x-2">
                <Input 
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="Entity Name"
                  className="text-sm"
                />
                <button
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    if (entityName.trim() && reactFlowInstance) {
                      const newNode = {
                        id: `node-${Date.now()}`,
                        type: "hierarchyNode",
                        position: {
                          x: Math.random() * 500,
                          y: Math.random() * 500
                        },
                        data: { 
                          label: entityName,
                          level: 0,
                        },
                      };
                      setNodes((nds) => nds.concat(newNode));
                      setEntityName("");
                    }
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={saveFlow}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                >
                  <Save size={12} />
                  <span>Save</span>
                </button>
                <button 
                  onClick={loadFlow}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  <Download size={12} />
                  <span>Load</span>
                </button>
                <button 
                  onClick={exportFlow}
                  className="flex items-center space-x-1 px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
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
