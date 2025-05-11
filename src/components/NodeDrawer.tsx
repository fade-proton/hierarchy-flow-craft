
import React, { useState, useEffect } from "react";
import { Node } from "@xyflow/react";
import { X, Info } from "lucide-react";
import { HierarchyNodeData } from "./HierarchyNode";
import { HIERARCHY_LEVELS } from "@/lib/constants";

interface NodeDrawerProps {
  node: Node<HierarchyNodeData>;
  onUpdate: (node: Node<HierarchyNodeData>) => void;
  onClose: () => void;
}

// Helper to generate ID for form fields
const generateFieldId = (fieldName: string, nodeId: string) => {
  return `${fieldName}-${nodeId}`;
};

const NodeDrawer: React.FC<NodeDrawerProps> = ({ node, onUpdate, onClose }) => {
  // Component state
  const [label, setLabel] = useState(node.data.label || "");
  const [description, setDescription] = useState(node.data.description || "");
  const [code, setCode] = useState(node.data.code || "");
  const [isActive, setIsActive] = useState(node.data.isActive || false);
  const [content, setContent] = useState(node.data.content || "");
  const [category, setCategory] = useState(node.data.category || "default");
  
  // Update local state when node changes
  useEffect(() => {
    setLabel(node.data.label || "");
    setDescription(node.data.description || "");
    setCode(node.data.code || "");
    setIsActive(node.data.isActive || false);
    setContent(node.data.content || "");
    setCategory(node.data.category || "default");
  }, [node]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update the node with new data
    onUpdate({
      ...node,
      data: {
        ...node.data,
        label,
        description,
        code,
        isActive,
        content,
        category
      }
    });
  };
  
  // Get level name from constants
  const getLevelName = (level: number): string => {
    return HIERARCHY_LEVELS[level] || `Level ${level}`;
  };
  
  return (
    <div className="absolute top-0 right-0 h-full w-72 bg-[#1A1F2C] border-l border-gray-700 shadow-lg overflow-y-auto z-10">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Node Properties</h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="space-y-2">
          <label 
            htmlFor={generateFieldId("label", node.id)}
            className="block text-sm font-medium text-gray-400"
          >
            Name
          </label>
          <input
            id={generateFieldId("label", node.id)}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 bg-[#242938] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#0FA0CE] focus:border-[#0FA0CE]"
          />
        </div>
        
        <div className="space-y-2">
          <label 
            htmlFor={generateFieldId("code", node.id)}
            className="block text-sm font-medium text-gray-400"
          >
            Code
          </label>
          <input
            id={generateFieldId("code", node.id)}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 bg-[#242938] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#0FA0CE] focus:border-[#0FA0CE]"
          />
        </div>
        
        <div className="space-y-2">
          <label 
            htmlFor={generateFieldId("type", node.id)}
            className="block text-sm font-medium text-gray-400"
          >
            Node Type
          </label>
          <select
            id={generateFieldId("type", node.id)}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-[#242938] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#0FA0CE] focus:border-[#0FA0CE]"
          >
            <option value="default">Default</option>
            <option value="input">User Input</option>
            <option value="action">Action</option>
            <option value="config">Configuration</option>
            <option value="headquarters">Headquarters</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label 
            htmlFor={generateFieldId("description", node.id)}
            className="block text-sm font-medium text-gray-400"
          >
            Description
          </label>
          <textarea
            id={generateFieldId("description", node.id)}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-[#242938] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#0FA0CE] focus:border-[#0FA0CE]"
          />
        </div>
        
        <div className="space-y-2">
          <label 
            htmlFor={generateFieldId("content", node.id)}
            className="block text-sm font-medium text-gray-400"
          >
            Additional Content
          </label>
          <textarea
            id={generateFieldId("content", node.id)}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-[#242938] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#0FA0CE] focus:border-[#0FA0CE]"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            id={generateFieldId("active", node.id)}
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-[#0FA0CE] bg-[#242938] border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-[#0FA0CE]"
          />
          <label 
            htmlFor={generateFieldId("active", node.id)}
            className="text-sm font-medium text-gray-400"
          >
            Node Active
          </label>
        </div>
        
        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Info size={14} className="text-gray-400" />
            <h4 className="text-sm font-medium text-gray-400">Node Information</h4>
          </div>
          
          <div className="space-y-1 text-xs bg-[#242938] p-3 rounded-md">
            <p className="text-gray-300">
              <span className="text-gray-400">ID:</span> {node.id}
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Level:</span> {node.data.level} ({getLevelName(node.data.level || 0)})
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Position:</span> x:{Math.round(node.position.x)}, y:{Math.round(node.position.y)}
            </p>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-[#0FA0CE] text-white rounded-md hover:bg-[#0C8CAE] transition-colors"
          >
            Update Node
          </button>
        </div>
      </form>
    </div>
  );
};

export default NodeDrawer;
