// Single-layer ProfileCard component used across the org chart and sidebar views

import React, { useMemo, useCallback } from 'react';
import type { DOMAttributes } from 'react';
import { useLazyImage } from '../../hooks/useLazyImage';
import type { Employee } from '../../features/org-chart/state/employee';
import type { DragState } from '../../features/org-chart/hooks/useDragAndDrop';
import type { Transform } from '@dnd-kit/utilities';

// Add CSS animation for pulsing effect
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;
if (!document.head.querySelector('style[data-profile-card-animations]')) {
  style.setAttribute('data-profile-card-animations', 'true');
  document.head.appendChild(style);
}

type ProfileCardTheme = 'light' | 'dark';

export interface ProfileCardProps {
  employee: Employee;
  isHighlighted?: boolean;
  size?: 'small' | 'medium' | 'large';
  showRole?: boolean;
  showTeam?: boolean;
  onClick?: (employee: Employee) => void;
  className?: string;
  theme?: ProfileCardTheme;
  
  // React Flow node props for when used as complete node
  isOrgChartNode?: boolean;
  isSelected?: boolean;
  isBranchMember?: boolean;
  onSelect?: (employeeId: string) => void;
  onDeleteBranch?: (employeeId: string) => void;
  dragState?: DragState;
  enableDragAndDrop?: boolean;
  dragHandlers?: ProfileCardDragHandlers;
}

interface ProfileCardDragHandlers {
  ref?: (node: HTMLElement | null) => void;
  attributes?: React.HTMLAttributes<HTMLDivElement>;
  listeners?: Partial<DOMAttributes<HTMLElement>>;
  isDragging?: boolean;
  isOver?: boolean;
  transform?: Transform | null;
}

interface TierTokens {
  border: string;
  accent: string;
  accentMuted: string;
  avatarTint: string;
}

const TIER_TOKENS: Record<Employee['tier'], TierTokens> = {
  executive: {
    border: 'rgba(249, 115, 22, 0.65)',
    accent: '#f97316',
    accentMuted: 'rgba(249, 115, 22, 0.15)',
    avatarTint: 'rgba(249, 115, 22, 0.18)',
  },
  lead: {
    border: 'rgba(250, 204, 21, 0.55)',
    accent: '#facc15',
    accentMuted: 'rgba(250, 204, 21, 0.14)',
    avatarTint: 'rgba(250, 204, 21, 0.16)',
  },
  manager: {
    border: 'rgba(14, 165, 233, 0.55)',
    accent: '#0ea5e9',
    accentMuted: 'rgba(14, 165, 233, 0.14)',
    avatarTint: 'rgba(14, 165, 233, 0.18)',
  },
  individual: {
    border: 'rgba(99, 102, 241, 0.55)',
    accent: '#6366f1',
    accentMuted: 'rgba(99, 102, 241, 0.14)',
    avatarTint: 'rgba(99, 102, 241, 0.18)',
  },
  intern: {
    border: 'rgba(34, 197, 94, 0.5)',
    accent: '#22c55e',
    accentMuted: 'rgba(34, 197, 94, 0.14)',
    avatarTint: 'rgba(34, 197, 94, 0.18)',
  },
};

interface SizeTokens {
  padding: number;
  gap: number;
  avatar: number;
  heading: string;
  subtext: string;
  meta: string;
  badgePadding: string;
  minHeight: number;
}

const SIZE_TOKENS: Record<'small' | 'medium' | 'large', SizeTokens> = {
  small: {
    padding: 8,
    gap: 6,
    avatar: 32,
    heading: '0.85rem',
    subtext: '0.7rem',
    meta: '0.65rem',
    badgePadding: '2px 6px',
    minHeight: 82,
  },
  medium: {
    padding: 10,
    gap: 6,
    avatar: 48,
    heading: '1rem',
    subtext: '0.82rem',
    meta: '0.72rem',
    badgePadding: '4px 9px',
    minHeight: 136,
  },
  large: {
    padding: 16,
    gap: 12,
    avatar: 48,
    heading: '1.05rem',
    subtext: '0.85rem',
    meta: '0.75rem',
    badgePadding: '4px 10px',
    minHeight: 168,
  },
};

