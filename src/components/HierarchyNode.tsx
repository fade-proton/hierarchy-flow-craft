
import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { NODE_TYPES } from "@/lib/constants";

// Define the HierarchyNodeData type to fix TypeScript errors
export type HierarchyNodeData = {
  label: string;
  level: number;
  category?: string;
  code?: string;
  isActive?: boolean;
};

export default function HierarchyNode({ data, selected, id }: NodeProps<HierarchyNodeData>) {
  // Default values in case data is missing
  const nodeData = data || { label: "Node", level: 0 };
  const category = nodeData.category || "default";
  const label = nodeData.label || "Node";
  const level = Number(nodeData.level) || 0;
  const code = nodeData.code || "NODE";
  const isActive = nodeData.isActive !== undefined ? nodeData.isActive : true;

  // Function to get color based on node category
  const getColorForCategory = (cat: string): string => {
    switch (cat) {
      case "jasper":
        return "#F97316";
      case "gold":
        return "#8B5CF6";
      case "sapphire":
        return "#0EA5E9";
      case "emerald":
        return "#10B981";
      case "topaz":
        return "#D946EF";
      case "amethyst":
        return "#EC4899";
      case "ruby":
        return "#FBBF24";
      case "citrine":
        return "#06B6D4";
      case "diamond":
        return "#14B8A6"; 
      case "quartz":
        return "#6366F1";
      default:
        return "#888888";
    }
  };

  // Calculate color based on category
  const nodeColor = getColorForCategory(category);

  // Set default styles for the node - making it square shaped
  const nodeStyle = {
    borderColor: nodeColor,
    borderWidth: selected ? "2px" : "1px",
    backgroundColor: `${nodeColor}10`,
    boxShadow: `0 0 8px ${nodeColor}40`,
    padding: "10px",
    borderRadius: "6px",
    width: "150px", // Fixed width for square shape
    height: "150px", // Fixed height for square shape
  };

  // Get correct label for the node type
  const nodeType = category ? NODE_TYPES[category] || "Default" : "Default";

  // Format the node name
  const formatNodeName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div style={nodeStyle} className="flex flex-col justify-between">
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: nodeColor }}
      />
      
      <div className="flex flex-col gap-1">
        <div className="text-xs text-gray-500 flex justify-between">
          <span>{nodeType}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
        
        <div className="flex items-center">
          <h3 className="text-sm font-semibold">{formatNodeName(label)}</h3>
        </div>
        
        <div className="text-[10px] text-gray-500">{code}</div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: nodeColor }}
      />
    </div>
  );
}
