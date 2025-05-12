
import { DragEvent, useState } from "react";
import { Input } from "./ui/input";
import { 
  Plus, 
  HelpCircle, 
  LayoutDashboard, 
  MousePointer,
  Workflow,
  Settings,
  ChevronDown,
  ChevronRight,
  Database,
  FileCode,
  MessageCircle,
  Zap,
  Target,
  Shield
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
  const [newEntityName, setNewEntityName] = useState("");
  const [categories, setCategories] = useState<NodeCategory[]>([
    { name: "input", title: "User Input", icon: MousePointer, color: "#F97316", expanded: true },
    { name: "action", title: "Action", icon: Workflow, color: "#8B5CF6", expanded: true },
    { name: "config", title: "Configuration", icon: Settings, color: "#0EA5E9", expanded: true },
    { name: "data", title: "Database", icon: Database, color: "#10B981", expanded: true },
    { name: "integration", title: "Integration", icon: FileCode, color: "#D946EF", expanded: true },
    { name: "communication", title: "Communication", icon: MessageCircle, color: "#EC4899", expanded: true },
    { name: "trigger", title: "Trigger", icon: Zap, color: "#FBBF24", expanded: false },
    { name: "target", title: "Target", icon: Target, color: "#06B6D4", expanded: false },
    { name: "security", title: "Security", icon: Shield, color: "#14B8A6", expanded: false },
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
      
      <div className="mb-4 p-3 border border-gray-700 rounded-md bg-[#242938]">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <Plus size={14} className="mr-1" />
          New Entity
        </h3>
        <div className="flex items-center space-x-2">
          <Input
            value={newEntityName}
            onChange={(e) => setNewEntityName(e.target.value)}
            placeholder="Entity Name"
            className="text-sm bg-[#1A1F2C] border-gray-700 text-white"
          />
        </div>
        
        <div 
          className="mt-3 p-3 border border-[#0FA0CE] rounded-md bg-[#2A304A] cursor-move flex items-center justify-between"
          draggable={newEntityName.trim().length > 0}
          onDragStart={(event) => 
            onDragStart(event, "hierarchyNode", newEntityName)
          }
          style={{
            opacity: newEntityName.trim().length > 0 ? 1 : 0.5,
          }}
        >
          <div>
            <div className="text-sm font-medium">{newEntityName || "Unnamed Entity"}</div>
            <div className="text-xs text-gray-400">Drag to canvas</div>
          </div>
          <Plus size={16} className="text-[#0FA0CE]" />
        </div>
      </div>
      
      {/* Node Categories */}
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Node Types</h3>
        
        {categories.map((category, index) => (
          <div key={category.name} className="mb-2">
            <div 
              className="flex items-center text-sm p-2 hover:bg-[#242938] rounded-md cursor-pointer"
              onClick={() => toggleCategory(index)}
            >
              {category.expanded ? 
                <ChevronDown size={16} className="mr-1" /> : 
                <ChevronRight size={16} className="mr-1" />
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
