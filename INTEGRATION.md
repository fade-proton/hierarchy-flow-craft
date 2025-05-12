# Integrating Hierarchy Flow Visualization Tool into an Existing Next.js Application

This guide provides step-by-step instructions for integrating the Hierarchy Flow Visualization tool into an existing Next.js application. The integration process considers that your Next.js application may already have some required packages installed and its own routing system.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Component Integration](#component-integration)
- [Routing Integration](#routing-integration)
- [Styling Integration](#styling-integration)
- [Custom Configuration](#custom-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before integrating the tool, ensure your Next.js application meets these requirements:

- Next.js 13+ (App Router or Pages Router)
- React 18+
- TypeScript support
- NPM or Yarn package manager

## Installation

### Step 1: Install Required Dependencies

Check if your Next.js application already has these dependencies. Install only what's missing:

```bash
# Core dependencies for the flow visualization
npm install @xyflow/react

# UI component dependencies (if not using shadcn/ui already)
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
```

If you're already using shadcn/ui in your Next.js application, you may skip installing the UI component dependencies.

### Step 2: Configure CSS

Ensure your Next.js application has the necessary CSS imports:

1. Add the React Flow styles to your main CSS file (e.g., `app/globals.css` or `styles/globals.css`):

```css
@import '@xyflow/react/dist/style.css';
```

## Component Integration

### Step 1: Copy Component Files

Copy the following folders and files from this project to your Next.js application:

```
src/components/
├── HierarchyNode.tsx
├── ActionHistory.tsx
├── FlowBuilder.tsx
├── NodeDrawer.tsx
├── Sidebar.tsx
└── ExportDialog.tsx

src/lib/
├── utils.ts
└── constants.ts

src/utils/
└── flowUtils.ts

src/hooks/
├── use-mobile.tsx
└── use-toast.ts
```

Adjust the import paths in all files to match your Next.js application's directory structure.

### Step 2: Create UI Components (if not using shadcn/ui)

If your application doesn't use shadcn/ui:

1. Copy the entire `src/components/ui/` folder to your project
2. Adjust import paths as needed

If you're already using shadcn/ui, ensure you have these components installed:
- Button
- Dialog
- Drawer
- Dropdown Menu
- Toggle
- Toast
- Toaster
- Tooltip

### Step 3: Create a Flow Page Component

Create a new page component to host the flow visualization:

For App Router:
```tsx
// app/flow/page.tsx
'use client';

import { FlowBuilder } from '@/components/FlowBuilder';
import { Sidebar } from '@/components/Sidebar';

export default function FlowPage() {
  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <div className="flex-1">
        <FlowBuilder />
      </div>
    </div>
  );
}
```

For Pages Router:
```tsx
// pages/flow.tsx
import { FlowBuilder } from '@/components/FlowBuilder';
import { Sidebar } from '@/components/Sidebar';

export default function FlowPage() {
  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <div className="flex-1">
        <FlowBuilder />
      </div>
    </div>
  );
}
```

## Routing Integration

### App Router Integration (Next.js 13+)

1. Create a route for the flow visualization:

```
app/
└── flow/
    └── page.tsx
```

2. Link to the flow visualization from other parts of your application:

```tsx
import Link from 'next/link';

<Link href="/flow">Open Flow Visualization</Link>
```

### Pages Router Integration

1. Create a page for the flow visualization:

```
pages/
└── flow.tsx
```

2. Link to the flow visualization:

```tsx
import Link from 'next/link';

<Link href="/flow">Open Flow Visualization</Link>
```

## Styling Integration

### Tailwind CSS Configuration

If you're already using Tailwind CSS:

1. Ensure the following Tailwind plugins are included in your `tailwind.config.js`:

```js
module.exports = {
  // ... your existing config
  plugins: [
    // ... your existing plugins
    require('tailwindcss-animate'),
  ],
}
```

2. Merge any custom theme configurations:

```js
module.exports = {
  // ... other configurations
  theme: {
    extend: {
      // ... your existing theme extensions
      colors: {
        // ... your existing colors
        // Add hierarchy level colors if needed
      },
    },
  },
}
```

### CSS Integration

1. Copy any custom CSS from `src/index.css` that's specific to the flow visualization components
2. Add it to your global CSS file or create a separate CSS module

## Custom Configuration

### Customizing Node Types

1. Modify `src/lib/constants.ts` to add or modify node types:

```typescript
export const NODE_TYPES: Record<string, string> = {
  // ... existing types
  yourCustomType: 'Your Custom Type Description',
};
```

2. Update the styling in `HierarchyNode.tsx` by adding new category colors:

```typescript
const categoryColors: Record<string, string> = {
  // ... existing colors
  yourCustomType: "#YourColorCode",
};
```

### Customizing Hierarchy Levels

To modify hierarchy levels, update the `HIERARCHY_LEVELS` object in `src/lib/constants.ts`:

```typescript
export const HIERARCHY_LEVELS: Record<number, string> = {
  // ... existing levels
  7: 'Your Custom Level',
};
```

## Troubleshooting

### Common Issues

#### 1. Import Path Issues

If you encounter errors with import paths, make sure to adjust all import statements to match your Next.js application's directory structure. Replace `@/` with your application's import alias if different.

#### 2. React Flow Rendering Issues

If the flow canvas doesn't render properly:

- Ensure the viewport has an explicit height/width (the container should have `h-screen` or a fixed height)
- Check that React Flow styles are correctly imported
- Verify that CSS variables used by the components are properly defined

#### 3. Type Errors

If TypeScript errors occur:

- Check that all types are properly imported
- Ensure your `tsconfig.json` includes paths for any aliases used
- Make sure component props match expected types

#### 4. Package Version Conflicts

If you encounter version conflicts with React Flow or other packages:

- Use `npm list @xyflow/react` to check installed versions
- Try using a specific version that's compatible with your Next.js version
- Consider using `npm dedupe` to resolve duplicate dependencies

### Getting Help

If you encounter issues not covered here:
- Check the official React Flow documentation: https://reactflow.dev/
- Explore the project's README.md for component explanations
- Consult the Next.js documentation for Next.js-specific integration challenges
