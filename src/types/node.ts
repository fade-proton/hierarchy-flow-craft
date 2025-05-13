
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
  [key: string]: unknown; // Add index signature to satisfy Record<string, unknown> constraint
}

// Define the props type for the HierarchyNode component
export interface NodeProps<T = any> {
  id: string;
  data: T;
  selected?: boolean;
}

// Type for extended Node to fix TypeScript errors
export type HierarchyNode = Node<HierarchyNodeData>;
