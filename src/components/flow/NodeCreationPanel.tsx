
import { useState } from "react";
import { Panel } from "@xyflow/react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFlow } from "@/context/FlowContext";

export const NodeCreationPanel = () => {
  const [entityName, setEntityName] = useState("");
  const { reactFlowInstance, createNode } = useFlow();

  return (
    <Panel position="top-left" className="bg-[#1A1F2C] border border-gray-700 p-4 rounded-md shadow-md">
      <div className="flex flex-col space-y-3">
        <h3 className="text-sm font-bold text-white">Add New Entity</h3>
        <div className="flex items-center space-x-2">
          <Input 
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            placeholder="Entity Name"
            className="text-sm bg-[#242938] text-white border-gray-700"
          />
          <button
            className="p-2 bg-[#0FA0CE] text-white rounded hover:bg-[#0b8cba] transition-colors"
            onClick={() => {
              if (entityName.trim() && reactFlowInstance) {
                createNode(entityName, {
                  x: Math.random() * 500,
                  y: Math.random() * 500
                });
                setEntityName("");
              }
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </Panel>
  );
};
