
import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { HIERARCHY_LEVELS } from "@/lib/constants";

// Define the correct type for our node data with index signature to satisfy TypeScript
export interface HierarchyNodeData {
  label: string;
  level: number;
  color?: string;
  [key: string]: unknown; // Add index signature to satisfy Record<string, unknown>
}

// Use NodeProps with the correct generic parameter
const HierarchyNode = memo(({ id, data, selected }: NodeProps<HierarchyNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Here you would typically update the node data in your state
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };

  // Get background color based on hierarchy level
  const getBgColor = () => {
    return `hierarchy-${data.level}`;
  };

  return (
    <div 
      className={cn(
        "px-4 py-2 shadow-md rounded-md border-2 bg-white min-w-[150px]",
        selected ? "border-blue-500" : "border-gray-200",
      )}
      style={{ borderLeftColor: getHierarchyColor(data.level), borderLeftWidth: '4px' }}
    >
      <div className="bg-white p-1 rounded shadow text-xs absolute -top-6 left-1/2 transform -translate-x-1/2">
        Level {data.level}
      </div>
      
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-center border-none focus:outline-none"
          autoFocus
        />
      ) : (
        <div
          className="text-center font-medium text-gray-800"
          onDoubleClick={handleDoubleClick}
        >
          {label}
        </div>
      )}
      
      <div className="text-xs text-gray-500 text-center mt-1">
        {HIERARCHY_LEVELS[data.level]}
      </div>
      
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-blue-500 border-2 border-white rounded-full"
        isConnectable={true} // All nodes can be targets now
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-blue-500 border-2 border-white rounded-full"
        isConnectable={true} // All nodes can be sources now
      />
    </div>
  );
});

HierarchyNode.displayName = "HierarchyNode";

// Helper function to get hierarchy color based on level
function getHierarchyColor(level: number): string {
  const colors: Record<number, string> = {
    0: "#4B69FF", // National - Blue
    1: "#5D5AFF", // Regional - Blue-Purple
    2: "#7152FF", // Province - Purple
    3: "#8B42FF", // Zone - Purple-Violet
    4: "#A32EFF", // Area - Violet
    5: "#C71AFD", // Parish - Pink-Purple
    6: "#E816FA", // Additional level - Pink
  };

  return colors[level] || colors[0];
}

export default HierarchyNode;
