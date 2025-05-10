
import { useState, useRef } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { FileText } from "lucide-react";
import { Textarea } from "./ui/textarea";

// Define the data structure for DocumentationNode
export interface DocumentationNodeData {
  content: string;
  [key: string]: any; // Add index signature to allow any string key
}

const DocumentationNode = ({ data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data?.content || "Add documentation here...");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle double-click to start editing
  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };
  
  // Handle saving the edited content
  const handleBlur = () => {
    setIsEditing(false);
    // Here you would typically update the node data in your state management
  };
  
  // Handle key press events
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsEditing(false);
    }
  };
  
  return (
    <div
      className={`p-4 border-2 rounded-xl bg-[#2A304A] min-w-[250px] max-w-[400px] shadow-lg ${
        selected ? "border-[#9b87f5]" : "border-[#6E59A5]"
      }`}
      style={{
        boxShadow: selected ? "0 0 10px #9b87f570" : "0 0 10px #6E59A570",
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center text-white text-sm font-medium">
          <FileText size={16} className="mr-2 text-[#9b87f5]" />
          Documentation
        </div>
      </div>
      
      {isEditing ? (
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[100px] bg-[#1A1F2C] text-white border border-gray-600 rounded p-2 text-sm"
          autoFocus
        />
      ) : (
        <div 
          className="text-white text-sm whitespace-pre-wrap p-2 min-h-[100px] cursor-text overflow-y-auto max-h-[200px] bg-[#1A1F2C] rounded border border-gray-700"
          onDoubleClick={handleDoubleClick}
        >
          {content}
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 rounded-full border-2 bg-[#2A304A]"
        style={{ borderColor: "#9b87f5" }}
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 rounded-full border-2 bg-[#2A304A]"
        style={{ borderColor: "#9b87f5" }}
        isConnectable={true}
      />
    </div>
  );
};

export default DocumentationNode;
