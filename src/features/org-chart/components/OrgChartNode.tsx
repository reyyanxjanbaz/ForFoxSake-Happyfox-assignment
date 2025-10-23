import { memo, useMemo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useDraggable, useDroppable } from '@dnd-kit/core';
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
  enableDragAndDrop?: boolean;
  theme?: 'light' | 'dark';
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};

const NODE_THEME_TOKENS = {
  light: {
    baseBackground: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.94) 100%)',
    highlightBackground: 'linear-gradient(180deg, rgba(255, 247, 237, 0.97) 0%, rgba(254, 235, 200, 0.9) 100%)',
    branchBackground: 'linear-gradient(180deg, rgba(255, 251, 235, 0.97) 0%, rgba(254, 243, 199, 0.9) 100%)',
    dropBackground: 'linear-gradient(180deg, rgba(236, 253, 245, 0.96) 0%, rgba(209, 250, 229, 0.9) 100%)',
    dropHoverBackground: 'linear-gradient(180deg, rgba(209, 250, 229, 0.96) 0%, rgba(167, 243, 208, 0.92) 100%)',
    baseBorder: 'rgba(148, 163, 184, 0.55)',
    highlightBorder: '#fb923c',
    branchBorder: 'rgba(251, 191, 36, 0.7)',
    selectedBorder: 'var(--color-primary)',
    dropBorder: '#34d399',
    dropHoverBorder: '#10b981',
    baseShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
    highlightShadow: '0 18px 32px rgba(234, 88, 12, 0.18)',
    branchShadow: '0 12px 22px rgba(251, 191, 36, 0.16)',
    dropShadow: '0 12px 22px rgba(16, 185, 129, 0.18)',
    dropHoverShadow: '0 14px 28px rgba(16, 185, 129, 0.28)',
    dragActiveShadow: '0 18px 32px rgba(14, 116, 144, 0.2)',
    connectorGradient: 'linear-gradient(180deg, rgba(148, 163, 184, 0.5) 0%, rgba(148, 163, 184, 0) 100%)',
    hoverRing: '0 0 0 3px rgba(249, 115, 22, 0.45)',
    deleteButtonBackground: 'rgba(15, 23, 42, 0.8)',
    deleteButtonHoverBackground: 'rgba(220, 38, 38, 0.95)',
    deleteButtonShadow: '0 6px 14px rgba(15, 23, 42, 0.15)',
    deleteButtonHoverShadow: '0 10px 18px rgba(220, 38, 38, 0.28)',
    dragButtonBackground: 'rgba(107, 114, 128, 0.8)',
    dragButtonHoverBackground: 'rgba(107, 114, 128, 1)',
    dragButtonActiveBackground: 'rgba(34, 197, 94, 0.95)',
    dragButtonShadow: '0 6px 14px rgba(107, 114, 128, 0.25)',
    dragButtonHoverShadow: '0 10px 18px rgba(34, 197, 94, 0.24)',
    statusSelectedBackground: 'rgba(234, 88, 12, 0.9)',
    statusDraggingBackground: 'rgba(14, 116, 144, 0.9)',
    statusDropBackground: '#34d399',
    statusDropHoverBackground: '#10b981',
    statusTextColor: '#ffffff',
  },
  dark: {
    baseBackground: 'linear-gradient(180deg, rgba(30, 41, 59, 0.96) 0%, rgba(15, 23, 42, 0.92) 100%)',
    highlightBackground: 'linear-gradient(180deg, rgba(99, 46, 18, 0.92) 0%, rgba(134, 65, 22, 0.88) 100%)',
    branchBackground: 'linear-gradient(180deg, rgba(88, 64, 7, 0.92) 0%, rgba(120, 72, 16, 0.86) 100%)',
    dropBackground: 'linear-gradient(180deg, rgba(17, 94, 89, 0.92) 0%, rgba(15, 118, 110, 0.88) 100%)',
    dropHoverBackground: 'linear-gradient(180deg, rgba(13, 148, 136, 0.94) 0%, rgba(16, 185, 129, 0.9) 100%)',
    baseBorder: 'rgba(148, 163, 184, 0.35)',
    highlightBorder: '#fb923c',
    branchBorder: 'rgba(253, 230, 138, 0.7)',
    selectedBorder: '#fb923c',
    dropBorder: 'rgba(16, 185, 129, 0.85)',
    dropHoverBorder: 'rgba(49, 196, 141, 0.95)',
    baseShadow: '0 18px 34px rgba(2, 6, 23, 0.65)',
    highlightShadow: '0 20px 36px rgba(249, 115, 22, 0.28)',
    branchShadow: '0 16px 32px rgba(253, 230, 138, 0.22)',
    dropShadow: '0 16px 32px rgba(16, 185, 129, 0.32)',
    dropHoverShadow: '0 18px 36px rgba(16, 185, 129, 0.4)',
    dragActiveShadow: '0 22px 40px rgba(14, 116, 144, 0.32)',
    connectorGradient: 'linear-gradient(180deg, rgba(148, 163, 184, 0.5) 0%, rgba(148, 163, 184, 0) 100%)',
    hoverRing: '0 0 0 3px rgba(96, 165, 250, 0.32)',
    deleteButtonBackground: 'rgba(15, 23, 42, 0.85)',
    deleteButtonHoverBackground: 'rgba(220, 38, 38, 0.85)',
    deleteButtonShadow: '0 6px 14px rgba(2, 6, 23, 0.45)',
    deleteButtonHoverShadow: '0 10px 18px rgba(220, 38, 38, 0.4)',
    dragButtonBackground: 'rgba(71, 85, 105, 0.85)',
    dragButtonHoverBackground: 'rgba(148, 163, 184, 0.95)',
    dragButtonActiveBackground: 'rgba(34, 197, 94, 0.9)',
    dragButtonShadow: '0 6px 14px rgba(2, 6, 23, 0.45)',
    dragButtonHoverShadow: '0 10px 18px rgba(34, 197, 94, 0.32)',
    statusSelectedBackground: 'rgba(253, 186, 116, 0.85)',
    statusDraggingBackground: 'rgba(14, 116, 144, 0.85)',
    statusDropBackground: 'rgba(16, 185, 129, 0.95)',
    statusDropHoverBackground: 'rgba(4, 196, 154, 0.95)',
    statusTextColor: '#0f172a',
  },
} as const;

