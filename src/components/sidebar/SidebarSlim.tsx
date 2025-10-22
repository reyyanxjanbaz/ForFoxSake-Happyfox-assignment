// Modern slim sidebar with icon-based navigation inspired by contemporary design patterns

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FilterState } from '../../features/org-chart/state/filterState';

interface SidebarSlimProps {
  showLabels: boolean;
  onToggleLabels: () => void;
  filterState?: FilterState;
  highlightCount: number;
  onOpenFilter: () => void;
  onOpenTree: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onHighlightInterns?: () => void;
  onHighlightExecutives?: () => void;
  onHighlightLeads?: () => void;
  className?: string;
}

export const SidebarSlim: React.FC<SidebarSlimProps> = ({
  showLabels,
  onToggleLabels,
  filterState,
  highlightCount,
  onOpenFilter,
  onOpenTree,
  onOpenSettings,
  onOpenHelp,
  onHighlightInterns,
  onHighlightExecutives,
  onHighlightLeads,
  className = '',
}) => {
  const [highlightsExpanded, setHighlightsExpanded] = useState(false);
  const hasActiveFilters = filterState?.results && filterState.results.length > 0;
  const matchCount = filterState?.results?.length || 0;

  const iconButtonStyle: React.CSSProperties = {
    width: showLabels ? '100%' : '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: showLabels ? 'flex-start' : 'center',
    gap: showLabels ? 'var(--space-2)' : 0,
    borderRadius: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const countBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    right: '2px',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-white)',
    fontSize: '0.625rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 5px',
    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
    border: '2px solid var(--color-surface)',
  };

  const dividerStyle: React.CSSProperties = {
    width: '32px',
    height: '1px',
    backgroundColor: 'var(--color-border)',
    margin: 'var(--space-2) 0',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  };

  const renderButtonContent = (
    icon: React.ReactNode,
    label: string,
  ) => (
    <>
      {icon}
      {showLabels && <span style={labelStyle}>{label}</span>}
    </>
  );

  return (
    <div className={`sidebar-slim ${className}`}>
      {/* Toggle Button */}
      <motion.button
        onClick={onToggleLabels}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(249, 115, 22, 0.95)' }}
        whileTap={{ scale: 0.92 }}
        style={{
          ...iconButtonStyle,
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-white)',
          marginBottom: 'var(--space-2)',
          boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
          justifyContent: 'center',
        }}
        aria-label={showLabels ? 'Collapse sidebar labels' : 'Expand sidebar labels'}
        title={showLabels ? 'Collapse labels' : 'Expand labels'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </motion.button>

      <div style={dividerStyle} />

      {/* Filter Icon */}
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: hasActiveFilters ? 'rgba(249, 115, 22, 0.15)' : 'rgba(156, 163, 175, 0.1)' }}
        whileTap={{ scale: 0.92 }}
        onClick={onOpenFilter}
        style={{
          ...iconButtonStyle,
          backgroundColor: hasActiveFilters ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
        }}
        title={hasActiveFilters ? `${matchCount} filtered result${matchCount !== 1 ? 's' : ''}` : 'No active filters'}
      >
        {renderButtonContent(
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={hasActiveFilters ? 'var(--color-primary)' : 'var(--color-text-secondary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>,
          'Filters'
        )}
        {hasActiveFilters && <span style={countBadgeStyle}>{matchCount}</span>}
      </motion.button>

      {/* Highlight Icon - Main Button */}
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: highlightCount > 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(156, 163, 175, 0.1)' }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setHighlightsExpanded(!highlightsExpanded)}
        style={{
          ...iconButtonStyle,
          backgroundColor: highlightsExpanded || highlightCount > 0 ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
        }}
        title={highlightCount > 0 ? `${highlightCount} highlighted employee${highlightCount !== 1 ? 's' : ''}` : 'Highlights'}
      >
        {renderButtonContent(
          <svg width="20" height="20" viewBox="0 0 24 24" fill={highlightCount > 0 ? 'var(--color-primary)' : 'none'} stroke={highlightCount > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>,
          'Highlights'
        )}
        {highlightCount > 0 && <span style={countBadgeStyle}>{highlightCount}</span>}
      </motion.button>

      {/* Highlight Submenu */}
      <AnimatePresence>
        {highlightsExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', paddingLeft: 'var(--space-2)' }}
          >
            {onHighlightInterns && (
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                whileTap={{ scale: 0.92 }}
                onClick={onHighlightInterns}
                style={{
                  ...iconButtonStyle,
                  width: 'calc(100% - var(--space-2))',
                  marginBottom: 'var(--space-1)',
                }}
                title="Highlight all interns"
              >
                {renderButtonContent(
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>,
                  'Interns'
                )}
              </motion.button>
            )}

            {onHighlightExecutives && (
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(249, 115, 22, 0.15)' }}
                whileTap={{ scale: 0.92 }}
                onClick={onHighlightExecutives}
                style={{
                  ...iconButtonStyle,
                  width: 'calc(100% - var(--space-2))',
                  marginBottom: 'var(--space-1)',
                }}
                title="Highlight all executives"
              >
                {renderButtonContent(
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>,
                  'Executives'
                )}
              </motion.button>
            )}

            {onHighlightLeads && (
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(250, 204, 21, 0.15)' }}
                whileTap={{ scale: 0.92 }}
                onClick={onHighlightLeads}
                style={{
                  ...iconButtonStyle,
                  width: 'calc(100% - var(--space-2))',
                  marginBottom: 'var(--space-1)',
                }}
                title="Highlight all team leads"
              >
                {renderButtonContent(
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="16 11 18 13 22 9" />
                  </svg>,
                  'Team Leads'
                )}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Org Tree Icon */}
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(156, 163, 175, 0.1)' }}
        whileTap={{ scale: 0.92 }}
        onClick={onOpenTree}
        style={iconButtonStyle}
        title="Organization hierarchy"
      >
        {renderButtonContent(
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>,
          'Org Tree'
        )}
      </motion.button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      <div style={dividerStyle} />

      {/* Settings Button */}
      <motion.button
        onClick={onOpenSettings}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(148, 163, 184, 0.12)' }}
        whileTap={{ scale: 0.92 }}
        style={{
          ...iconButtonStyle,
          marginBottom: 'var(--space-1)',
        }}
        title="Quick settings"
      >
        {renderButtonContent(
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.21 7.1a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>,
          'Settings'
        )}
      </motion.button>

      {/* Help Icon */}
      <motion.button
        onClick={onOpenHelp}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
        whileTap={{ scale: 0.92 }}
        style={iconButtonStyle}
        title="Help & Documentation"
      >
        {renderButtonContent(
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>,
          'Help'
        )}
      </motion.button>
    </div>
  );
};
