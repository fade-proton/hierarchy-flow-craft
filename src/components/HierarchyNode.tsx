
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
    case 'jasper':
      backgroundColor = '#FFF3E0';
      textColor = '#F97316';
      break;
    case 'gold':
      backgroundColor = '#F3E5F5';
      textColor = '#8B5CF6';
      break;
    case 'sapphire':
      backgroundColor = '#E3F2FD';
      textColor = '#0EA5E9';
      break;
    case 'emerald':
      backgroundColor = '#E8F5E9';
      textColor = '#10B981';
      break;
    case 'topaz':
      backgroundColor = '#F5E0F7';
      textColor = '#D946EF';
      break;
    case 'amethyst':
      backgroundColor = '#FCE4EC';
      textColor = '#EC4899';
      break;
    case 'ruby':
      backgroundColor = '#FFF8E1';
      textColor = '#FBBF24';
      break;
    case 'citrine':
      backgroundColor = '#E0F7FA';
      textColor = '#06B6D4';
      break;
    case 'diamond':
      backgroundColor = '#E0F2F1';
      textColor = '#14B8A6';
      break;
    case 'quartz':
      backgroundColor = '#E8EAF6';
      textColor = '#6366F1';
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
  
  return (
    <>
      {/* Input handle on top */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#0FA0CE', width: 8, height: 8 }}
      />
      
      {/* Node body - square shape with 15px border radius */}
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
          {code && <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{code}</div>}
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
