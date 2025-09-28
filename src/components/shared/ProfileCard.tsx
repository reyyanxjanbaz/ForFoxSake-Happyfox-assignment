// Legacy ProfileCard component used across the org chart and sidebar views

import React, { useMemo, useCallback } from 'react';
import { useLazyImage } from '../../hooks/useLazyImage';
import type { Employee } from '../../features/org-chart/state/employee';

export interface ProfileCardProps {
  employee: Employee;
  isHighlighted?: boolean;
  size?: 'small' | 'medium' | 'large';
  showRole?: boolean;
  showTeam?: boolean;
  onClick?: (employee: Employee) => void;
  className?: string;
}

interface TierTokens {
  highlightBorder: string;
  accent: string;
  accentMuted: string;
  avatarTint: string;
  badgeText: string;
}

const TIER_TOKENS: Record<Employee['tier'], TierTokens> = {
  executive: {
    highlightBorder: 'rgba(249, 115, 22, 0.55)',
    accent: 'linear-gradient(90deg, #fb923c 0%, #f97316 100%)',
    accentMuted: 'rgba(249, 115, 22, 0.16)',
    avatarTint: 'rgba(249, 115, 22, 0.18)',
    badgeText: '#b4540d',
  },
  lead: {
    highlightBorder: 'rgba(250, 204, 21, 0.4)',
    accent: 'linear-gradient(90deg, #fde047 0%, #facc15 100%)',
    accentMuted: 'rgba(250, 204, 21, 0.18)',
    avatarTint: 'rgba(250, 204, 21, 0.18)',
    badgeText: '#b45309',
  },
  manager: {
    highlightBorder: 'rgba(59, 130, 246, 0.45)',
    accent: 'linear-gradient(90deg, #60a5fa 0%, #0ea5e9 100%)',
    accentMuted: 'rgba(96, 165, 250, 0.18)',
    avatarTint: 'rgba(148, 197, 255, 0.3)',
    badgeText: '#1d4ed8',
  },
  individual: {
    highlightBorder: 'rgba(129, 140, 248, 0.45)',
    accent: 'linear-gradient(90deg, #a855f7 0%, #6366f1 100%)',
    accentMuted: 'rgba(129, 140, 248, 0.16)',
    avatarTint: 'rgba(129, 140, 248, 0.24)',
    badgeText: '#4c1d95',
  },
  intern: {
    highlightBorder: 'rgba(34, 197, 94, 0.45)',
    accent: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
    accentMuted: 'rgba(74, 222, 128, 0.18)',
    avatarTint: 'rgba(74, 222, 128, 0.2)',
    badgeText: '#166534',
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
  accentHeight: number;
  metaGap: number;
}

const SIZE_TOKENS: Record<'small' | 'medium' | 'large', SizeTokens> = {
  small: {
    padding: 8,
    gap: 6,
    avatar: 26,
    heading: '0.78rem',
    subtext: '0.64rem',
    meta: '0.6rem',
    badgePadding: '2px 5px',
    accentHeight: 2,
    metaGap: 4,
  },
  medium: {
    padding: 16,
    gap: 12,
    avatar: 44,
    heading: '1rem',
    subtext: '0.8rem',
    meta: '0.74rem',
    badgePadding: '3px 8px',
    accentHeight: 4,
    metaGap: 6,
  },
  large: {
    padding: 20,
    gap: 14,
    avatar: 56,
    heading: '1.1rem',
    subtext: '0.9rem',
    meta: '0.8rem',
    badgePadding: '4px 10px',
    accentHeight: 5,
    metaGap: 8,
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

  const wrapperStyles = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    padding: sizeTokens.padding,
    gap: sizeTokens.gap,
    borderRadius: 18,
    background: '#ffffff',
    border: `1px solid ${isHighlighted ? tierTokens.highlightBorder : 'rgba(203, 213, 225, 0.75)'}`,
    boxShadow: isHighlighted
      ? '0 18px 34px rgba(249, 115, 22, 0.18)'
      : '0 10px 22px rgba(148, 163, 184, 0.22)',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    cursor: onClick ? 'pointer' : 'default',
    outline: 'none',
  }), [isHighlighted, onClick, sizeTokens.gap, sizeTokens.padding, tierTokens.highlightBorder]);

  const accentBarStyles = useMemo<React.CSSProperties>(() => ({
    height: sizeTokens.accentHeight,
    borderRadius: 999,
    background: tierTokens.accent,
    opacity: 0.9,
  }), [sizeTokens.accentHeight, tierTokens.accent]);

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
    color: '#0f172a',
    overflow: 'hidden',
    flexShrink: 0,
    border: `2px solid ${tierTokens.accentMuted}`,
  }), [sizeTokens.avatar, tierTokens.avatarTint, tierTokens.accentMuted]);

  const badgeStyles = useMemo<React.CSSProperties>(() => ({
    padding: sizeTokens.badgePadding,
    borderRadius: 999,
    background: tierTokens.accentMuted,
    color: tierTokens.badgeText,
    fontSize: sizeTokens.meta,
    fontWeight: 600,
    lineHeight: 1,
  }), [sizeTokens.badgePadding, sizeTokens.meta, tierTokens.badgeText, tierTokens.accentMuted]);

  const identityStyles = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: size === 'small' ? 2 : 4,
  }), [size]);

  const nameStyles = useMemo<React.CSSProperties>(() => ({
    margin: 0,
    fontSize: sizeTokens.heading,
    fontWeight: 600,
    color: '#0f172a',
    lineHeight: 1.2,
  }), [sizeTokens.heading]);

  const roleStyles = useMemo<React.CSSProperties>(() => ({
    margin: 0,
    fontSize: sizeTokens.subtext,
    color: '#475569',
    lineHeight: 1.2,
  }), [sizeTokens.subtext]);

  const metaStyles = useMemo<React.CSSProperties>(() => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: sizeTokens.metaGap,
    fontSize: sizeTokens.meta,
    color: '#64748b',
  }), [sizeTokens.meta, sizeTokens.metaGap]);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: sizeTokens.metaGap, flex: 1 }}>
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