interface ThemeTokens {
  background: string;
  borderDefault: string;
  textPrimary: string;
  textSecondary: string;
  meta: string;
  badgeBackground: string;
  badgeBorder: string;
  badgeText: string;
  shadow: string;
  highlightShadow: string;
  accentBarOpacity: number;
  accentBarHeight: number;
  avatarTextColor: string;
}

const THEME_TOKENS: Record<ProfileCardTheme, ThemeTokens> = {
  light: {
    background: 'transparent',
    borderDefault: 'transparent',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    meta: '#64748b',
    badgeBackground: 'rgba(148, 163, 184, 0.16)',
    badgeBorder: 'rgba(203, 213, 225, 0.7)',
    badgeText: '#0f172a',
    shadow: '0 10px 18px rgba(15, 23, 42, 0.08)',
    highlightShadow: '0 16px 32px rgba(249, 115, 22, 0.2)',
    accentBarOpacity: 0.85,
    accentBarHeight: 3,
    avatarTextColor: '#1f2937',
  },
  dark: {
    background: 'rgba(15, 23, 42, 0.88)',
    borderDefault: 'rgba(148, 163, 184, 0.35)',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5f5',
    meta: '#94a3b8',
    badgeBackground: 'rgba(15, 23, 42, 0.55)',
    badgeBorder: 'rgba(255, 255, 255, 0.2)',
    badgeText: 'rgba(255, 255, 255, 0.95)',
    shadow: '0 10px 24px rgba(15, 23, 42, 0.18)',
    highlightShadow: '0 16px 36px rgba(249, 115, 22, 0.22)',
    accentBarOpacity: 0.9,
    accentBarHeight: 4,
    avatarTextColor: '#ffffff',
  },
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  employee,
  isHighlighted = false,
  size = 'medium',
  showRole = true,
  showTeam = true,
  onClick,
  className = '',
  theme = 'light',
  
  // React Flow node props
  isOrgChartNode = false,
  isSelected = false,
  isBranchMember = false,
  onSelect,
  onDeleteBranch,
  dragState,
  enableDragAndDrop = false,
  dragHandlers,
}) => {
  const photoSrc = useMemo(() => {
    if (employee.photoUrl) return employee.photoUrl;
    if (employee.photoAssetKey) {
      return employee.photoAssetKey.startsWith('http')
        ? employee.photoAssetKey
        : `/assets/photos/${employee.photoAssetKey}.jpg`;
    }
    return undefined;
  }, [employee.photoAssetKey, employee.photoUrl]);

  const lazyImage = useLazyImage({
    src: photoSrc ?? '',
    alt: `${employee.name} profile photo`,
    rootMargin: '120px',
    threshold: 0.15,
  });

  const initials = useMemo(() => (
    employee.name
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'FX'
  ), [employee.name]);

  const handleClick = useCallback(() => {
    if (isOrgChartNode) {
      if (dragState?.isDragging) {
        return; // Avoid triggering selection while dragging
      }
      onSelect?.(employee.id);
    } else {
      onClick?.(employee);
    }
  }, [isOrgChartNode, employee, onClick, onSelect, dragState?.isDragging]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isOrgChartNode) {
      if (!onSelect) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(employee.id);
      }
    } else {
      if (!onClick) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick(employee);
      }
    }
  }, [isOrgChartNode, employee, onClick, onSelect]);

  const handleDelete = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    onDeleteBranch?.(employee.id);
  }, [employee.id, onDeleteBranch]);

  const tierTokens = TIER_TOKENS[employee.tier];
  const sizeTokens = SIZE_TOKENS[size];
  const themeTokens = THEME_TOKENS[theme];
  const avatarDimension = isOrgChartNode ? Math.min(sizeTokens.avatar + 20, 80) : sizeTokens.avatar;

  const wrapperStyles = useMemo<React.CSSProperties>(() => {
    if (isOrgChartNode) {
      // Org chart node styling - complete node behavior
      const isDragSource = dragHandlers?.isDragging;
      const canAcceptDrop = Boolean(
        dragState?.isDragging &&
        dragState.draggedEmployeeId !== employee.id &&
        dragState.validDropTargets.includes(employee.id)
      );
      const isDropHover = dragHandlers?.isOver && canAcceptDrop;
      
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

      return {
        display: 'flex',
        flexDirection: 'column',
        width: '280px',
  height: '160px',
        padding: sizeTokens.padding,
        gap: sizeTokens.gap,
        borderRadius: '14px',
        background: backgroundColor,
        border: `2px solid ${borderColor}`,
        boxShadow,
        transition: 'all 0.2s ease',
  justifyContent: 'space-between',
        cursor: enableDragAndDrop ? (isDragSource ? 'grabbing' : 'grab') : onSelect ? 'pointer' : 'default',
        outline: 'none',
        overflow: 'hidden',
        position: 'relative',
        opacity: isDragSource ? 0.7 : 1,
        transform: isDragSource ? 'scale(1.05)' : dragHandlers?.transform ? `translate3d(${dragHandlers.transform.x}px, ${dragHandlers.transform.y}px, 0) scale(1.05)` : 'scale(1)',
        zIndex: isDragSource ? 1000 : 'auto',
        touchAction: enableDragAndDrop ? 'none' : 'auto',
        userSelect: enableDragAndDrop ? 'none' : 'auto',
      };
    }

    // Regular ProfileCard styling
    return {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      minHeight: `${sizeTokens.minHeight}px`,
      padding: sizeTokens.padding,
      gap: sizeTokens.gap,
      borderRadius: 14,
      background: themeTokens.background,
      border: `1px solid ${isHighlighted ? tierTokens.border : themeTokens.borderDefault}`,
      boxShadow: isHighlighted ? themeTokens.highlightShadow : themeTokens.shadow,
      transition: 'transform 150ms ease, box-shadow 150ms ease',
      cursor: onClick ? 'pointer' : 'default',
      outline: 'none',
      overflow: 'hidden',
      position: 'relative',
    };
  }, [isOrgChartNode, isHighlighted, isSelected, isBranchMember, onClick, onSelect, sizeTokens, themeTokens, tierTokens, dragState, dragHandlers, enableDragAndDrop, employee.id]);

  const accentBarStyles = useMemo<React.CSSProperties>(() => ({
    height: themeTokens.accentBarHeight,
    borderRadius: 999,
    background: tierTokens.accent,
    opacity: themeTokens.accentBarOpacity,
  }), [themeTokens.accentBarHeight, themeTokens.accentBarOpacity, tierTokens.accent]);

  const headerStyles: React.CSSProperties = useMemo(() => ({
    display: 'flex',
    alignItems: isOrgChartNode ? 'flex-start' : 'center',
    gap: sizeTokens.gap,
    flex: 1,
  }), [isOrgChartNode, sizeTokens.gap]);

  const avatarStyles = useMemo<React.CSSProperties>(() => ({
    width: avatarDimension,
    height: avatarDimension,
    borderRadius: '50%',
    background: tierTokens.avatarTint,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    color: themeTokens.avatarTextColor,
    overflow: 'hidden',
    flexShrink: 0,
    border: `2px solid ${tierTokens.accentMuted}`,
    boxShadow: '0 6px 14px rgba(15, 23, 42, 0.15)',
  }), [avatarDimension, themeTokens.avatarTextColor, tierTokens.avatarTint, tierTokens.accentMuted]);

  const badgeStyles = useMemo<React.CSSProperties>(() => {
    const isLight = theme === 'light';
    return {
      padding: sizeTokens.badgePadding,
      borderRadius: 999,
      background: isLight ? themeTokens.badgeBackground : tierTokens.accentMuted,
      color: isLight ? tierTokens.accent : themeTokens.badgeText,
      border: `1px solid ${isLight ? themeTokens.badgeBorder : tierTokens.accentMuted}`,
      fontSize: sizeTokens.meta,
      fontWeight: 700,
      lineHeight: 1,
    } satisfies React.CSSProperties;
  }, [sizeTokens.badgePadding, sizeTokens.meta, theme, themeTokens.badgeBackground, themeTokens.badgeBorder, themeTokens.badgeText, tierTokens.accent, tierTokens.accentMuted]);

  const identityStyles = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: isOrgChartNode ? 4 : 2,
    flex: 1,
    minWidth: 0,
  }), [isOrgChartNode]);

  const nameStyles = useMemo<React.CSSProperties>(() => ({
    margin: 0,
    fontSize: isOrgChartNode ? '1.18rem' : sizeTokens.heading,
    fontWeight: isOrgChartNode ? 700 : 600,
    color: themeTokens.textPrimary,
    lineHeight: 1.2,
    overflow: isOrgChartNode ? 'visible' : 'hidden',
    textOverflow: isOrgChartNode ? 'clip' : 'ellipsis',
    whiteSpace: isOrgChartNode ? 'normal' : 'nowrap',
    maxWidth: '100%',
  }), [isOrgChartNode, sizeTokens.heading, themeTokens.textPrimary]);

  const roleStyles = useMemo<React.CSSProperties>(() => ({
    margin: 0,
    fontSize: isOrgChartNode ? '0.95rem' : sizeTokens.subtext,
    color: themeTokens.textSecondary,
    lineHeight: 1.35,
    fontWeight: isOrgChartNode ? 600 : 500,
    overflow: isOrgChartNode ? 'visible' : 'hidden',
    textOverflow: isOrgChartNode ? 'clip' : 'ellipsis',
    whiteSpace: isOrgChartNode ? 'normal' : 'nowrap',
    maxWidth: '100%',
  }), [isOrgChartNode, sizeTokens.subtext, themeTokens.textSecondary]);

  const metaStyles = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: isOrgChartNode ? 'column' : undefined,
    flexWrap: isOrgChartNode ? undefined : 'wrap',
    gap: isOrgChartNode ? 4 : 6,
    fontSize: isOrgChartNode ? '0.9rem' : sizeTokens.meta,
    color: themeTokens.meta,
    fontWeight: 600,
  }), [isOrgChartNode, sizeTokens.meta, themeTokens.meta]);

  const detailsColumnStyles = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: isOrgChartNode ? 12 : 6,
    flex: 1,
    minWidth: 0,
    justifyContent: isOrgChartNode ? 'space-between' : 'flex-start',
  }), [isOrgChartNode]);

  const headingRowStyles = useMemo<React.CSSProperties>(() => {
    if (isOrgChartNode) {
      return {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-start',
      } satisfies React.CSSProperties;
    }

    return {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
    } satisfies React.CSSProperties;
  }, [isOrgChartNode]);

  const computedClassName = useMemo(() => {
    const base = 'profile-card';
    return className ? `${base} ${className}` : base;
  }, [className]);

  return (
    <div
      ref={isOrgChartNode ? dragHandlers?.ref : undefined}
      {...(isOrgChartNode ? dragHandlers?.attributes : {})}
      className={computedClassName}
      style={wrapperStyles}
      onClick={(onClick || onSelect) ? handleClick : undefined}
      onKeyDown={(onClick || onSelect) ? handleKeyDown : undefined}
      tabIndex={(onClick || onSelect) ? 0 : -1}
      role={(onClick || onSelect) ? 'button' : undefined}
      onMouseEnter={(event) => {
        if (isOrgChartNode || !onClick) return;
        (event.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(event) => {
        if (isOrgChartNode || !onClick) return;
        (event.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
      onFocus={(event) => {
        if (isOrgChartNode || !onClick) return;
        (event.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onBlur={(event) => {
        if (isOrgChartNode || !onClick) return;
        (event.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Org Chart Node Action Buttons */}
      {isOrgChartNode && onDeleteBranch && (
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
            style={{
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
              fontSize: '0.875rem',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 6px 14px rgba(15, 23, 42, 0.15)',
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
        </div>
      )}

      {/* Org Chart Node Drag Handle */}
      {isOrgChartNode && enableDragAndDrop && (
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          zIndex: 2,
        }}>
          <button
            type="button"
            {...(dragHandlers?.listeners || {})}
            aria-label={`Move ${employee.name}`}
            title={`Drag to move ${employee.name}`}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '999px',
              backgroundColor: 'rgba(107, 114, 128, 0.8)',
              color: 'var(--color-white)',
              border: 'none',
              cursor: dragHandlers?.isDragging ? 'grabbing' : 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 6px 14px rgba(107, 114, 128, 0.25)',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 1)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.8)';
            }}
          >
            ⋮⋮
          </button>
        </div>
      )}

      {/* Org Chart Node Status Indicator */}
      {isOrgChartNode && (isSelected || dragHandlers?.isDragging || (dragState?.isDragging && dragState.validDropTargets.includes(employee.id))) && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '3px 10px',
            borderRadius: '999px',
            backgroundColor: (() => {
              const canAcceptDrop = Boolean(
                dragState?.isDragging &&
                dragState.draggedEmployeeId !== employee.id &&
                dragState.validDropTargets.includes(employee.id)
              );
              const isDropHover = dragHandlers?.isOver && canAcceptDrop;
              
              if (canAcceptDrop) {
                return isDropHover ? '#10b981' : '#34d399';
              }
              return dragHandlers?.isDragging ? 'rgba(14, 116, 144, 0.9)' : 'rgba(234, 88, 12, 0.9)';
            })(),
            color: 'white',
            fontSize: '0.625rem',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            animation: (dragHandlers?.isDragging || (dragState?.isDragging && dragState.validDropTargets.includes(employee.id))) ? 'pulse 1.5s infinite' : 'none',
            zIndex: 1,
          }}
        >
          {(() => {
            const canAcceptDrop = Boolean(
              dragState?.isDragging &&
              dragState.draggedEmployeeId !== employee.id &&
              dragState.validDropTargets.includes(employee.id)
            );
            const isDropHover = dragHandlers?.isOver && canAcceptDrop;
            
            if (canAcceptDrop) {
              return isDropHover ? '⬇️ DROP HERE' : '✅ VALID TARGET';
            }
            return dragHandlers?.isDragging ? '🔄 MOVING' : '✓ SELECTED';
          })()}
        </div>
      )}

      <div style={accentBarStyles} aria-hidden />
      <div style={headerStyles}>
        <div style={avatarStyles} aria-hidden={!photoSrc}>
          {photoSrc && !lazyImage.isError ? (
            <img
              ref={lazyImage.imgRef}
              src={lazyImage.src}
              alt={`Portrait of ${employee.name}`}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <span style={{ fontSize: `${avatarDimension * 0.4}px`, fontWeight: 700 }}>{initials}</span>
          )}
        </div>
        <div style={detailsColumnStyles}>
          <div style={headingRowStyles}>
            <div style={identityStyles}>
              <h3 style={nameStyles} title={employee.name}>
                {employee.name}
              </h3>
              {showRole && (
                <p style={roleStyles} title={employee.designation}>
                  {employee.designation}
                </p>
              )}
            </div>
            <span
              style={isOrgChartNode ? { ...badgeStyles, fontSize: '1rem', padding: '6px 12px', letterSpacing: '0.08em', alignSelf: 'flex-start' } : badgeStyles}
              aria-label="Employee ID"
            >
              {employee.employeeId}
            </span>
          </div>
          {(showTeam || size !== 'small') && (
            <div style={metaStyles}>
              {showTeam && employee.team && (
                <span 
                  title={employee.team}
                  style={isOrgChartNode
                    ? {
                        display: 'block',
                        fontWeight: 600,
                        wordBreak: 'break-word',
                        lineHeight: 1.3,
                      }
                    : {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '120px',
                      }
                  }
                >
                  {employee.team}
                </span>
              )}
              <span>{employee.tier.charAt(0).toUpperCase() + employee.tier.slice(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;