# Hierarchy Flow Visualization Tool

A powerful React-based interactive hierarchy visualization tool built with XY Flow, React, and TypeScript. This tool allows users to create, manage, and visualize hierarchical structures with customizable nodes, connections, and styling.

## Project Overview

This application provides an interactive canvas for creating organizational hierarchies, process flows, decision trees, and other hierarchical data visualizations. It features:

- Customizable node types with different colors based on categories
- Drag-and-drop node creation and connection
- Automatic hierarchy level calculation
- Dark/Light mode toggle
- Action history tracking
- Node metadata management

## Folder Structure

The project follows a component-based architecture with the following structure:

```
src/
├── components/          # UI Components
│   ├── ui/              # Base UI components from shadcn/ui
│   ├── HierarchyNode.tsx    # Custom node component for visualization
│   ├── ActionHistory.tsx    # Component to display flow actions history
│   ├── FlowBuilder.tsx      # Main flow builder canvas
│   ├── NodeDrawer.tsx       # Sidebar drawer for node configuration
│   ├── Sidebar.tsx          # Main application sidebar
│   └── ExportDialog.tsx     # Dialog for exporting flow data
│
├── lib/                 # Utility libraries
│   ├── utils.ts         # General utility functions
│   └── constants.ts     # Application constants (hierarchy levels, node types)
│
├── utils/               # Application utilities
│   └── flowUtils.ts     # Flow-specific utility functions
│
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx   # Hook for responsive design
│   └── use-toast.ts     # Hook for toast notifications
│
├── pages/               # Application pages
│   ├── Index.tsx        # Main application page
│   └── NotFound.tsx     # 404 page
│
└── App.tsx              # Root application component
```

## Key Components Explained

### HierarchyNode.tsx

The custom node component used in the flow visualization. Features:

- Visual representation of hierarchy nodes
- Dynamic styling based on node category and level
- Connection handles on all sides for flexible linking
- Status indicators and action buttons

### FlowBuilder.tsx

The main canvas component that renders the interactive flow. Manages:

- Node and edge state
- Drag and drop functionality
- Node selection and manipulation
- Background and controls

### ActionHistory.tsx

Displays a chronological log of actions performed on the flow:

- Node additions/removals
- Connection creations/deletions
- Level recalculations

### Sidebar.tsx

Main application sidebar containing:

- Node type selection
- Flow manipulation tools
- Theme toggle
- Action history

### NodeDrawer.tsx

Configuration panel for editing node properties:

- Label editing
- Category selection
- Description management
- Metadata configuration

## Core Features

### Node Types & Categories

Nodes can be categorized as:

- **default**: Standard nodes (Green)
- **input**: User input nodes (Orange)
- **action**: Action/process nodes (Purple)
- **config**: Configuration nodes (Blue)
- **headquarters**: Special HQ nodes (Red-Orange)

### Hierarchy Level Visualization

Nodes are visually distinguished by level:

- Level 0: National (Blue)
- Level 1: Regional (Blue-Purple)
- Level 2: Province (Purple)
- Level 3: Zone (Purple-Violet)
- Level 4: Area (Violet)
- Level 5: Parish (Pink-Purple)
- Level 6: Additional (Pink)

## Extending the Application

### Adding New Node Types

To add a new node type:

1. Update the `NODE_TYPES` object in `lib/constants.ts` with your new type
2. Add the corresponding color mapping in the `categoryColors` object in `HierarchyNode.tsx`
3. Create any custom rendering logic needed in the `HierarchyNode` component

Example:

```typescript
// In lib/constants.ts
export const NODE_TYPES: Record<string, string> = {
  // ... existing types
  newType: 'New Type Description',
};

// In HierarchyNode.tsx
const categoryColors: Record<string, string> = {
  // ... existing colors
  newType: "#3B82F6", // Blue for new type
};
```

### Adding Node Properties

To extend node data properties:

1. Update the `HierarchyNodeData` interface in `HierarchyNode.tsx`
2. Add UI controls in `NodeDrawer.tsx` for the new properties
3. Update the node rendering in `HierarchyNode.tsx` to display the new properties

Example:

```typescript
// In HierarchyNode.tsx
export interface HierarchyNodeData {
  // ... existing properties
  priority: number;  // New property
}

// Then add rendering logic for the new property in the component
```

### Customizing Node Styling

To modify the visual appearance of nodes:

1. Edit the `HierarchyNode.tsx` component to change the base styling
2. Adjust the color functions (`getBorderColor`, `getLevelColor`) for different visual indicators

### Adding New Actions

To implement new flow actions:

1. Update the `FlowAction` type in `utils/flowUtils.ts`
2. Add handling for the new action in the `formatAction` function in `ActionHistory.tsx`
3. Implement the action dispatch in the relevant component(s)

### Extending the Export Format

To add new export capabilities:

1. Update the export logic in `ExportDialog.tsx`
2. Add any new data transformations needed for your export format
3. Ensure the node data structure includes all needed fields for export

## Development Guidelines

- Use TypeScript for all new components and functions
- Follow the established component patterns for consistency
- Use the shadcn/ui components for UI elements
- Implement responsive design for all new features
- Update tests when adding or modifying features

## Technologies Used

- React
- TypeScript
- XY Flow for the flow visualization
- shadcn/ui components
- Tailwind CSS for styling
- Vite for build tooling

## Getting Started with Development

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8d13f75e-4a2e-4068-a913-4bf8fc9fcbe3

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8d13f75e-4a2e-4068-a913-4bf8fc9fcbe3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8d13f75e-4a2e-4068-a913-4bf8fc9fcbe3) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
