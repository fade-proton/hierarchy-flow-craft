
import { Panel } from "@xyflow/react";
import { ZoomIn, ZoomOut, Maximize2, Map } from "lucide-react";
import { useFlow } from "@/context/FlowContext";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

interface ZoomControlsProps {
  showMinimap: boolean;
  setShowMinimap: (show: boolean) => void;
}

export const ZoomControls = ({ showMinimap, setShowMinimap }: ZoomControlsProps) => {
  const { reactFlowInstance } = useFlow();

  const handleZoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  };

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: false });
    }
  };

  const toggleMinimap = () => {
    setShowMinimap(!showMinimap);
  };

  return (
    <Panel position="bottom-left" className="bg-[#1A1F2C] border border-gray-700 p-2 rounded-md shadow-md">
      <div className="flex space-x-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-[#2A304A] border-[#0FA0CE] text-white hover:bg-[#3A405A]"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </Button>
        <Button
          variant="outline" 
          size="icon"
          onClick={handleZoomOut}
          className="bg-[#2A304A] border-[#0FA0CE] text-white hover:bg-[#3A405A]"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleFitView}
          className="bg-[#2A304A] border-[#0FA0CE] text-white hover:bg-[#3A405A]"
          title="Fit View"
        >
          <Maximize2 size={16} />
        </Button>
        <Toggle 
          pressed={showMinimap}
          onPressedChange={toggleMinimap}
          className="bg-[#2A304A] border border-[#0FA0CE] text-white hover:bg-[#3A405A]"
          title="Toggle Minimap"
        >
          <Map size={16} />
        </Toggle>
      </div>
    </Panel>
  );
};
