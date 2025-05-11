
import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Settings, Trash } from "lucide-react";

// Define the data type for our node
export interface HierarchyNodeData {
  label: string;
  level?: number;
  category?: string;
  description?: string;
  content?: string;
  isActive?: boolean;
  code?: string;  // Added for the export format
  [key: string]: any;
}

// Map categories to colors
const categoryColors: Record<string, string> = {
  input: "#F97316", // Orange
  action: "#8B5CF6", // Purple
  config: "#0EA5E9", // Blue
  default: "#10B981", // Green
  headquarters: "#FF4500", // Red-Orange for HQ type
};

// Get the level color based on node level
const getLevelColor = (level: number = 0): string => {
  const colors = [
    "#4B69FF", // Level 0 - Blue
    "#5D5AFF", // Level 1 - Blue-Purple
    "#7152FF", // Level 2 - Purple
    "#8B42FF", // Level 3 - Purple-Violet
    "#A32EFF", // Level 4 - Violet
    "#C71AFD", // Level 5 - Pink-Purple
    "#E816FA", // Level 6 - Pink
  ];
  
  return colors[level % colors.length];
};

// HierarchyNode component
const HierarchyNode = ({ id, data, selected }: NodeProps<HierarchyNodeData>) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get border color based on category or hierarchy level
  const getBorderColor = (): string => {
    if (data?.category && categoryColors[data.category]) {
      return categoryColors[data.category];
    }
    return getLevelColor(data?.level || 0);
  };

  const borderColor = getBorderColor();
  
  return (
    <div 
      className={cn(
        "px-4 py-4 rounded-[15px] w-[150px] h-[150px]", 
        "bg-[#1A1F2C] text-white shadow-lg", 
        "hover:bg-[#242938] transition-colors",
        "border-2",
        selected ? "shadow-glow" : ""
      )}
      style={{ 
        borderColor: borderColor,
        boxShadow: selected ? `0 0 15px ${borderColor}80` : "none"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full relative">
        {/* Node label */}
        <div className="text-center font-medium text-white mb-2">
          {data?.label || "Node"}
        </div>
        
        {/* Node code (if available) */}
        {data?.code && (
          <div className="text-xs bg-gray-700 px-2 py-1 rounded mb-1 text-center">
            {data.code}
          </div>
        )}
        
        {/* Node description (if available) */}
        {data?.description && (
          <div className="text-xs text-gray-300 overflow-hidden max-h-[60px] mb-2">
            {data.description}
          </div>
        )}
        
        {/* Node level indicator */}
        <div className="text-xs text-gray-400 mt-auto">
          Level: {data?.level !== undefined ? data.level : 0}
        </div>
        
        {/* Status indicator for active/inactive nodes */}
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full" 
          style={{ backgroundColor: data?.isActive ? "#10B981" : "#6B7280" }} 
        />
        
        {/* Action buttons (visible on hover) */}
        {isHovered && (
          <div className="absolute top-1 right-1 flex space-x-1">
            <button className="p-1 rounded-sm hover:bg-[#2A304A] text-gray-300">
              <Settings size={16} />
            </button>
            <button className="p-1 rounded-sm hover:bg-[#2A304A] text-gray-300">
              <Trash size={16} />
            </button>
          </div>
        )}
      </div>
      
      {/* Connection handles (all sides) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-white border-2 rounded-full"
        style={{ borderColor: borderColor }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-white border-2 rounded-full"
        style={{ borderColor: borderColor }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-white border-2 rounded-full"
        style={{ borderColor: borderColor }}
        isConnectable={true}
        id="left-target"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 bg-white border-2 rounded-full"
        style={{ borderColor: borderColor }}
        isConnectable={true}
        id="left-source"
      />
      <Handle
        type="target"
        position={Position.Right}
        className="w-3 h-3 bg-white border-2 rounded-full"
        style={{ borderColor: borderColor }}
        isConnectable={true}
        id="right-target"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-white border-2 rounded-full"
        style={{ borderColor: borderColor }}
        isConnectable={true}
        id="right-source"
      />
    </div>
  );
};

export default memo(HierarchyNode);
