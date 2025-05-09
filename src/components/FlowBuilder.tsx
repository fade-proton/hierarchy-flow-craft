
import { useState, useCallback, useRef } from "react";
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
  Connection
} from "@xyflow/react";
import { toast } from "sonner";
import { Plus, Minus, Move } from "lucide-react";

import "@xyflow/react/dist/style.css";
import { Sidebar } from "./Sidebar";
import HierarchyNode from "./HierarchyNode";
import { HIERARCHY_LEVELS } from "@/lib/constants";

const nodeTypes = {
  hierarchyNode: HierarchyNode,
};

export const FlowBuilder = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Handle new connections between nodes
  const onConnect = useCallback((params: Connection) => {
    // Check if the connection would create a cycle
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    
    if (!sourceNode || !targetNode) return;
    
    // Prevent connections from lower level to higher level
    if (sourceNode.data.level > targetNode.data.level) {
      toast.error("Cannot connect from lower to higher level");
      return;
    }
    
    // Prevent connections between the same level
    if (sourceNode.data.level === targetNode.data.level) {
      toast.error("Cannot connect nodes of the same level");
      return;
    }
    
    // Prevent connections that skip levels
    if (sourceNode.data.level !== targetNode.data.level - 1) {
      toast.error("Can only connect to adjacent level");
      return;
    }

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
  }, [nodes, setEdges]);

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

      const level = parseInt(event.dataTransfer.getData("application/reactflow/level"), 10);
      const type = event.dataTransfer.getData("application/reactflow/type");
      
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: "hierarchyNode",
        position,
        data: { 
          label: HIERARCHY_LEVELS[level] || `Level ${level}`,
          level,
          color: `hierarchy-${level}`
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

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
          <Panel position="top-left" className="bg-white p-2 rounded-md shadow-md">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium">Hierarchy Flow Builder</div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};
