import { memo } from 'react';
import type { NodeProps } from 'reactflow';
import { ProfileCard } from '../../../components/shared';
import type { Employee } from '../state/employee';

export interface OrgChartNodeData {
  employee: Employee;
  isHighlighted: boolean;
  isSelected?: boolean;
  onSelect?: (employeeId: string) => void;
  onDeleteBranch?: (employeeId: string) => void;
  isBranchMember?: boolean;
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
  const { employee, isHighlighted, isSelected, isBranchMember = false, onSelect } = data;
  const { onDeleteBranch } = data;

  const handleSelect = () => {
    onSelect?.(employee.id);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteBranch?.(employee.id);
  };

  const showConnector = Boolean(employee.managerId);
  const canDeleteBranch = Boolean(onDeleteBranch && employee.managerId);

  return (
    <div style={containerStyle}>
      {showConnector && <div style={connectorStyle} aria-hidden />}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '16px',
          background: isBranchMember ? 'rgba(254, 215, 170, 0.45)' : 'var(--color-white)',
          border: `2px solid ${isSelected ? 'var(--color-primary)' : isBranchMember ? 'var(--color-orange-300)' : 'var(--color-border)'}`,
          boxShadow: isHighlighted || isSelected
            ? '0 18px 32px rgba(234, 88, 12, 0.25)'
            : isBranchMember
              ? '0 12px 22px rgba(251, 191, 36, 0.18)'
              : '0 12px 24px rgba(15, 23, 42, 0.08)',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          cursor: onSelect ? 'pointer' : 'default',
          position: 'relative',
        }}
        onClick={handleSelect}
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
        {canDeleteBranch && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${employee.name}'s branch`}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '28px',
              height: '28px',
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
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '12px',
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'rgba(234, 88, 12, 0.15)',
              color: 'var(--color-primary)',
              fontSize: '0.625rem',
              fontWeight: 600,
            }}
          >
            Selected
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(OrgChartNodeComponent);
