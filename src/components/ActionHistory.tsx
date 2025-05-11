
import React from "react";
import { FlowAction } from "@/utils/flowUtils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActionHistoryProps {
  actions: FlowAction[];
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
};

export const ActionHistory: React.FC<ActionHistoryProps> = ({ actions }) => {
  // Format action for display
  const formatAction = (action: FlowAction): string => {
    switch(action.type) {
      case 'node-added':
        return `Added ${action.details.type || 'node'} "${action.details.name}"`;
      case 'node-removed':
        return `Removed node "${action.details.name}"`;
      case 'connection-created':
        return `Connected "${action.details.sourceName}" to "${action.details.targetName}"`;
      case 'connection-removed':
        return `Removed connection from "${action.details.sourceName}" to "${action.details.targetName}"`;
      case 'level-recalculated':
        return `Recalculated node levels (${action.details.nodeCount} nodes)`;
      default:
        return `Unknown action: ${action.type}`;
    }
  };

  return (
    <div className="bg-[#1A1F2C] border border-gray-700 p-3 rounded-md">
      <h3 className="text-sm font-medium mb-2 text-white">Action History</h3>
      
      <ScrollArea className="h-[250px] rounded-md border border-gray-700">
        {actions.length > 0 ? (
          <div className="p-2">
            {actions.map((action, idx) => (
              <div key={idx} className="text-xs text-gray-300 py-1 border-b border-gray-700 last:border-0">
                <span className="text-gray-400">[{formatTime(action.timestamp)}]</span> {formatAction(action)}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-gray-400">
            No actions recorded yet
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
