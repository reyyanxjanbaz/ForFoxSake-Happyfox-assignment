import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { ProfileCard } from '../../../components/shared';
import type { Employee } from '../state/employee';
import type { DragState } from '../hooks/useDragAndDrop';

// Add CSS animation for pulsing effect
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;
if (!document.head.querySelector('style[data-drag-animations]')) {
  style.setAttribute('data-drag-animations', 'true');
  document.head.appendChild(style);
}

export interface OrgChartNodeData {
  employee: Employee;
  isHighlighted: boolean;
  isSelected?: boolean;
  onSelect?: (employeeId: string) => void;
  onDeleteBranch?: (employeeId: string) => void;
  isBranchMember?: boolean;
  dragState?: DragState;
  onDragStart?: (employeeId: string) => void;
  onDragOver?: (employeeId: string) => void;
  onDragLeave?: () => void;
  onDrop?: (employeeId: string) => Promise<boolean> | boolean | void;
  onDragEnd?: () => void;
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};

const connectorStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-24px',
  left: '50%',
  width: '2px',
  height: '24px',
  background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.5) 0%, rgba(148, 163, 184, 0) 100%)',
  transform: 'translateX(-50%)',
};

const OrgChartNodeComponent = ({ data }: NodeProps<OrgChartNodeData>) => {
  const {
    employee,
    isHighlighted,
    isSelected,
    isBranchMember = false,
    onSelect,
    dragState,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
  } = data;
  const { onDeleteBranch } = data;

  const isDragSource = dragState?.isDragging && dragState.draggedEmployeeId === employee.id;
  const canAcceptDrop = Boolean(
    dragState?.isDragging &&
    dragState.draggedEmployeeId !== employee.id &&
    dragState.validDropTargets.includes(employee.id)
  );
  const isDropHover = dragState?.hoveredTargetId === employee.id;

  const handleSelect = () => {
    if (dragState?.isDragging) {
      return; // Avoid triggering selection while dragging
    }
    onSelect?.(employee.id);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteBranch?.(employee.id);
  };

  const handleDragStartEvent = (event: React.DragEvent<HTMLDivElement>) => {
    console.log('🚀 Drag start event triggered for:', employee.name);
    if (!onDragStart) {
      console.log('❌ No onDragStart handler provided');
      return;
    }
    
    // Prevent React Flow from interfering
    event.stopPropagation();
    
    // Set up drag data
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', employee.id);
    event.dataTransfer.setData('application/json', JSON.stringify({
      id: employee.id,
      name: employee.name,
      type: 'employee'
    }));
    
    // Create a custom drag image for better visual feedback
    const dragImage = event.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.transform = 'rotate(2deg) scale(0.9)';
    dragImage.style.opacity = '0.9';
    dragImage.style.pointerEvents = 'none';
    dragImage.style.zIndex = '10000';
    document.body.appendChild(dragImage);
    
    event.dataTransfer.setDragImage(dragImage, 140, 80);
    
    // Clean up the temporary drag image
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 50);
    
    onDragStart(employee.id);
    console.log('✅ Drag started successfully for:', employee.name);
  };

  const handleDragOverEvent = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragState?.isDragging || dragState.draggedEmployeeId === employee.id) {
      return;
    }

    if (!onDragOver) {
      return;
    }

    console.log('🎯 Drag over:', employee.name, 'canAcceptDrop:', canAcceptDrop);
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = canAcceptDrop ? 'move' : 'none';
    onDragOver(employee.id);
  };

  const handleDragLeaveEvent = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragState?.isDragging || !onDragLeave) {
      return;
    }

    if (dragState.hoveredTargetId === employee.id) {
      onDragLeave();
    }

    event.stopPropagation();
  };

  const handleDropEvent = async (event: React.DragEvent<HTMLDivElement>) => {
    console.log('📥 Drop event on:', employee.name);
    if (!dragState?.isDragging || !onDrop) {
      console.log('❌ Drop failed - no drag state or drop handler');
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    console.log('🔄 Processing drop...');
    try {
      const result = await onDrop(employee.id);
      console.log('✅ Drop completed successfully:', result);
    } catch (error) {
      console.error('❌ Drop failed:', error);
    } finally {
      onDragLeave?.();
      onDragEnd?.();
    }
  };

  const handleDragEndEvent = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onDragEnd?.();
  };

  const showConnector = Boolean(employee.managerId);
  const canDeleteBranch = Boolean(onDeleteBranch);

  const borderColorBase = isSelected
    ? 'var(--color-primary)'
    : isHighlighted
      ? '#fb923c'
      : isBranchMember
        ? 'rgba(251, 191, 36, 0.7)'
        : 'rgba(148, 163, 184, 0.55)';

  const borderColor = canAcceptDrop
    ? (isDropHover ? '#10b981' : '#34d399')
    : borderColorBase;

  const boxShadow = (() => {
    if (isDragSource) {
      return '0 18px 32px rgba(14, 116, 144, 0.2)';
    }

    if (isHighlighted || isSelected) {
      return '0 18px 32px rgba(234, 88, 12, 0.18)';
    }

    if (canAcceptDrop) {
      return isDropHover
        ? '0 14px 28px rgba(16, 185, 129, 0.28)'
        : '0 12px 22px rgba(16, 185, 129, 0.18)';
    }

    if (isBranchMember) {
      return '0 12px 22px rgba(251, 191, 36, 0.16)';
    }

    return '0 12px 24px rgba(15, 23, 42, 0.08)';
  })();

  const backgroundColor = (() => {
    if (canAcceptDrop) {
      return isDropHover
        ? 'linear-gradient(180deg, rgba(209, 250, 229, 0.96) 0%, rgba(167, 243, 208, 0.92) 100%)'
        : 'linear-gradient(180deg, rgba(236, 253, 245, 0.96) 0%, rgba(209, 250, 229, 0.9) 100%)';
    }

    if (isHighlighted || isSelected) {
      return 'linear-gradient(180deg, rgba(255, 247, 237, 0.97) 0%, rgba(254, 235, 200, 0.9) 100%)';
    }

    if (isBranchMember) {
      return 'linear-gradient(180deg, rgba(255, 251, 235, 0.97) 0%, rgba(254, 243, 199, 0.9) 100%)';
    }

    return 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.94) 100%)';
  })();

  return (
    <div style={containerStyle}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ opacity: 0, pointerEvents: 'none' }}
        aria-hidden
      />
      {showConnector && <div style={connectorStyle} aria-hidden />}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '18px',
          background: backgroundColor,
          border: `2px solid ${borderColor}`,
          boxShadow,
          padding: '6px',
          boxSizing: 'border-box',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          cursor: onDragStart ? (isDragSource ? 'grabbing' : 'grab') : onSelect ? 'pointer' : 'default',
          position: 'relative',
          opacity: isDragSource ? 0.7 : 1,
          transform: isDragSource ? 'scale(1.05)' : 'scale(1)',
          zIndex: isDragSource ? 1000 : 'auto',
          // Ensure drag events can be triggered properly
          touchAction: onDragStart ? 'none' : 'auto',
          userSelect: onDragStart ? 'none' : 'auto',
        }}
        onClick={handleSelect}
        onMouseDown={(event) => {
          if (onDragStart) {
            console.log('🖱️ Mouse down on draggable element:', employee.name);
            // Prevent React Flow from capturing this event
            event.stopPropagation();
            // Don't prevent default - allow drag to start naturally
          }
        }}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : -1}
        onKeyDown={(event) => {
          if (!onSelect) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(employee.id);
          }
        }}
        draggable={Boolean(onDragStart)}
        onDragStart={handleDragStartEvent}
        onDragOver={handleDragOverEvent}
        onDragLeave={handleDragLeaveEvent}
        onDrop={handleDropEvent}
        onDragEnd={handleDragEndEvent}
        aria-grabbed={isDragSource || undefined}
      >
        {canDeleteBranch && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${employee.name}`}
            title={`Delete ${employee.name}'s branch`}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '22px',
              height: '22px',
              borderRadius: '999px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: 'var(--color-white)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              transition: 'background-color 0.2s ease',
              zIndex: 2,
              boxShadow: '0 6px 14px rgba(15, 23, 42, 0.25)',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
            }}
          >
            ×
          </button>
        )}
        <ProfileCard
          employee={employee}
          isHighlighted={isHighlighted || isSelected}
          size="medium"
          showRole={true}
          showTeam={true}
        />
        {(isSelected || isDragSource || canAcceptDrop) && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: canDeleteBranch ? '36px' : '12px',
              padding: '3px 10px',
              borderRadius: '999px',
              backgroundColor: canAcceptDrop 
                ? (isDropHover ? '#10b981' : '#34d399')
                : (isDragSource ? 'rgba(14, 116, 144, 0.9)' : 'rgba(234, 88, 12, 0.9)'),
              color: 'white',
              fontSize: '0.625rem',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              animation: (isDragSource || canAcceptDrop) ? 'pulse 1.5s infinite' : 'none',
            }}
          >
            {canAcceptDrop 
              ? (isDropHover ? '⬇️ DROP HERE' : '✅ VALID TARGET')
              : (isDragSource ? '🔄 MOVING' : '✓ SELECTED')
            }
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, pointerEvents: 'none' }}
        aria-hidden
      />
    </div>
  );
};

export default memo(OrgChartNodeComponent);