const OrgChartNodeComponent = ({ data }: NodeProps<OrgChartNodeData>) => {
  const {
    employee,
    isHighlighted,
    isSelected,
    isBranchMember = false,
    onSelect,
    dragState,
    enableDragAndDrop = false,
    theme = 'light',
  } = data;
  const { onDeleteBranch } = data;
  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const themeTokens = NODE_THEME_TOKENS[themeKey];

  const connectorStyle = useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    top: '-24px',
    left: '50%',
    width: '2px',
    height: '24px',
    background: themeTokens.connectorGradient,
    transform: 'translateX(-50%)',
    borderRadius: '999px',
    opacity: 0.6,
    pointerEvents: 'none',
    transition: 'background 0.2s ease',
  }), [themeKey]);

  // @dnd-kit draggable setup
  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
    id: employee.id,
    disabled: !enableDragAndDrop,
  });

  // @dnd-kit droppable setup  
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: employee.id,
    disabled: !enableDragAndDrop,
  });

  // Combine refs for both draggable and droppable
  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  const isDragSource = isDragging;
  const canAcceptDrop = Boolean(
    dragState?.isDragging &&
    dragState.draggedEmployeeId !== employee.id &&
    dragState.validDropTargets.includes(employee.id)
  );
  const isDropHover = isOver && canAcceptDrop;

  const [isDragHovered, setIsDragHovered] = useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const handleSelect = () => {
    if (dragState?.isDragging) {
      return; // Avoid triggering selection while dragging
    }
    onSelect?.(employee.id);
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    onDeleteBranch?.(employee.id);
  };

  const showConnector = Boolean(employee.managerId);
  const canDeleteBranch = Boolean(onDeleteBranch);

  const borderColorBase = isSelected
    ? themeTokens.selectedBorder
    : isHighlighted
      ? themeTokens.highlightBorder
      : isBranchMember
        ? themeTokens.branchBorder
        : themeTokens.baseBorder;

  const borderColor = canAcceptDrop
    ? (isDropHover ? themeTokens.dropHoverBorder : themeTokens.dropBorder)
    : borderColorBase;

  const boxShadow = useMemo(() => {
    if (isDragSource) {
      return themeTokens.dragActiveShadow;
    }

    if (isHighlighted || isSelected) {
      return themeTokens.highlightShadow;
    }

    if (canAcceptDrop) {
      return isDropHover ? themeTokens.dropHoverShadow : themeTokens.dropShadow;
    }

    if (isBranchMember) {
      return themeTokens.branchShadow;
    }

    return themeTokens.baseShadow;
  }, [canAcceptDrop, isBranchMember, isDropHover, isDragSource, isHighlighted, isSelected, themeKey]);

  const backgroundColor = useMemo(() => {
    if (canAcceptDrop) {
      return isDropHover ? themeTokens.dropHoverBackground : themeTokens.dropBackground;
    }

    if (isHighlighted || isSelected) {
      return themeTokens.highlightBackground;
    }

    if (isBranchMember) {
      return themeTokens.branchBackground;
    }

    return themeTokens.baseBackground;
  }, [canAcceptDrop, isBranchMember, isDropHover, isHighlighted, isSelected, themeKey]);

  const deleteButtonStyle = useMemo<React.CSSProperties>(() => ({
    minWidth: isDeleteHovered ? '72px' : '22px',
    width: isDeleteHovered ? 'auto' : '22px',
    height: '22px',
    borderRadius: '999px',
    backgroundColor: isDeleteHovered ? themeTokens.deleteButtonHoverBackground : themeTokens.deleteButtonBackground,
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: isDeleteHovered ? '0.75rem' : '0.7rem',
    fontWeight: 600,
    lineHeight: 1,
    padding: isDeleteHovered ? '0 12px' : '0',
    transition: 'all 0.2s ease',
    boxShadow: isDeleteHovered ? themeTokens.deleteButtonHoverShadow : themeTokens.deleteButtonShadow,
    pointerEvents: 'auto',
  }), [isDeleteHovered, themeKey]);

  const dragButtonStyle = useMemo<React.CSSProperties>(() => {
    const background = isDragSource
      ? themeTokens.dragButtonActiveBackground
      : (isDragHovered ? themeTokens.dragButtonHoverBackground : themeTokens.dragButtonBackground);

    const shadow = (isDragHovered || isDragSource)
      ? themeTokens.dragButtonHoverShadow
      : themeTokens.dragButtonShadow;

    return {
      minWidth: (isDragHovered || isDragSource) ? '72px' : '22px',
      width: (isDragHovered || isDragSource) ? 'auto' : '22px',
      height: '22px',
      borderRadius: '999px',
      backgroundColor: background,
      color: '#ffffff',
      border: 'none',
      cursor: isDragSource ? 'grabbing' : 'grab',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: (isDragHovered || isDragSource) ? '0.7rem' : '0.7rem',
      fontWeight: 600,
      padding: (isDragHovered || isDragSource) ? '0 12px' : '0',
      transition: 'all 0.2s ease',
      boxShadow: shadow,
      pointerEvents: 'auto',
    } satisfies React.CSSProperties;
  }, [isDragHovered, isDragSource, themeKey]);

  const hoverRing = themeTokens.hoverRing;
  const shouldHideBorderForHover = isNodeHovered && !isDragSource && !canAcceptDrop;
  const appliedBorderColor = shouldHideBorderForHover ? 'transparent' : borderColor;
  const appliedBoxShadow = isNodeHovered ? `${boxShadow}, ${hoverRing}` : boxShadow;

  const statusBackground = canAcceptDrop
    ? (isDropHover ? themeTokens.statusDropHoverBackground : themeTokens.statusDropBackground)
    : (isDragSource ? themeTokens.statusDraggingBackground : themeTokens.statusSelectedBackground);

  const statusLabel = canAcceptDrop
    ? (isDropHover ? '⬇️ DROP HERE' : '✅ VALID TARGET')
    : (isDragSource ? '🔄 MOVING' : '✓ SELECTED');

  const statusAnimation = (isDragSource || canAcceptDrop) ? 'pulse 1.5s infinite' : 'none';
  const statusShadow = themeKey === 'dark' ? '0 2px 12px rgba(2, 6, 23, 0.6)' : '0 2px 8px rgba(0, 0, 0, 0.2)';

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
        ref={setNodeRef}
        {...attributes}
        style={{
          width: '320px',
          height: '160px',
          borderRadius: '18px',
          background: backgroundColor,
          border: `2px solid ${appliedBorderColor}`,
          boxShadow: appliedBoxShadow,
          padding: '0',
          boxSizing: 'border-box',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          cursor: enableDragAndDrop ? (isDragSource ? 'grabbing' : 'grab') : onSelect ? 'pointer' : 'default',
          position: 'relative',
          opacity: isDragSource ? 0.7 : 1,
          transform: isDragSource ? 'scale(1.05)' : transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.05)` : 'scale(1)',
          zIndex: isDragSource ? 1000 : 'auto',
          touchAction: enableDragAndDrop ? 'none' : 'auto',
          userSelect: enableDragAndDrop ? 'none' : 'auto',
        }}
        onClick={handleSelect}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : -1}
        onMouseEnter={() => setIsNodeHovered(true)}
        onMouseLeave={() => setIsNodeHovered(false)}
        onFocus={() => setIsNodeHovered(true)}
        onBlur={() => setIsNodeHovered(false)}
        onKeyDown={(event) => {
          if (!onSelect) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(employee.id);
          }
        }}
      >
        {/* Action Buttons Container */}
        {/* Delete Button - Top Right */}
        {canDeleteBranch && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 2,
          }}>
            <button
              type="button"
              onClick={handleDelete}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              aria-label={`Delete ${employee.name}`}
              title={`Delete ${employee.name}'s branch`}
              style={deleteButtonStyle}
              onMouseEnter={() => setIsDeleteHovered(true)}
              onMouseLeave={() => setIsDeleteHovered(false)}
            >
              {isDeleteHovered ? 'Delete' : '✕'}
            </button>
          </div>
        )}

        {/* Drag Handle Button - Top Left */}
        {enableDragAndDrop && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            zIndex: 2,
          }}>
            <button
              type="button"
              {...listeners}
              aria-label={`Move ${employee.name}`}
              title={`Drag to move ${employee.name}`}
              style={dragButtonStyle}
              onMouseEnter={() => setIsDragHovered(true)}
              onMouseLeave={() => setIsDragHovered(false)}
            >
              {isDragHovered || isDragSource ? 'Drag' : '⋮⋮'}
            </button>
          </div>
        )}


        
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            padding: '12px',
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <ProfileCard
              employee={employee}
              isHighlighted={isHighlighted || isSelected}
              size="medium"
              showRole={true}
              showTeam={true}
              theme={themeKey}
              className="org-chart-node-card"
            />
          </div>
        </div>
        {(isSelected || isDragSource || canAcceptDrop) && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '3px 10px',
              borderRadius: '999px',
              backgroundColor: statusBackground,
              color: themeTokens.statusTextColor,
              fontSize: '0.625rem',
              fontWeight: 700,
              boxShadow: statusShadow,
              animation: statusAnimation,
              zIndex: 1,
            }}
          >
            {statusLabel}
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
