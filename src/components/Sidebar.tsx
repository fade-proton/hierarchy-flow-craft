
import { DragEvent, useState } from "react";
import { 
  Plus, 
  HelpCircle, 
  LayoutDashboard,
  Diamond,
  Sparkles,
  GalleryVerticalEnd,
  Gem,
  CrownIcon,
  PanelTop,
  Star,
  Sun,
  Hexagon,
  Snowflake
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NODE_TYPES } from "@/lib/constants";

type NodeCategory = {
  name: string;
  title: string;
  icon: React.ElementType;
  color: string;
  expanded: boolean;
};

export const Sidebar = () => {
  const [categories, setCategories] = useState<NodeCategory[]>([
    { name: "jasper", title: "Jasper", icon: GalleryVerticalEnd, color: "#F97316", expanded: true },
    { name: "gold", title: "Gold", icon: Sparkles, color: "#8B5CF6", expanded: true },
    { name: "sapphire", title: "Sapphire", icon: Snowflake, color: "#0EA5E9", expanded: true },
    { name: "emerald", title: "Emerald", icon: Gem, color: "#10B981", expanded: true },
    { name: "topaz", title: "Topaz", icon: Star, color: "#D946EF", expanded: true },
    { name: "amethyst", title: "Amethyst", icon: PanelTop, color: "#EC4899", expanded: true },
    { name: "ruby", title: "Ruby", icon: Hexagon, color: "#FBBF24", expanded: true },
    { name: "citrine", title: "Citrine", icon: Sun, color: "#06B6D4", expanded: true },
    { name: "diamond", title: "Diamond", icon: Diamond, color: "#14B8A6", expanded: true },
    { name: "quartz", title: "Quartz", icon: CrownIcon, color: "#6366F1", expanded: true },
  ]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Handle the drag start event for dragging from sidebar to canvas
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    nodeType: string,
    entityName: string,
    category?: string
  ) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.setData("application/reactflow/entityName", entityName);
    if (category) {
      event.dataTransfer.setData("application/reactflow/category", category);
    }
    event.dataTransfer.effectAllowed = "move";
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setIsOpen(true);
  };

  // Return the collapsed sidebar with only icons
  const renderCollapsedSidebar = () => {
    return (
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 p-2 bg-[#111111] rounded-l-lg border-l border-t border-b border-gray-700 shadow-xl z-40">
        {categories.map((category) => (
          <div 
            key={`icon-${category.name}`}
            className="relative cursor-pointer transition-transform hover:scale-110"
            onClick={() => handleCategoryClick(category.name)}
          >
            <div
              className="p-3 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: `${category.color}20`, 
                boxShadow: `0 0 15px ${category.color}70` 
              }}
            >
              <category.icon 
                size={32} 
                style={{ color: category.color }} 
              />
            </div>
            <div 
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#111111]"
              style={{ backgroundColor: category.color }}
            ></div>
          </div>
        ))}
      </div>
    );
  };

  // Sheet content based on the selected category
  const renderSheetContent = () => {
    if (!selectedCategory) return null;
    
    const category = categories.find(c => c.name === selectedCategory);
    if (!category) return null;

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4 border-b border-gray-700">
          <category.icon size={24} className="mr-2" style={{ color: category.color }} />
          <h2 className="text-lg font-semibold">{category.title} Nodes</h2>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
          <p className="text-sm text-gray-400 mb-4">
            Drag a {category.title} node to the canvas to add it to your workflow.
          </p>
          
          <div 
            className={cn(
              "p-4 mt-2 border rounded-md cursor-move transition-all duration-300 flex items-center justify-between"
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
            <div className="text-sm" style={{ color: category.color }}>{`New ${category.title}`}</div>
            <Plus size={14} style={{ color: category.color }} />
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Properties</h3>
            <ul className="text-xs text-gray-400 space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: category.color }}></span>
                {NODE_TYPES[category.name] || category.title} type node
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: category.color }}></span>
                Can connect to all node types
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: category.color }}></span>
                Supports custom properties
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-700">
          <div className="flex items-center">
            <HelpCircle size={14} className="mr-1 text-gray-400" />
            <span className="text-xs text-gray-400">Need help with {category.title} nodes?</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Collapsed sidebar with icons */}
      {!isOpen && renderCollapsedSidebar()}
      
      {/* Expandable drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="bg-[#111111] text-white border-l border-gray-700 p-0 w-80">
          {renderSheetContent()}
        </SheetContent>
      </Sheet>
    </>
  );
};
