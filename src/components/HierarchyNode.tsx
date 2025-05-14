
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
  let backgroundColor = 'transparent';
  let textColor = '#000000';
  
  switch (category) {
    case 'jasper':
      backgroundColor = 'transparent';
      textColor = '#F97316';
      break;
    case 'gold':
      backgroundColor = 'transparent';
      textColor = '#8B5CF6';
      break;
    case 'sapphire':
      backgroundColor = 'transparent';
      textColor = '#0EA5E9';
      break;
    case 'emerald':
      backgroundColor = 'transparent';
      textColor = '#10B981';
      break;
    case 'topaz':
      backgroundColor = 'transparent';
      textColor = '#D946EF';
      break;
    case 'amethyst':
      backgroundColor = 'transparent';
      textColor = '#EC4899';
      break;
    case 'ruby':
      backgroundColor = 'transparent';
      textColor = '#FBBF24';
      break;
    case 'citrine':
      backgroundColor = 'transparent';
      textColor = '#06B6D4';
      break;
    case 'diamond':
      backgroundColor = 'transparent';
      textColor = '#14B8A6';
      break;
    case 'quartz':
      backgroundColor = 'transparent';
      textColor = '#6366F1';
      break;
    default:
      backgroundColor = 'transparent';
      textColor = '#263238';
  }
  
  // Modify the style for inactivity
  if (!isActive) {
    backgroundColor = 'transparent';
    textColor = '#9e9e9e';
  }
  
  // Elevation style for selected state with transparent background
  const elevationStyle = selected
    ? { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', transform: 'translateY(-2px)' }
    : { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' };
    
  // Enhanced border for inactive nodes
  const borderStyle = isActive
    ? { border: selected ? `2px solid ${textColor}` : `1px solid ${textColor}` }
    : { border: '1px dashed #9e9e9e' };
  
  return (
    <>
      {/* Input handle on top */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: textColor, width: 8, height: 8 }}
      />
      
      {/* Node body - square shape with 15px border radius and transparent background */}
      <div
        style={{
          ...elevationStyle,
          ...borderStyle,
          backgroundColor,
          color: textColor,
          padding: 10,
          borderRadius: "15px",
          width: 80,  // Fixed square width
          height: 80, // Fixed square height
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontSize: '0.75rem', // Smaller text size to avoid hiding
          transition: 'all 0.2s ease',
        }}
      >
        {/* Level badge */}
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: isActive ? textColor : '#9e9e9e',
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
        
        {/* Node content - centered with smaller text */}
        <div style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '0.7rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '95%' }}>
          {code && <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>{code}</div>}
          <div style={{ marginTop: 2 }}>{label}</div>
        </div>
      </div>
      
      {/* Output handle on bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: textColor, width: 8, height: 8 }}
      />
    </>
  );
};

export default memo(HierarchyNode);
