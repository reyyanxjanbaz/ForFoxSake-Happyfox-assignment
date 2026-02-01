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
  activeTier?: 'intern' | 'executive' | 'lead' | null;
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
  activeTier,
  className = '',
}) => {
  const [highlightsExpanded, setHighlightsExpanded] = useState(false);
  const hasActiveFilters = filterState?.results && filterState.results.length > 0;
  const matchCount = filterState?.results?.length || 0;

  const iconButtonStyle = (opts?: { compact?: boolean; active?: boolean; square?: boolean }): React.CSSProperties => ({
    width: showLabels && !opts?.compact ? '100%' : '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: showLabels && !opts?.compact ? 'flex-start' : 'center',
    gap: showLabels && !opts?.compact ? 'var(--space-2)' : 0,
    borderRadius: opts?.square ? '10px' : opts?.compact ? '999px' : '12px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: opts?.active ? '0 6px 18px rgba(249,115,22,0.18)' : 'none',
  });

  const countBadgeStyle = (compact?: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: compact ? '6px' : '2px',
    right: compact ? '6px' : '2px',
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
    boxShadow: compact ? '0 6px 18px rgba(249,115,22,0.24)' : '0 2px 8px rgba(249, 115, 22, 0.4)',
    border: '2px solid var(--color-surface)',
  });

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
    forceLabel?: boolean,
  ) => (
    <>
      {icon}
      {(showLabels || forceLabel) && <span style={labelStyle}>{label}</span>}
    </>
  );

  const renderHighlightItem = (
    title: string,
    tier: 'executive' | 'lead' | 'intern',
    isActive: boolean,
    onClick: (() => void) | undefined,
    color: string
  ): React.ReactNode => {
    if (!onClick) return null;

    const gradients = {
      executive: 'linear-gradient(90deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0) 100%)',
      lead: 'linear-gradient(90deg, rgba(250, 204, 21, 0.1) 0%, rgba(250, 204, 21, 0) 100%)',
      intern: 'linear-gradient(90deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0) 100%)',
    };

    const activeGradients = {
      executive: 'linear-gradient(90deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.05) 100%)',
      lead: 'linear-gradient(90deg, rgba(250, 204, 21, 0.2) 0%, rgba(250, 204, 21, 0.05) 100%)',
      intern: 'linear-gradient(90deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)',
    };

    return (
      <motion.button
        onClick={onClick}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          marginBottom: '6px',
          backgroundColor: isActive ? 'var(--color-surface)' : 'transparent',
          background: isActive ? activeGradients[tier] : undefined,
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Active Indicator Bar */}
        <motion.div
          animate={{
            height: isActive ? '16px' : '0px',
            opacity: isActive ? 1 : 0
          }}
          style={{
            position: 'absolute',
            left: 0,
            width: '3px',
            borderRadius: '0 2px 2px 0',
            backgroundColor: color,
          }}
        />

        {/* Color Dot Icon */}
        <div style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          backgroundColor: isActive ? color : 'rgba(128,128,128,0.1)',
          color: isActive ? '#fff' : color,
          flexShrink: 0,
        }}>
          {tier === 'executive' && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          )}
          {tier === 'lead' && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          )}
          {tier === 'intern' && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            letterSpacing: '0.01em'
          }}>
            {title}
          </span>
          {isActive && (
            <span style={{ fontSize: '0.65rem', color: color, fontWeight: 500 }}>
              Active
            </span>
          )}
        </div>

        {isActive && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ marginLeft: 'auto' }}
          >
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
             <polyline points="20 6 9 17 4 12" />
           </svg>
          </motion.div>
        )}
      </motion.button>
    );
  };

  return (
    <div className={`sidebar-slim ${className}`}>
      {/* Creative Toggle Button */}
      <motion.button
        data-testid="sidebar-toggle"
        onClick={onToggleLabels}
        initial={false}
        animate={showLabels ? { width: '100%', backgroundColor: 'var(--color-primary)' } : { width: '48px', backgroundColor: 'var(--color-primary)' }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        style={{
          ...iconButtonStyle({ compact: !showLabels, active: showLabels, square: true }),
          color: 'var(--color-white)',
          marginBottom: 'var(--space-2)',
          justifyContent: showLabels ? 'flex-start' : 'center',
          paddingLeft: showLabels ? 'var(--space-3)' : undefined,
          overflow: 'hidden',
        }}
        aria-label={showLabels ? 'Collapse sidebar' : 'Expand sidebar'}
        title={showLabels ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <motion.div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} layout>
          <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            animate={showLabels ? { rotate: 180 } : { rotate: 0 }}
            transition={{ type: 'tween', duration: 0.16, ease: 'easeInOut' }}
          >
            <path d="M9 6l6 6-6 6" />
          </motion.svg>
          {showLabels && (
            <motion.span style={{ fontWeight: 700, fontSize: '0.9rem' }} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
              Navigation
            </motion.span>
          )}
        </motion.div>
      </motion.button>

      <div style={dividerStyle} />

      {/* Filter Icon */}
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: hasActiveFilters ? 'rgba(249, 115, 22, 0.15)' : 'rgba(156, 163, 175, 0.1)' }}
        whileTap={{ scale: 0.92 }}
        onClick={onOpenFilter}
        style={{
          ...iconButtonStyle({ compact: !showLabels, active: hasActiveFilters }),
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
  {hasActiveFilters && <span style={countBadgeStyle(!showLabels)}>{matchCount}</span>}
      </motion.button>

      {/* Highlight Icon - Main Button */}
      <motion.button
        data-testid="highlights-trigger"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setHighlightsExpanded(!highlightsExpanded)}
        style={{
          ...iconButtonStyle({ compact: !showLabels, active: highlightsExpanded || highlightCount > 0 }),
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
  {highlightCount > 0 && <span style={countBadgeStyle(!showLabels)}>{highlightCount}</span>}
      </motion.button>

      {/* Expanded Highlight Menu (Redesigned) */}
      <AnimatePresence>
        {highlightsExpanded && showLabels && (
          <motion.div
            data-testid="highlight-submenu-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '8px', paddingTop: '4px' }}>
              <div style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ 
                  fontSize: '0.65rem', 
                  textTransform: 'uppercase', 
                  color: 'var(--color-text-tertiary)', 
                  fontWeight: 700, 
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                  paddingLeft: '4px'
                }}>
                  Quick Highlights
                </div>
                {renderHighlightItem('Executives', 'executive', activeTier === 'executive', onHighlightExecutives, '#f97316')}
                {renderHighlightItem('Team Leads', 'lead', activeTier === 'lead', onHighlightLeads, '#eab308')}
                {renderHighlightItem('Interns', 'intern', activeTier === 'intern', onHighlightInterns, '#22c55e')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating submenu when sidebar is collapsed */}
      <AnimatePresence>
        {highlightsExpanded && !showLabels && (
          <motion.div
            data-testid="highlight-floating-menu"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed',
              left: 'calc(var(--sidebar-width-collapsed) + 12px)',
              top: '120px',
              zIndex: 1200,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 6,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              width: 190,
            }}
          >
             <div style={{ 
                fontSize: '0.65rem', 
                textTransform: 'uppercase', 
                color: 'var(--color-text-secondary)', 
                fontWeight: 700, 
                padding: '6px 8px',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '6px'
              }}>
                Highlight...
              </div>
              
              {/* Reuse the same render logic but simplified container */}
              {renderHighlightItem('Executives', 'executive', activeTier === 'executive', onHighlightExecutives, '#f97316')}
              {renderHighlightItem('Team Leads', 'lead', activeTier === 'lead', onHighlightLeads, '#eab308')}
              {renderHighlightItem('Interns', 'intern', activeTier === 'intern', onHighlightInterns, '#22c55e')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Org Tree Icon */}
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(156, 163, 175, 0.1)' }}
        whileTap={{ scale: 0.92 }}
        onClick={onOpenTree}
  style={iconButtonStyle({ compact: !showLabels })}
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
          ...iconButtonStyle({ compact: !showLabels }),
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
  style={iconButtonStyle({ compact: !showLabels })}
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
