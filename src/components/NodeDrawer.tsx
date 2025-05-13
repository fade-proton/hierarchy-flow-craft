
import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { X } from 'lucide-react';
import { HierarchyNodeData } from '@/types/node';

interface NodeDrawerProps {
  node: Node<HierarchyNodeData>;
  onClose: () => void;
  onUpdate: (node: Node<HierarchyNodeData>) => void;
}

const NodeDrawer: React.FC<NodeDrawerProps> = ({ node, onClose, onUpdate }) => {
  // Initialize form state with node data
  const [label, setLabel] = useState(node.data.label);
  const [category, setCategory] = useState(node.data.category);
  const [code, setCode] = useState(node.data.code);
  const [isActive, setIsActive] = useState(node.data.isActive);
  const [description, setDescription] = useState(node.data.description || '');
  const [level, setLevel] = useState(node.data.level);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create updated node with form values
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        label,
        category,
        code,
        isActive,
        description,
        level
      }
    };
    
    // Call the update handler
    onUpdate(updatedNode);
    onClose();
  };
  
  return (
    <div className="fixed right-0 top-0 w-80 h-full bg-white dark:bg-gray-800 shadow-lg p-4 z-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold dark:text-white">Edit Node</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={18} className="dark:text-white" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="default">Default</option>
              <option value="process">Process</option>
              <option value="decision">Decision</option>
              <option value="input">Input</option>
              <option value="output">Output</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Level (Read Only)
            </label>
            <input
              type="number"
              value={level}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>
          
          <div className="pt-4 flex space-x-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NodeDrawer;
