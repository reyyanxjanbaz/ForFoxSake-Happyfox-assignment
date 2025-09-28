import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { ProfileCard } from '../../../components/shared';
import type { Employee } from '../state/employee';
import type { DragState } from '../hooks/useDragAndDrop';

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
    if (!onDragStart) return;
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', employee.id);
    onDragStart(employee.id);
  };

  const handleDragOverEvent = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragState?.isDragging || dragState.draggedEmployeeId === employee.id) {
      return;
    }

    if (!onDragOver) {
      return;
    }

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
    if (!dragState?.isDragging || !onDrop) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    try {
      await onDrop(employee.id);
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
      ? 'var(--color-orange-300)'
      : 'var(--color-border)';

  const borderColor = canAcceptDrop
    ? (isDropHover ? 'var(--color-emerald-500)' : 'var(--color-emerald-300)')
    : borderColorBase;

  const boxShadow = (() => {
    if (isDragSource) {
      return '0 18px 32px rgba(14, 116, 144, 0.25)';
    }

    if (isHighlighted || isSelected) {
      return '0 18px 32px rgba(234, 88, 12, 0.25)';
    }

    if (canAcceptDrop) {
      return isDropHover
        ? '0 14px 28px rgba(16, 185, 129, 0.3)'
        : '0 12px 22px rgba(16, 185, 129, 0.2)';
    }

    if (isBranchMember) {
      return '0 12px 22px rgba(251, 191, 36, 0.18)';
    }

    return '0 12px 24px rgba(15, 23, 42, 0.08)';
  })();

  const backgroundColor = isHighlighted
    ? 'rgba(251, 146, 60, 0.18)'
    : isBranchMember
      ? 'rgba(254, 215, 170, 0.45)'
      : 'var(--color-white)';

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
          borderRadius: '16px',
          background: backgroundColor,
          border: `2px solid ${borderColor}`,
          boxShadow,
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          cursor: onDragStart ? (isDragSource ? 'grabbing' : 'grab') : onSelect ? 'pointer' : 'default',
          position: 'relative',
        }}
        onClick={handleSelect}
        onMouseDown={(event) => {
          if (onDragStart) {
            event.stopPropagation();
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
              width: '32px',
              height: '32px',
              borderRadius: '999px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: 'var(--color-white)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
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
        {(isSelected || isDragSource) && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '12px',
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: isDragSource ? 'rgba(14, 116, 144, 0.16)' : 'rgba(234, 88, 12, 0.15)',
              color: isDragSource ? '#0f766e' : 'var(--color-primary)',
              fontSize: '0.625rem',
              fontWeight: 600,
            }}
          >
            {isDragSource ? 'Moving' : 'Selected'}
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
