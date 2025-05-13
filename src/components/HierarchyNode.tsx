
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeProps } from '@/types/node';
import { HierarchyNodeData } from '@/types/node';

// Square-shaped hierarchy node component with node level indicator
const HierarchyNode = ({ data, selected, id }: NodeProps<HierarchyNodeData>) => {
  // Extract node properties
  const category = data.category || 'default';
  const label = data.label || 'Node';
  const nodeLevel = data.level || 0;
  const code = data.code || '';
  const isActive = data.isActive !== undefined ? data.isActive : true;
  
  // Calculate background color based on category
  let backgroundColor = '#ffffff';
  let textColor = '#000000';
  
  switch (category) {
    case 'process':
      backgroundColor = '#E3F2FD';
      textColor = '#0D47A1';
      break;
    case 'decision':
      backgroundColor = '#F3E5F5';
      textColor = '#6A1B9A';
      break;
    case 'input':
      backgroundColor = '#E8F5E9';
      textColor = '#1B5E20';
      break;
    case 'output':
      backgroundColor = '#FFF3E0';
      textColor = '#E65100';
      break;
    default:
      backgroundColor = '#ECEFF1';
      textColor = '#263238';
  }
  
  // Modify the style for inactivity
  if (!isActive) {
    backgroundColor = '#f5f5f5';
    textColor = '#9e9e9e';
  }
  
  // Elevation style for selected state
  const elevationStyle = selected
    ? { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', transform: 'translateY(-2px)' }
    : { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' };
    
  // Enhanced border for inactive nodes
  const borderStyle = isActive
    ? { border: selected ? '2px solid #2196F3' : '1px solid #e0e0e0' }
    : { border: '1px dashed #9e9e9e' };
  
  // Format the code and first letter of label for the badge
  const formattedCode = code ? code : 'N/A';
  const firstLetter = label ? label.charAt(0).toUpperCase() : 'N';
  const labelInitial = firstLetter + (label && label.slice(1, 2).toLowerCase() || '');
  
  return (
    <>
      {/* Input handle on top */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#0FA0CE', width: 8, height: 8 }}
      />
      
      {/* Node body - now square shape */}
      <div
        style={{
          ...elevationStyle,
          ...borderStyle,
          backgroundColor,
          color: textColor,
          padding: 10,
          borderRadius: 4,
          width: 80,  // Fixed square width
          height: 80, // Fixed square height
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontSize: '0.85rem',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Level badge */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: isActive ? '#0FA0CE' : '#9e9e9e',
            color: 'white',
            borderRadius: '50%',
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 'bold',
          }}
        >
          {nodeLevel}
        </div>
        
        {/* Node content - centered */}
        <div style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '0.8rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }}>
          {code && <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{formattedCode}</div>}
          <div style={{ marginTop: 2 }}>{label}</div>
        </div>
      </div>
      
      {/* Output handle on bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#0FA0CE', width: 8, height: 8 }}
      />
    </>
  );
};

export default memo(HierarchyNode);

// Export the node data type
export type { HierarchyNodeData };
