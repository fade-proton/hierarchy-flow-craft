
import { DragEvent, useState } from "react";
import { Input } from "./ui/input";
import { Plus, HelpCircle, LayoutDashboard } from "lucide-react";

export const Sidebar = () => {
  const [newEntityName, setNewEntityName] = useState("");
  
  // Handle the drag start event for dragging from sidebar to canvas
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    nodeType: string,
    entityName: string
  ) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.setData("application/reactflow/entityName", entityName);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-64 bg-[#1A1F2C] text-white border-r border-gray-700 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <LayoutDashboard size={18} className="mr-2" />
        Hierarchy Builder
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Create entities and drag them onto the canvas to build your hierarchy.
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
      
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <HelpCircle size={14} className="mr-1" />
          Instructions
        </h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Enter an entity name and drag to canvas</li>
          <li>• Connect nodes by dragging between handles</li>
          <li>• Double-click on node text to edit</li>
          <li>• Click on settings icon for more options</li>
          <li>• Levels are automatically assigned based on connections</li>
          <li>• Root nodes start at level 0</li>
          <li>• Delete nodes with Backspace/Delete key</li>
          <li>• Save your hierarchy for later</li>
        </ul>
      </div>
    </aside>
  );
};
