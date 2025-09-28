import { memo } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
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
  onDragStart?: (employeeId: string, event: ReactPointerEvent<HTMLDivElement>) => void;
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

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!onDragStart) {
      return;
    }

    if (event.button !== 0 && event.pointerType !== 'touch') {
      return;
    }

    if (dragState?.isDragging) {
      return;
    }

    const targetElement = event.target as HTMLElement | null;
    const isHandle = targetElement?.closest('[data-drag-handle="true"]');

    if (!isHandle) {
      return;
    }

    if (targetElement?.closest('button')) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    onDragStart(employee.id, event);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState?.isDragging) {
      event.stopPropagation();
    }
  };

  const showConnector = Boolean(employee.managerId);
  const canDeleteBranch = Boolean(onDeleteBranch);

  const borderColorBase = isSelected
    ? '#2563eb'
    : isHighlighted
      ? '#f97316'
      : isBranchMember
        ? 'rgba(251, 191, 36, 0.65)'
        : 'rgba(203, 213, 225, 0.85)';

  const borderColor = canAcceptDrop
    ? (isDropHover ? '#0f766e' : '#10b981')
    : borderColorBase;

  const boxShadow = (() => {
    if (isDragSource) {
      return '0 20px 38px rgba(14, 116, 144, 0.28)';
    }

    if (isHighlighted || isSelected) {
      return '0 20px 42px rgba(249, 115, 22, 0.22)';
    }

    if (canAcceptDrop) {
      return isDropHover
        ? '0 16px 32px rgba(34, 197, 94, 0.3)'
        : '0 14px 26px rgba(16, 185, 129, 0.22)';
    }

    if (isBranchMember) {
      return '0 14px 26px rgba(251, 191, 36, 0.18)';
    }

    return '0 14px 28px rgba(148, 163, 184, 0.16)';
  })();

  const backgroundColor = canAcceptDrop
    ? (isDropHover ? 'rgba(134, 239, 172, 0.45)' : 'rgba(167, 243, 208, 0.4)')
    : isHighlighted
      ? 'rgba(254, 243, 199, 0.75)'
      : isBranchMember
        ? 'rgba(253, 224, 71, 0.3)'
        : '#f8fafc';

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
          padding: 0,
          boxSizing: 'border-box',
          transition: 'all 0.2s ease',
          overflow: 'visible',
          cursor: onSelect ? 'pointer' : 'default',
          position: 'relative',
          display: 'flex',
          alignItems: 'stretch',
        }}
        data-employee-node="true"
        data-employee-id={employee.id}
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
      >
        <div
          data-drag-handle="true"
          role="presentation"
          style={{
            position: 'absolute',
            top: '-18px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '64px',
            height: '16px',
            borderRadius: '999px',
            background: isDragSource ? '#0f766e' : '#e2e8f0',
            border: '1px solid rgba(148, 163, 184, 0.6)',
            boxShadow: '0 8px 16px rgba(148, 163, 184, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDragSource ? 'grabbing' : 'grab',
            transition: 'background-color 0.2s ease, border-color 0.2s ease',
            zIndex: 3,
            touchAction: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <div
            style={{
              width: 32,
              height: 4,
              borderRadius: 999,
              background: isDragSource ? '#ffffff' : '#94a3b8',
              opacity: isDragSource ? 0.95 : 0.8,
            }}
          />
        </div>
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
              backgroundColor: 'rgba(248, 113, 113, 0.9)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              transition: 'background-color 0.2s ease',
              zIndex: 2,
              boxShadow: '0 6px 14px rgba(248, 113, 113, 0.35)',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.95)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.9)';
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
            ×
          </button>
        )}
        <div
          style={{
            flex: 1,
            padding: '10px',
            paddingTop: '18px',
            paddingBottom: '14px',
            boxSizing: 'border-box',
          }}
        >
          <ProfileCard
            employee={employee}
            isHighlighted={isHighlighted || isSelected}
            size="medium"
            showRole={true}
            showTeam={true}
          />
        </div>
        {(isSelected || isDragSource) && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '14px',
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: isDragSource ? 'rgba(14, 116, 144, 0.18)' : 'rgba(234, 88, 12, 0.18)',
              color: isDragSource ? '#0f172a' : '#9a3412',
              fontSize: '0.65rem',
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
