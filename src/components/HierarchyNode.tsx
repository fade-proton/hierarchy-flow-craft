
import { useState, useRef, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Settings } from "lucide-react";

// Define the data structure for the HierarchyNode
export interface HierarchyNodeData {
  label: string;
  level: number;
  [key: string]: any; // Add index signature to allow any string key
}

// Extend the NodeProps to include our custom data type
const HierarchyNode = ({ data, isConnectable }: NodeProps<HierarchyNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || "New Entity");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get the colors for the node based on level
  const getNodeColors = useCallback(() => {
    // Define colors for each level
    const colors = [
      "#0FA0CE", // Level 0 - Blue
      "#9B87F5", // Level 1 - Purple
      "#F57DBD", // Level 2 - Pink
      "#F97316", // Level 3 - Orange
      "#0EA5E9", // Level 4 - Sky Blue
      "#8B5CF6", // Level 5 - Violet
      "#D946EF", // Level 6 - Magenta
    ];
    
    // Ensure we have a valid level number
    const level = typeof data?.level === 'number' ? data.level : 0;
    const colorIndex = Math.min(level, colors.length - 1);
    
    return {
      borderColor: colors[colorIndex],
      shadowColor: `${colors[colorIndex]}70`, // Add transparency for shadow
    };
  }, [data?.level]);
  
  const { borderColor, shadowColor } = getNodeColors();
  
  // Handle double-click to start editing
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, []);
  
  // Handle saving the edited label
  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Here you would typically update the node data in your state management
  }, []);
  
  // Handle key press events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      setIsEditing(false);
    }
  }, []);
  
  return (
    <div
      className="p-3 rounded-xl border-2 bg-[#242938] min-w-[180px]"
      style={{
        borderColor,
        boxShadow: `0 0 10px ${shadowColor}`,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 rounded-full border-2 bg-[#242938]"
        style={{ borderColor }}
        isConnectable={isConnectable}
      />
      
      <div className="flex flex-col">
        {/* Level indicator */}
        <div className="text-xs text-gray-400 mb-1">
          Level: {typeof data?.level === 'number' ? data.level : 0}
        </div>
        
        {/* Node content */}
        <div className="flex justify-between items-center">
          {isEditing ? (
            <input
              ref={inputRef}
              value={label}
              onChange={e => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="bg-[#1A1F2C] text-white border border-gray-600 rounded px-2 py-1 w-full text-sm"
              autoFocus
            />
          ) : (
            <div 
              className="text-white font-medium cursor-text text-sm flex-grow break-all"
              onDoubleClick={handleDoubleClick}
            >
              {data?.label || "New Entity"}
            </div>
          )}
          
          <button className="ml-2 text-gray-400 hover:text-white focus:outline-none">
            <Settings size={14} />
          </button>
        </div>
        
        {/* Optional description or additional info */}
        <div className="text-xs text-gray-400 mt-1">
          ID: {typeof data?.level === 'number' ? `NODE-${data.level}-${Math.floor(Math.random() * 1000)}` : 'Unknown'}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 rounded-full border-2 bg-[#242938]"
        style={{ borderColor }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default HierarchyNode;
