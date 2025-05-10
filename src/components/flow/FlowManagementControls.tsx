
import { Panel } from "@xyflow/react";
import { Save, Download, Upload } from "lucide-react";
import { useFlow } from "@/context/FlowContext";

export const FlowManagementControls = () => {
  const { saveFlow, loadFlow, exportFlow } = useFlow();

  return (
    <Panel position="top-right" className="bg-[#1A1F2C] border border-gray-700 p-4 rounded-md shadow-md">
      <div className="flex space-x-2">
        <button 
          onClick={saveFlow}
          className="flex items-center space-x-1 px-3 py-1 bg-[#2A304A] text-white text-xs rounded hover:bg-[#3A405A] transition-colors border border-[#0FA0CE]"
        >
          <Save size={12} />
          <span>Save</span>
        </button>
        <button 
          onClick={loadFlow}
          className="flex items-center space-x-1 px-3 py-1 bg-[#2A304A] text-white text-xs rounded hover:bg-[#3A405A] transition-colors border border-[#0FA0CE]"
        >
          <Download size={12} />
          <span>Load</span>
        </button>
        <button 
          onClick={exportFlow}
          className="flex items-center space-x-1 px-3 py-1 bg-[#2A304A] text-white text-xs rounded hover:bg-[#3A405A] transition-colors border border-[#0FA0CE]"
        >
          <Upload size={12} />
          <span>Export</span>
        </button>
      </div>
    </Panel>
  );
};
