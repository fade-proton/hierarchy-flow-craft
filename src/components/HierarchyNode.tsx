
import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Settings } from "lucide-react";

// Define the correct type for our node data
export interface HierarchyNodeData {
  label: string;
  level?: number;
  color?: string;
}

// Fix the typing to match what ReactFlow expects
const HierarchyNode = memo(({ id, data, selected }: NodeProps<HierarchyNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || "Entity");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Handle double click to edit the label
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };

  // Get border color based on hierarchy level - we'll keep this for visual differentiation
  const getBorderColor = () => {
    const level = data?.level !== undefined ? data.level : 0;
    return getHierarchyColor(level);
  };
  
  return (
    <>
      <div 
        className={cn(
          "px-4 py-4 shadow-md rounded-none border-l-4 w-[150px] h-[150px]", // Square shape
          "bg-[#1A1F2C] text-white", // Dark background
          "hover:bg-[#242938] transition-colors", // Hover effect
          selected ? "border-[#0FA0CE]" : "border-gray-700", // Selection styling
        )}
        style={{ borderLeftColor: getBorderColor() }}
      >
        <div className="flex flex-col h-full">
          {isEditing ? (
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#242938] text-white border-none focus:outline-none rounded-sm"
              autoFocus
            />
          ) : (
            <div
              className="text-center font-medium text-white flex-grow"
              onDoubleClick={handleDoubleClick}
            >
              {label}
            </div>
          )}
          
          <div className="mt-auto flex justify-end">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <button 
                  className="p-1 rounded-sm hover:bg-[#0FA0CE] text-gray-300 hover:text-white transition-colors focus:outline-none" 
                  onClick={() => setDrawerOpen(true)}
                >
                  <Settings size={18} />
                </button>
              </DrawerTrigger>
              <DrawerContent className="bg-[#1A1F2C] text-white border-t-2 border-[#0FA0CE]">
                <DrawerHeader>
                  <DrawerTitle>Entity Settings: {label}</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Entity Name</label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full bg-[#242938] text-white border border-gray-700 p-2 rounded-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Level: {data?.level !== undefined ? data.level : 0}</label>
                    <div className="text-sm text-gray-400">
                      (Automatically calculated based on connections)
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
        
        {/* Handles for connections */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-2 h-2 bg-[#0FA0CE] border-2 border-white rounded-full"
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2 h-2 bg-[#0FA0CE] border-2 border-white rounded-full"
          isConnectable={true}
        />
      </div>
    </>
  );
});

HierarchyNode.displayName = "HierarchyNode";

// Helper function to get hierarchy color based on level
function getHierarchyColor(level: number): string {
  const colors: Record<number, string> = {
    0: "#4B69FF", // Blue
    1: "#5D5AFF", // Blue-Purple
    2: "#7152FF", // Purple
    3: "#8B42FF", // Purple-Violet
    4: "#A32EFF", // Violet
    5: "#C71AFD", // Pink-Purple
    6: "#E816FA", // Pink
  };

  return colors[level] || colors[0];
}

export default HierarchyNode;
