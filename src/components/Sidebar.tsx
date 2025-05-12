
import { DragEvent, useState } from "react";
import { 
  Plus, 
  HelpCircle, 
  LayoutDashboard,
  Diamond,
  Sparkles,
  GalleryVerticalEnd,
  Gem,
  CrownIcon,
  PanelTop,
  Star,
  Sun,
  Hexagon,
  Snowflake
} from "lucide-react";
import { cn } from "@/lib/utils";

type NodeCategory = {
  name: string;
  title: string;
  icon: React.ElementType;
  color: string;
  expanded: boolean;
};

export const Sidebar = () => {
  const [categories, setCategories] = useState<NodeCategory[]>([
    { name: "jasper", title: "Jasper", icon: GalleryVerticalEnd, color: "#F97316", expanded: true },
    { name: "gold", title: "Gold", icon: Sparkles, color: "#8B5CF6", expanded: true },
    { name: "sapphire", title: "Sapphire", icon: Snowflake, color: "#0EA5E9", expanded: true },
    { name: "emerald", title: "Emerald", icon: Gem, color: "#10B981", expanded: true },
    { name: "topaz", title: "Topaz", icon: Star, color: "#D946EF", expanded: true },
    { name: "amethyst", title: "Amethyst", icon: PanelTop, color: "#EC4899", expanded: true },
    { name: "ruby", title: "Ruby", icon: Hexagon, color: "#FBBF24", expanded: true },
    { name: "citrine", title: "Citrine", icon: Sun, color: "#06B6D4", expanded: true },
    { name: "diamond", title: "Diamond", icon: Diamond, color: "#14B8A6", expanded: true },
    { name: "quartz", title: "Quartz", icon: CrownIcon, color: "#6366F1", expanded: true },
  ]);
  
  // Handle the drag start event for dragging from sidebar to canvas
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    nodeType: string,
    entityName: string,
    category?: string
  ) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.setData("application/reactflow/entityName", entityName);
    if (category) {
      event.dataTransfer.setData("application/reactflow/category", category);
    }
    event.dataTransfer.effectAllowed = "move";
  };

  const toggleCategory = (index: number) => {
    setCategories(prev => 
      prev.map((cat, idx) => 
        idx === index ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  return (
    <aside className="w-64 bg-[#111111] text-white border-r border-gray-700 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <LayoutDashboard size={18} className="mr-2" />
        Flow Builder
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Create and connect nodes to build your workflow.
      </p>
      
      {/* Node Categories */}
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Gem Node Types</h3>
        
        {categories.map((category, index) => (
          <div key={category.name} className="mb-2">
            <div 
              className="flex items-center text-sm p-2 hover:bg-[#242938] rounded-md cursor-pointer"
              onClick={() => toggleCategory(index)}
            >
              {category.expanded ? 
                <Plus size={16} className="mr-1" /> : 
                <Plus size={16} className="mr-1 transform rotate-45" />
              }
              <category.icon size={16} className="mr-2" style={{ color: category.color }} />
              {category.title}
            </div>
            
            {category.expanded && (
              <div 
                className={cn(
                  "p-2 mt-1 border rounded-md cursor-move",
                  "flex items-center justify-between transition-all duration-300"
                )}
                style={{ 
                  borderColor: category.color, 
                  backgroundColor: `${category.color}10`,
                  boxShadow: `0 0 8px ${category.color}40` 
                }}
                draggable={true}
                onDragStart={(event) => 
                  onDragStart(
                    event, 
                    "hierarchyNode", 
                    `New ${category.title}`, 
                    category.name
                  )
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 15px ${category.color}70`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 8px ${category.color}40`;
                }}
              >
                <div className="text-sm" style={{ color: category.color }}>{`New ${category.title}`}</div>
                <Plus size={14} style={{ color: category.color }} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <HelpCircle size={14} className="mr-1" />
          Instructions
        </h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Drag nodes from the sidebar to the canvas</li>
          <li>• Connect nodes by dragging between handles</li>
          <li>• Click on a node to open its settings</li>
          <li>• Use Ctrl+Z and Ctrl+Y to undo/redo</li>
          <li>• Zoom and pan using buttons or mouse</li>
          <li>• Save your workflow for later</li>
          <li>• Export as JSON for integration</li>
          <li>• Delete nodes with Delete/Backspace</li>
        </ul>
      </div>
    </aside>
  );
};
