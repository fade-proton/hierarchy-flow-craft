
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
  Edge,
  Node,
  BackgroundVariant,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { toast } from "sonner";
import { Plus, Minus, Move, Save, Download, Upload, Undo, Redo } from "lucide-react";

import "@xyflow/react/dist/style.css";
import { Sidebar } from "./Sidebar";
import NodeDrawer from "./NodeDrawer";
import { Button } from "./ui/button";
import HierarchyNode, { HierarchyNodeData } from "./HierarchyNode";

// Define the nodeTypes correctly with proper type casting
const nodeTypes = {
  hierarchyNode: HierarchyNode,
};

export const FlowBuilder = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<HierarchyNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [entityName, setEntityName] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node<HierarchyNodeData> | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);
  const [history, setHistory] = useState<{past: Array<{nodes: Node<HierarchyNodeData>[], edges: Edge[]}>, future: Array<{nodes: Node<HierarchyNodeData>[], edges: Edge[]}>}>({past: [], future: []});
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  
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
    
    // Save state for undo/redo
    saveToHistory();
    
    // Recalculate levels after adding a new connection
    setTimeout(() => {
      recalculateLevels();
    }, 0);
  }, [setEdges]);
  
  // Save current state to history
  const saveToHistory = useCallback(() => {
    setHistory(h => ({
      past: [...h.past, {nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges))}],
      future: []
    }));
  }, [nodes, edges]);

  // Undo function
  const undo = useCallback(() => {
    if (history.past.length === 0) return;
    
    const newPast = [...history.past];
    const previous = newPast.pop();
    if (!previous) return;
    
    setHistory({
      past: newPast,
      future: [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }, ...history.future]
    });
    
    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [history, nodes, edges, setNodes, setEdges]);

  // Redo function
  const redo = useCallback(() => {
    if (history.future.length === 0) return;
    
    const newFuture = [...history.future];
    const next = newFuture.shift();
    if (!next) return;
    
    setHistory({
      past: [...history.past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
      future: newFuture
    });
    
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [history, nodes, edges, setNodes, setEdges]);

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

      const nodeType = event.dataTransfer.getData("application/reactflow/type");
      let entityName = event.dataTransfer.getData("application/reactflow/entityName");
      const nodeCategory = event.dataTransfer.getData("application/reactflow/category");
      
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
          category: nodeCategory || "default",
        },
      };

      setNodes((nds) => [...nds, newNode]);
      saveToHistory();
      
      // After adding a node, recalculate levels if there are edges
      if (edges.length > 0) {
        setTimeout(() => {
          recalculateLevels();
        }, 0);
      }
    },
    [reactFlowInstance, setNodes, edges, recalculateLevels]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);
  
  // Handle node updates from the drawer
  const onNodeUpdate = useCallback((updatedNode: Node<HierarchyNodeData>) => {
    setNodes(nds => 
      nds.map(node => 
        node.id === updatedNode.id ? updatedNode : node
      )
    );
    saveToHistory();
  }, [setNodes]);
  
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
        saveToHistory();
        
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

  // Shortcut key handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z') {
          event.preventDefault();
          undo();
        }
        if (event.key === 'y') {
          event.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  // Initialize history
  useEffect(() => {
    if (nodes.length > 0 && history.past.length === 0) {
      saveToHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      
      <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
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
          onNodeClick={onNodeClick}
          attributionPosition="bottom-right"
          deleteKeyCode={["Backspace", "Delete"]}
          className="bg-[#121520]" // Dark background for the canvas
        >
          <Background 
            color="#333" 
            gap={20} 
            size={1}
            variant={BackgroundVariant.DOTS}
          />
          <Controls className="bg-[#1A1F2C] border border-gray-700 text-white rounded-md overflow-hidden" />
          {showMinimap && (
            <MiniMap 
              nodeStrokeWidth={3} 
              zoomable 
              pannable
              className="bg-[#1A1F2C] border border-gray-700"
            />
          )}
          <Panel position="top-right" className="bg-[#1A1F2C] border border-gray-700 p-2 rounded-md shadow-md flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => zoomIn()} className="bg-[#242938] text-white hover:bg-[#2A304A]">
              <Plus size={14} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => zoomOut()} className="bg-[#242938] text-white hover:bg-[#2A304A]">
              <Minus size={14} />
            </Button>
            <Button variant="outline" size="sm" onClick={() => fitView()} className="bg-[#242938] text-white hover:bg-[#2A304A]">
              <Move size={14} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowMinimap(!showMinimap)} 
              className={`bg-[#242938] text-white hover:bg-[#2A304A] ${showMinimap ? 'border-[#0FA0CE]' : ''}`}
            >
              Map
            </Button>
          </Panel>
          <Panel position="top-left" className="bg-[#1A1F2C] border border-gray-700 p-4 rounded-md shadow-md">
            <div className="flex flex-col space-y-3">
              <div className="flex space-x-2 mb-2">
                <Button variant="outline" size="sm" onClick={undo} className="bg-[#242938] text-white hover:bg-[#2A304A]" disabled={history.past.length === 0}>
                  <Undo size={14} />
                </Button>
                <Button variant="outline" size="sm" onClick={redo} className="bg-[#242938] text-white hover:bg-[#2A304A]" disabled={history.future.length === 0}>
                  <Redo size={14} />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={saveFlow}
                  className="flex items-center space-x-1 px-3 py-1 bg-[#2A304A] text-white text-xs rounded hover:bg-[#3A405A] transition-colors border border-[#0FA0CE]"
                >
                  <Save size={12} />
                  <span>Save</span>
                </Button>
                <Button 
                  onClick={loadFlow}
                  className="flex items-center space-x-1 px-3 py-1 bg-[#2A304A] text-white text-xs rounded hover:bg-[#3A405A] transition-colors border border-[#0FA0CE]"
                >
                  <Download size={12} />
                  <span>Load</span>
                </Button>
                <Button 
                  onClick={exportFlow}
                  className="flex items-center space-x-1 px-3 py-1 bg-[#2A304A] text-white text-xs rounded hover:bg-[#3A405A] transition-colors border border-[#0FA0CE]"
                >
                  <Upload size={12} />
                  <span>Export</span>
                </Button>
              </div>
            </div>
          </Panel>
        </ReactFlow>
        
        {selectedNode && (
          <NodeDrawer node={selectedNode} onUpdate={onNodeUpdate} onClose={() => setSelectedNode(null)} />
        )}
      </div>
    </div>
  );
};
