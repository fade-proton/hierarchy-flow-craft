
import { Position, Handle } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";

export type HierarchyNodeData = {
  label: string;
  level: number;
  category?: string;
  code?: string;
  description?: string;
};

const levelColors = [
  "bg-hierarchy-0 text-white",
  "bg-hierarchy-1 text-white",
  "bg-hierarchy-2 text-white",
  "bg-hierarchy-3 text-white",
  "bg-hierarchy-4 text-white", 
  "bg-hierarchy-5 text-white",
  "bg-hierarchy-6 text-white"
];

const categoryColors: Record<string, string> = {
  default: "bg-blue-500 text-white",
  input: "bg-orange-500 text-white",
  action: "bg-purple-500 text-white",
  config: "bg-sky-500 text-white"
};

const HierarchyNode = ({ id, data, selected }: { id: string, data: HierarchyNodeData, selected: boolean }) => {
  const level = data.level;
  const levelColor = levelColors[Math.min(level, levelColors.length - 1)];
  const categoryColor = data.category && categoryColors[data.category] 
    ? categoryColors[data.category] 
    : categoryColors.default;
    
  return (
    <div className={`px-4 py-2 rounded-lg shadow-md border-2 transition-all min-w-[180px] ${selected ? 'border-sky-400 animate-glow' : 'border-transparent'}`}>
      <div className="flex items-center justify-between mb-1">
        <Badge variant="outline" className={`text-xs ${levelColor}`}>Level {level}</Badge>
        
        {data.category && (
          <Badge variant="outline" className={`text-xs ${categoryColor}`}>{data.category}</Badge>
        )}
      </div>
      
      <div className="font-medium text-sm mb-1">{data.label}</div>
      
      {data.code && (
        <div className="text-xs text-gray-500 mb-1">Code: {data.code}</div>
      )}
      
      {data.description && data.description.length > 0 && (
        <div className="text-xs text-gray-500 truncate max-w-[160px]" title={data.description}>
          {data.description}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-2 bg-sky-500 border-none rounded-sm"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-2 bg-sky-500 border-none rounded-sm"
      />
    </div>
  );
};

export default HierarchyNode;
