
import { FlowProvider } from "@/context/FlowContext";
import { Sidebar } from "./Sidebar";
import { MainFlowCanvas } from "./flow/MainFlowCanvas";

export const FlowBuilder = () => {
  return (
    <FlowProvider>
      <div className="flex h-full w-full">
        <Sidebar />
        <MainFlowCanvas />
      </div>
    </FlowProvider>
  );
};
