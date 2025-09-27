// Filter panel component with Framer Motion accordion and AND logic

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Employee } from '../../features/org-chart/state/employee';
import type { FilterState } from '../../features/org-chart/state/filterState';

export interface FilterCriteria {
  name: string;
  designation: string;
  employeeId: string;
}

export interface FilterPanelProps {
  employees?: Employee[];
  filterState?: FilterState;
  onFilterChange?: (criteria: FilterCriteria, changedField: keyof FilterCriteria) => void;
  onClearFilters?: () => void;
  className?: string;
  isCollapsed?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  employees = [],
  filterState,
  onFilterChange,
  onClearFilters,
  className = '',
  isCollapsed = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!isCollapsed);
  const [localFilters, setLocalFilters] = useState<FilterCriteria>({
    name: '',
    designation: '',
    employeeId: '',
  });

  // Keep local inputs in sync with external filter state
  useEffect(() => {
    if (!filterState) return;

    setLocalFilters(prev => {
      const nextFilters: FilterCriteria = {
        name: filterState.nameQuery,
        designation: filterState.designationQuery,
        employeeId: filterState.employeeIdQuery,
      };

      const isDifferent =
        prev.name !== nextFilters.name ||
        prev.designation !== nextFilters.designation ||
        prev.employeeId !== nextFilters.employeeId;

      return isDifferent ? nextFilters : prev;
    });
  }, [filterState?.nameQuery, filterState?.designationQuery, filterState?.employeeIdQuery, filterState]);

  // Derive unique values for filter options
  const filterOptions = useMemo(() => {
    const designations = new Set<string>();
    const teams = new Set<string>();
    const tiers = new Set<Employee['tier']>();

    employees.forEach(employee => {
      if (employee.designation) designations.add(employee.designation);
      if (employee.team) teams.add(employee.team);
      tiers.add(employee.tier);
    });

    return {
      designations: Array.from(designations).sort(),
      teams: Array.from(teams).sort(),
      tiers: Array.from(tiers).sort(),
    };
  }, [employees]);

  // Apply filters with debouncing
  const handleInputChange = (field: keyof FilterCriteria, value: string) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange?.(newFilters, field);
  };

  const handleClearAll = () => {
    const clearedFilters: FilterCriteria = {
      name: '',
      designation: '',
      employeeId: '',
    };
    setLocalFilters(clearedFilters);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const hasActiveFilters = Object.values(localFilters).some((value) => value.trim().length > 0);
  const matchCount = filterState?.results?.length || 0;

  const panelStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-white)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--border-radius)',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-3) var(--space-4)',
    backgroundColor: 'var(--color-surface)',
    borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none',
    cursor: 'pointer',
    transition: 'background-color var(--duration-fast) ease',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  };

  const chevronStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    transition: 'transform var(--duration-fast) ease',
    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 'var(--space-2) var(--space-3)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    backgroundColor: 'var(--color-white)',
    color: 'var(--color-text-primary)',
    transition: 'border-color var(--duration-fast) ease',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-1)',
  };

  const fieldGroupStyle: React.CSSProperties = {
    marginBottom: 'var(--space-4)',
  };

  const buttonStyle: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all var(--duration-fast) ease',
    border: '1px solid var(--color-border)',
  };

  const clearButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: hasActiveFilters ? 'var(--color-white)' : 'var(--color-gray-100)',
    color: hasActiveFilters ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
    cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
  };

  return (
    <div className={`filter-panel ${className}`} style={panelStyle}>
      {/* Header */}
      <div
        style={headerStyle}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface)';
        }}
      >
        <h3 style={titleStyle}>
          <span>Filters</span>
          {hasActiveFilters && (
            <span style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-white)',
              fontSize: '0.625rem',
              padding: '2px 6px',
              borderRadius: '10px',
              minWidth: '16px',
              textAlign: 'center',
            }}>
              {matchCount}
            </span>
          )}
        </h3>
        <span style={chevronStyle}>▶</span>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: 'easeInOut',
              opacity: { duration: 0.2 }
            }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: 'var(--space-4)' }}>
              {/* Name Filter */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle} htmlFor="filter-name">
                  Name
                </label>
                <input
                  id="filter-name"
                  type="text"
                  placeholder="Search by name..."
                  value={localFilters.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Designation Filter */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle} htmlFor="filter-designation">
                  Job Title
                </label>
                <select
                  id="filter-designation"
                  value={localFilters.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  style={selectStyle}
                >
                  <option value="">All positions</option>
                  {filterOptions.designations.map(designation => (
                    <option key={designation} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee ID Filter */}
              <div style={fieldGroupStyle}>
                <label style={labelStyle} htmlFor="filter-id">
                  Employee ID
                </label>
                <input
                  id="filter-id"
                  type="text"
                  placeholder="e.g. EMP1234"
                  value={localFilters.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Filter Controls */}
              <div style={{
                display: 'flex',
                gap: 'var(--space-2)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
              }}>
                <button
                  onClick={handleClearAll}
                  disabled={!hasActiveFilters}
                  style={clearButtonStyle}
                  onMouseEnter={(e) => {
                    if (hasActiveFilters) {
                      e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hasActiveFilters) {
                      e.currentTarget.style.backgroundColor = 'var(--color-white)';
                    }
                  }}
                >
                  Clear All
                </button>

                {hasActiveFilters && (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                  }}>
                    {matchCount} match{matchCount !== 1 ? 'es' : ''}
                  </div>
                )}
              </div>

              {/* Active Filters Tags */}
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 'var(--space-3)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-1)',
                  }}
                >
                  {Object.entries(localFilters).map(([key, value]) => {
                    if (!value) return null;
                    
                    const displayKey = key === 'employeeId' ? 'ID' : 
                                     key.charAt(0).toUpperCase() + key.slice(1);
                    
                    return (
                      <span
                        key={key}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                          padding: '2px 6px',
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          fontSize: '0.625rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {displayKey}: {String(value)}
                        <button
                          onClick={() => handleInputChange(key as keyof FilterCriteria, '')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            fontSize: '0.625rem',
                            padding: 0,
                            marginLeft: '2px',
                          }}
                          aria-label={`Remove ${displayKey} filter`}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterPanel;