
import { Node } from "@xyflow/react";

// Define the data structure for hierarchy nodes
export interface HierarchyNodeData {
  label: string;
  level: number;
  category: string;
  code: string;
  isActive: boolean;
  description?: string;
  content?: string;
}

// Define the props type for the HierarchyNode component
export interface NodeProps<T = any> {
  id: string;
  data: T;
  selected?: boolean;
}
