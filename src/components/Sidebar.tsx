
import { DragEvent } from "react";
import { HIERARCHY_LEVELS } from "@/lib/constants";

export const Sidebar = () => {
  // Handle the drag start event for dragging from sidebar to canvas
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    level: number,
    nodeType: string
  ) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.setData("application/reactflow/level", String(level));
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Hierarchy Levels</h2>
      <p className="text-sm text-gray-500 mb-4">
        Drag and drop levels onto the canvas to create your hierarchy.
      </p>
      
      <div className="space-y-2">
        {Object.entries(HIERARCHY_LEVELS).map(([level, label]) => (
          <div
            key={level}
            className="p-3 border border-gray-200 rounded-md shadow-sm cursor-move bg-white hover:shadow-md transition-shadow duration-200"
            draggable
            onDragStart={(event) =>
              onDragStart(event, parseInt(level), "hierarchyNode")
            }
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: getHierarchyColor(parseInt(level))
            }}
          >
            <div className="text-sm font-medium">{label}</div>
            <div className="text-xs text-gray-500">Level {level}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-sm font-medium mb-2">Instructions</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Drag levels from sidebar to canvas</li>
          <li>• Connect nodes by dragging from handles</li>
          <li>• Delete nodes with Backspace key</li>
          <li>• Pan canvas by dragging empty space</li>
          <li>• Zoom with mouse wheel</li>
        </ul>
      </div>
    </aside>
  );
};

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
