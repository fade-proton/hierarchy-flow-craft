
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Node } from "@xyflow/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { HierarchyNodeData } from "./HierarchyNode";

interface NodeDrawerProps {
  node: Node<HierarchyNodeData>;
  onUpdate: (node: Node<HierarchyNodeData>) => void;
  onClose: () => void;
}

const NodeDrawer = ({ node, onUpdate, onClose }: NodeDrawerProps) => {
  const [nodeData, setNodeData] = useState<HierarchyNodeData>({...node.data});
  
  // Update local state when selected node changes
  useEffect(() => {
    setNodeData({...node.data});
  }, [node]);
  
  const handleUpdate = () => {
    const updatedNode = {
      ...node,
      data: nodeData
    };
    onUpdate(updatedNode);
  };
  
  // Handle property changes
  const handleChange = (field: keyof HierarchyNodeData, value: any) => {
    setNodeData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Save changes when drawer is closed or when any property changes
  useEffect(() => {
    handleUpdate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeData]);

  return (
    <div className="absolute top-0 right-0 h-full w-72 bg-[#1A1F2C] border-l border-gray-700 p-4 overflow-y-auto z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white">Node Settings</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={18} />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Node Type
          </label>
          <div className="text-sm bg-[#242938] text-white border border-gray-700 p-2 rounded">
            {nodeData.category || "Default"}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Label
          </label>
          <Input
            value={nodeData.label || ""}
            onChange={(e) => handleChange("label", e.target.value)}
            className="bg-[#242938] text-white border-gray-700"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <Textarea
            value={nodeData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className="bg-[#242938] text-white border-gray-700 min-h-[80px]"
            placeholder="Node description..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Level
          </label>
          <div className="text-sm bg-[#242938] text-white border border-gray-700 p-2 rounded">
            {nodeData.level !== undefined ? nodeData.level : 0}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Automatically calculated based on connections
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Process Active
          </label>
          <Switch
            checked={nodeData.isActive || false}
            onCheckedChange={(checked) => handleChange("isActive", checked)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Content
          </label>
          <Textarea
            value={nodeData.content || ""}
            onChange={(e) => handleChange("content", e.target.value)}
            className="bg-[#242938] text-white border-gray-700 min-h-[120px]"
            placeholder="Additional content or configuration..."
          />
        </div>
      </div>
    </div>
  );
};

export default NodeDrawer;
