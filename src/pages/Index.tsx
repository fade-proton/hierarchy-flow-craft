
import { ReactFlowProvider } from "@xyflow/react";
import { FlowBuilder } from "@/components/FlowBuilder";

const Index = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ReactFlowProvider>
        <FlowBuilder />
      </ReactFlowProvider>
    </div>
  );
};

export default Index;
