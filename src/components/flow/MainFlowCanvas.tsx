
import { useRef, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from "@xyflow/react";
import { useFlow } from "@/context/FlowContext";
import HierarchyNode from "@/components/HierarchyNode";
import { NodeCreationPanel } from "./NodeCreationPanel";
import { FlowManagementControls } from "./FlowManagementControls";
import { ZoomControls } from "./ZoomControls";
import { useState } from "react";

// Define the nodeTypes correctly with proper type casting
const nodeTypes = {
  hierarchyNode: HierarchyNode as any, // Use type assertion as a workaround
};

export const MainFlowCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [showMinimap, setShowMinimap] = useState(true);
  
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    setReactFlowInstance, 
    createNode 
  } = useFlow();
  
  // Handle dropping a new node onto the canvas
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !setReactFlowInstance) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const entityName = event.dataTransfer.getData("application/reactflow/entityName") || "New Entity";
      
      // Get the position where the node is dropped
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      createNode(entityName, position);
    },
    [createNode, setReactFlowInstance]
  );

  return (
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
        className="bg-[#121520]"
      >
        <Background 
          color="#333" 
          gap={24} 
          size={2}
          variant={BackgroundVariant.Dots}
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
        <NodeCreationPanel />
        <FlowManagementControls />
        <ZoomControls />
      </ReactFlow>
    </div>
  );
};
