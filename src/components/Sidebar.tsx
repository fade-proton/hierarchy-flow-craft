
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NodeCategory = {
  name: string;
  title: string;
  icon: React.ElementType;
  color: string;
  expanded: boolean;
};

type DefaultNodeSettings = {
  name: string;
  code: string;
  isActive: boolean;
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
  
  const [defaultSettings, setDefaultSettings] = useState<DefaultNodeSettings>({
    name: "New Node",
    code: "NODE",
    isActive: true,
  });

  // Handle the drag start event for dragging from sidebar to canvas
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    nodeType: string,
    entityName: string,
    category?: string
  ) => {
    // Include default settings in the drag data
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.setData("application/reactflow/entityName", 
      defaultSettings.name !== "New Node" ? 
      `${defaultSettings.name} (${entityName})` : 
      entityName
    );
    event.dataTransfer.setData("application/reactflow/code", defaultSettings.code);
    event.dataTransfer.setData("application/reactflow/isActive", defaultSettings.isActive.toString());
    
    if (category) {
      event.dataTransfer.setData("application/reactflow/category", category);
    }
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSettingsChange = (field: keyof DefaultNodeSettings, value: string | boolean) => {
    setDefaultSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <aside className="w-64 bg-[#111111] text-white p-4 overflow-y-auto rounded-lg shadow-lg border border-gray-700 m-4 absolute z-10 left-0 top-0 bottom-0">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <LayoutDashboard size={18} className="mr-2" />
        Flow Builder
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Create and connect nodes to build your workflow.
      </p>
      
      {/* Default Node Settings Box */}
      <div className="bg-gray-800 p-3 rounded-md mb-4">
        <h3 className="text-sm font-medium mb-2">Default Node Settings</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Name</label>
            <Input 
              value={defaultSettings.name}
              onChange={(e) => handleSettingsChange("name", e.target.value)}
              className="h-7 bg-gray-700 border-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Code</label>
            <Input 
              value={defaultSettings.code}
              onChange={(e) => handleSettingsChange("code", e.target.value)}
              className="h-7 bg-gray-700 border-gray-600 text-sm"
            />
          </div>
          <div className="flex items-center">
            <label className="text-xs text-gray-400 flex-1">Active</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`h-6 text-xs ${defaultSettings.isActive ? 'bg-green-700' : 'bg-gray-700'}`}
              onClick={() => handleSettingsChange("isActive", !defaultSettings.isActive)}
            >
              {defaultSettings.isActive ? "Yes" : "No"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Node Categories - Now using square shapes */}
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Gem Node Types</h3>
        
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <div 
              key={category.name}
              className={cn(
                "p-2 border rounded-md cursor-move aspect-square",
                "flex flex-col items-center justify-center transition-all duration-300"
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
              <category.icon size={24} className="mb-2" style={{ color: category.color }} />
              <div className="text-xs text-center" style={{ color: category.color }}>{category.title}</div>
            </div>
          ))}
        </div>
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
