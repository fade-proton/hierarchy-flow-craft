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
  NodeTypes,
} from "@xyflow/react";
import { toast } from "sonner";
import { 
  Save, FileJson, Undo, Redo, 
  Calculator, Sun, Moon 
} from "lucide-react";

import "@xyflow/react/dist/style.css";
import { Sidebar } from "./Sidebar";
import NodeDrawer from "./NodeDrawer";
import { Button } from "./ui/button";
import HierarchyNode from "./HierarchyNode";
import { HierarchyNodeData, HierarchyNode as HierarchyNodeType } from "@/types/node";
import { nodesToExportFormat, importFormatToNodes, FlowExport, FlowAction, generateNodePath } from "@/utils/flowUtils";
import { ExportDialog } from "./ExportDialog";
import { ActionHistory } from "./ActionHistory";

// Define the nodeTypes correctly with proper type casting
const nodeTypes: NodeTypes = {
  hierarchyNode: HierarchyNode as any,
};

export const FlowBuilder = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<HierarchyNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<HierarchyNodeType | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);
  const [history, setHistory] = useState<{past: Array<{nodes: HierarchyNodeType[], edges: Edge[]}>, future: Array<{nodes: HierarchyNodeType[], edges: Edge[]}>}>({past: [], future: []});
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportData, setExportData] = useState<FlowExport>({ structures: [] });
  const [actionHistory, setActionHistory] = useState<FlowAction[]>([]);
  const [showActionHistory, setShowActionHistory] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  
  // Track actions
  const trackAction = useCallback((action: FlowAction) => {
    setActionHistory(prev => [action, ...prev]);
  }, []);
  
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
    
    // Track this action
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    
    trackAction({
      type: 'connection-created',
      timestamp: Date.now(),
      details: {
        sourceId: params.source,
        targetId: params.target,
        sourceName: sourceNode?.data.label || params.source,
        targetName: targetNode?.data.label || params.target
      }
    });
    
    // Save state for undo/redo
    saveToHistory();
    
    // Recalculate levels after adding a new connection
    setTimeout(() => {
      recalculateLevels();
    }, 0);
  }, [setEdges, nodes, trackAction]);
  
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
    
    // Track this action
    trackAction({
      type: 'level-recalculated',
      timestamp: Date.now(),
      details: {
        nodeCount: nodes.length,
        rootNodeCount: rootNodeIds.length
      }
    });

    toast.success(`Level rank recalculated for ${nodes.length} nodes`);
  }, [nodes, edges, setNodes, trackAction]);
  
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
      const nodeCode = event.dataTransfer.getData("application/reactflow/code");
      const isActive = event.dataTransfer.getData("application/reactflow/isActive") === "true";
      
      // Use the position from the drop event
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: HierarchyNodeType = {
        id: `node-${Date.now()}`,
        type: "hierarchyNode",
        position,
        data: { 
          label: entityName || "New Entity",
          level: 0,  // Default level - will be recalculated based on connections
          category: nodeCategory || "default",
          code: nodeCode || `N${Math.floor(Math.random() * 1000)}`,
          isActive: isActive
        },
      };

      setNodes((nds) => [...nds, newNode]);
      
      // Track this action
      trackAction({
        type: 'node-added',
        timestamp: Date.now(),
        details: {
          id: newNode.id,
          name: newNode.data.label,
          type: newNode.data.category
        }
      });
      
      saveToHistory();
      
      // After adding a node, recalculate levels if there are edges
      if (edges.length > 0) {
        setTimeout(() => {
          recalculateLevels();
        }, 0);
      }
    },
    [reactFlowInstance, setNodes, edges, recalculateLevels, saveToHistory, trackAction]
  );

  // Handle node deletion
  const onNodesDelete = useCallback((deletedNodes: Node<HierarchyNodeData>[]) => {
    // Track node deletion actions
    deletedNodes.forEach(node => {
      trackAction({
        type: 'node-removed',
        timestamp: Date.now(),
        details: {
          id: node.id,
          name: node.data.label,
          type: node.data.category
        }
      });
    });
    
    // We don't need to actually delete nodes here, 
    // as ReactFlow handles that through onNodesChange
    saveToHistory();
    
    // Recalculate levels after deletion if needed
    if (nodes.length > deletedNodes.length && edges.length > 0) {
      setTimeout(() => {
        recalculateLevels();
      }, 0);
    }
  }, [nodes.length, edges.length, recalculateLevels, saveToHistory, trackAction]);

  // Handle edge deletion
  const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
    // Track edge deletion actions
    deletedEdges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      trackAction({
        type: 'connection-removed',
        timestamp: Date.now(),
        details: {
          sourceId: edge.source,
          targetId: edge.target,
          sourceName: sourceNode?.data.label || edge.source,
          targetName: targetNode?.data.label || edge.target
        }
      });
    });
    
    // We don't need to actually delete edges here, 
    // as ReactFlow handles that through onEdgesChange
    saveToHistory();
    
    // Recalculate levels after deletion
    if (nodes.length > 0 && edges.length > deletedEdges.length) {
      setTimeout(() => {
        recalculateLevels();
      }, 0);
    }
  }, [nodes, edges.length, recalculateLevels, saveToHistory, trackAction]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<HierarchyNodeData>) => {
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
  }, [setNodes, saveToHistory]);
  
  // Function to save the current flow
  const saveFlow = () => {
    if (nodes.length === 0) {
      toast.warning("No nodes to save");
      return;
    }
    
    // Recalculate levels before saving - added this line
    recalculateLevels();
    
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

  // Handle showing the export dialog
  const handleOpenExportDialog = () => {
    const exportData = nodesToExportFormat(nodes, edges);
    setExportData(exportData);
    setShowExportDialog(true);
  };
  
  // Handle import from the export dialog
  const handleImportData = (importData: FlowExport) => {
    try {
      const { nodes: importedNodes, edges: importedEdges } = importFormatToNodes(importData);
      
      // Set the nodes and edges
      setNodes(importedNodes);
      setEdges(importedEdges);
      
      // Save to history
      saveToHistory();
      
      // Recalculate levels if needed
      if (importedNodes.length > 0 && importedEdges.length > 0) {
        setTimeout(() => {
          recalculateLevels();
        }, 0);
      }
      
      // Track import action
      trackAction({
        type: 'flow-imported',
        timestamp: Date.now(),
        details: {
          nodeCount: importedNodes.length,
          edgeCount: importedEdges.length
        }
      });
      
      toast.success(`Imported ${importedNodes.length} nodes and ${importedEdges.length} connections`);
      
      // Fit view to show all nodes
      setTimeout(() => {
        fitView();
      }, 100);
    } catch (error) {
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Calculate node paths when a node is selected
  useEffect(() => {
    if (selectedNode) {
      const path = generateNodePath(selectedNode.id, nodes, edges);
      console.log(`Path for ${selectedNode.data.label}: ${path}`);
      
      // Could store this on the node itself or use elsewhere
      // For now, we just log it
    }
  }, [selectedNode, nodes, edges]);

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

  // Toggle dark/light mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  }, [isDarkMode]);

  // Apply dark mode on component mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className={`flex h-full w-full ${isDarkMode ? 'dark' : ''}`}>
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
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          attributionPosition="bottom-right"
          deleteKeyCode={["Backspace", "Delete"]}
          className={isDarkMode ? "bg-[#121520]" : "bg-white"}
        >
          <Background 
            color={isDarkMode ? "#333" : "#d9d9d9"} 
            gap={20} 
            size={1}
            variant={BackgroundVariant.Dots}
          />
          <Controls className={isDarkMode ? "bg-[#1A1F2C] border border-gray-700 text-white rounded-md overflow-hidden" : "bg-white border border-gray-300 text-gray-700 rounded-md overflow-hidden"} />
          {showMinimap && (
            <MiniMap 
              nodeStrokeWidth={3} 
              zoomable 
              pannable
              className={isDarkMode ? "bg-[#1A1F2C] border border-gray-700" : "bg-white border border-gray-300"}
            />
          )}
          
          {/* Unified Navigation Card */}
          <Panel position="top-right" className={isDarkMode ? "bg-[#1A1F2C] border border-gray-700 p-2 rounded-md shadow-md flex space-x-2" : "bg-white border border-gray-300 p-2 rounded-md shadow-md flex space-x-2"}>
            <Button variant="outline" size="sm" onClick={toggleDarkMode} className={isDarkMode ? "bg-[#242938] text-white hover:bg-[#2A304A]" : "bg-white text-gray-700 hover:bg-gray-100"} title="Toggle Dark Mode">
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </Button>
            
            <Button 
              onClick={saveFlow}
              title="Save Flow"
              className={`flex items-center justify-center w-9 h-9 rounded transition-colors border ${
                isDarkMode 
                  ? 'bg-[#2A304A] text-white border-[#0FA0CE] hover:bg-[#3A405A]' 
                  : 'bg-white text-gray-700 border-blue-500 hover:bg-gray-100'
              }`}
            >
              <Save size={16} />
            </Button>
            
            <Button 
              onClick={handleOpenExportDialog}
              title="Export/Import Flow"
              className={`flex items-center justify-center w-9 h-9 rounded transition-colors border ${
                isDarkMode 
                  ? 'bg-[#2A304A] text-white border-[#0FA0CE] hover:bg-[#3A405A]' 
                  : 'bg-white text-gray-700 border-blue-500 hover:bg-gray-100'
              }`}
            >
              <FileJson size={16} />
            </Button>
            
            <Button
              onClick={() => setShowActionHistory(!showActionHistory)}
              title="Action History"
              className={`flex items-center justify-center w-9 h-9 rounded transition-colors border ${
                showActionHistory 
                  ? (isDarkMode ? 'bg-[#0FA0CE] text-white border-[#0FA0CE] hover:bg-[#0C8CAE]' : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600') 
                  : (isDarkMode ? 'bg-[#2A304A] text-white border-[#0FA0CE] hover:bg-[#3A405A]' : 'bg-white text-gray-700 border-blue-500 hover:bg-gray-100')
              }`}
            >
              {actionHistory.length > 0 ? (
                <div className="relative">
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {actionHistory.length}
                  </span>
                  <span className="sr-only">Action History</span>
                </div>
              ) : null}
              <span className="sr-only">Action History</span>
            </Button>
            
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" onClick={undo} className={isDarkMode ? "bg-[#242938] text-white hover:bg-[#2A304A] w-7 h-7 p-0" : "bg-white text-gray-700 hover:bg-gray-100 w-7 h-7 p-0"} disabled={history.past.length === 0} title="Undo">
                <Undo size={14} />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} className={isDarkMode ? "bg-[#242938] text-white hover:bg-[#2A304A] w-7 h-7 p-0" : "bg-white text-gray-700 hover:bg-gray-100 w-7 h-7 p-0"} disabled={history.future.length === 0} title="Redo">
                <Redo size={14} />
              </Button>
            </div>
            
            {showActionHistory && actionHistory.length > 0 && (
              <div className="absolute top-14 right-0 w-64 z-10">
                <ActionHistory actions={actionHistory} />
              </div>
            )}
          </Panel>
        </ReactFlow>
        
        {selectedNode && (
          <NodeDrawer node={selectedNode} onUpdate={onNodeUpdate} onClose={() => setSelectedNode(null)} />
        )}
        
        <ExportDialog 
          open={showExportDialog} 
          onOpenChange={setShowExportDialog}
          exportData={exportData}
          onImport={handleImportData}
        />
      </div>
    </div>
  );
};
