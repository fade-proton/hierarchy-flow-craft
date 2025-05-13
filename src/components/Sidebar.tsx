
import { DragEvent, useState, useRef, useEffect } from "react";
import { 
  GalleryVerticalEnd,
  Sparkles,
  Snowflake,
  Gem,
  Star,
  PanelTop,
  Hexagon,
  Sun,
  Diamond,
  CrownIcon,
  Minimize2,
  Maximize2,
  Move
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NodeCategory = {
  name: string;
  title: string;
  icon: React.ElementType;
  color: string;
};

export const Sidebar = () => {
  const [categories] = useState<NodeCategory[]>([
    { name: "jasper", title: "Jasper", icon: GalleryVerticalEnd, color: "#F97316" },
    { name: "gold", title: "Gold", icon: Sparkles, color: "#8B5CF6" },
    { name: "sapphire", title: "Sapphire", icon: Snowflake, color: "#0EA5E9" },
    { name: "emerald", title: "Emerald", icon: Gem, color: "#10B981" },
    { name: "topaz", title: "Topaz", icon: Star, color: "#D946EF" },
    { name: "amethyst", title: "Amethyst", icon: PanelTop, color: "#EC4899" },
    { name: "ruby", title: "Ruby", icon: Hexagon, color: "#FBBF24" },
    { name: "citrine", title: "Citrine", icon: Sun, color: "#06B6D4" },
    { name: "diamond", title: "Diamond", icon: Diamond, color: "#14B8A6" },
    { name: "quartz", title: "Quartz", icon: CrownIcon, color: "#6366F1" },
  ]);
  
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle dragging behavior for the floating sidebar
  const handleMouseDown = (e: React.MouseEvent) => {
    if (sidebarRef.current) {
      setIsDragging(true);
      const rect = sidebarRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Add and remove event listeners for dragging
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Handle the drag start event for dragging from sidebar to canvas
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    nodeType: string,
    entityName: string,
    category?: string
  ) => {
    // Set drag data
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.setData("application/reactflow/entityName", entityName);
    event.dataTransfer.setData("application/reactflow/code", "NODE");
    event.dataTransfer.setData("application/reactflow/isActive", "true");
    
    if (category) {
      event.dataTransfer.setData("application/reactflow/category", category);
    }
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div 
      ref={sidebarRef}
      className={cn(
        "absolute z-10 flex shadow-lg border border-gray-700 rounded-lg bg-[#111111]",
        minimized ? "w-12" : "max-w-[360px]",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{ 
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      {/* Handle for dragging */}
      <div 
        className="p-2 flex items-center justify-center cursor-grab text-gray-400 hover:text-white"
        onMouseDown={handleMouseDown}
      >
        <Move size={16} />
      </div>
      
      {/* Toggle minimize/maximize */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-white self-start mt-2"
        onClick={() => setMinimized(!minimized)}
      >
        {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
      </Button>
      
      {/* Node categories */}
      <div className={cn(
        "flex flex-col gap-2 p-2",
        minimized ? "items-center" : ""
      )}>
        {categories.map((category) => (
          <div 
            key={category.name}
            className={cn(
              "p-2 border rounded-[15px] cursor-move aspect-square",
              "flex flex-col items-center justify-center transition-all duration-300"
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
            <category.icon size={24} className="mb-1" style={{ color: category.color }} />
            {!minimized && (
              <div className="text-xs text-center" style={{ color: category.color }}>
                {category.title}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
