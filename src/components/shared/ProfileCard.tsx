// Legacy ProfileCard component used across the org chart and sidebar views

import React, { useMemo, useCallback } from 'react';
import { useLazyImage } from '../../hooks/useLazyImage';
import type { Employee } from '../../features/org-chart/state/employee';

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
}

const SIZE_TOKENS: Record<'small' | 'medium' | 'large', SizeTokens> = {
  small: {
    padding: 6,
    gap: 6,
    avatar: 28,
    heading: '0.85rem',
    subtext: '0.68rem',
    meta: '0.62rem',
    badgePadding: '1px 6px',
  },
  medium: {
    padding: 16,
    gap: 12,
    avatar: 44,
    heading: '1rem',
    subtext: '0.8rem',
    meta: '0.74rem',
    badgePadding: '3px 8px',
  },
  large: {
    padding: 20,
    gap: 14,
    avatar: 56,
    heading: '1.1rem',
    subtext: '0.9rem',
    meta: '0.8rem',
    badgePadding: '4px 10px',
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
    onClick?.(employee);
  }, [employee, onClick]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(employee);
    }
  }, [employee, onClick]);

  const tierTokens = TIER_TOKENS[employee.tier];
  const sizeTokens = SIZE_TOKENS[size];
  const themeTokens = THEME_TOKENS[theme];

  const wrapperStyles = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'column',
    padding: sizeTokens.padding,
    gap: sizeTokens.gap,
    borderRadius: 18,
    background: themeTokens.background,
    border: `1px solid ${isHighlighted ? tierTokens.border : themeTokens.borderDefault}`,
    boxShadow: isHighlighted ? themeTokens.highlightShadow : themeTokens.shadow,
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    cursor: onClick ? 'pointer' : 'default',
    outline: 'none',
  }), [isHighlighted, onClick, sizeTokens.gap, sizeTokens.padding, themeTokens, tierTokens.border]);

  const accentBarStyles = useMemo<React.CSSProperties>(() => ({
    height: themeTokens.accentBarHeight,
    borderRadius: 999,
    background: tierTokens.accent,
    opacity: themeTokens.accentBarOpacity,
  }), [themeTokens.accentBarHeight, themeTokens.accentBarOpacity, tierTokens.accent]);

  const headerStyles: React.CSSProperties = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: sizeTokens.gap,
  }), [sizeTokens.gap]);

  const avatarStyles = useMemo<React.CSSProperties>(() => ({
    width: sizeTokens.avatar,
    height: sizeTokens.avatar,
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
  }), [sizeTokens.avatar, themeTokens.avatarTextColor, tierTokens.avatarTint, tierTokens.accentMuted]);

  const badgeStyles = useMemo<React.CSSProperties>(() => {
    const isLight = theme === 'light';
    return {
      padding: sizeTokens.badgePadding,
      borderRadius: 999,
      background: isLight ? themeTokens.badgeBackground : tierTokens.accentMuted,
      color: isLight ? tierTokens.accent : themeTokens.badgeText,
      border: `1px solid ${isLight ? themeTokens.badgeBorder : tierTokens.accentMuted}`,
      fontSize: sizeTokens.meta,
      fontWeight: 600,
      lineHeight: 1,
    } satisfies React.CSSProperties;
  }, [sizeTokens.badgePadding, sizeTokens.meta, theme, themeTokens.badgeBackground, themeTokens.badgeBorder, themeTokens.badgeText, tierTokens.accent, tierTokens.accentMuted]);

  const identityStyles = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }), []);

  const nameStyles = useMemo<React.CSSProperties>(() => ({
    margin: 0,
    fontSize: sizeTokens.heading,
    fontWeight: 600,
    color: themeTokens.textPrimary,
    lineHeight: 1.2,
  }), [sizeTokens.heading, themeTokens.textPrimary]);

  const roleStyles = useMemo<React.CSSProperties>(() => ({
    margin: 0,
    fontSize: sizeTokens.subtext,
    color: themeTokens.textSecondary,
    lineHeight: 1.2,
  }), [sizeTokens.subtext, themeTokens.textSecondary]);

  const metaStyles = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    fontSize: sizeTokens.meta,
    color: themeTokens.meta,
  }), [sizeTokens.meta, themeTokens.meta]);

  const computedClassName = useMemo(() => {
    const base = 'profile-card-legacy';
    return className ? `${base} ${className}` : base;
  }, [className]);

  return (
    <div
      className={computedClassName}
      style={wrapperStyles}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
      onMouseEnter={(event) => {
        if (!onClick) return;
        (event.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(event) => {
        if (!onClick) return;
        (event.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
      onFocus={(event) => {
        if (!onClick) return;
        (event.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onBlur={(event) => {
        if (!onClick) return;
        (event.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
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
            <span>{initials}</span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
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
            <span style={badgeStyles} aria-label="Employee ID">
              {employee.employeeId}
            </span>
          </div>
          {(showTeam || size !== 'small') && (
            <div style={metaStyles}>
              {showTeam && employee.team && (
                <span title={employee.team}>{employee.team}</span>
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