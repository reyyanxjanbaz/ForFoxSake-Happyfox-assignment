// ProfileCard component for displaying employee information in sidebar and chart nodes

import React, { useState } from 'react';
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

const ProfileCard: React.FC<ProfileCardProps> = ({
  employee,
  isHighlighted = false,
  size = 'medium',
  showRole = true,
  showTeam = true,
  onClick,
  className = '',
}) => {
  // Lazy loading for profile photo
  const lazyImage = useLazyImage({
    src: `/assets/photos/${employee.photoAssetKey}.jpg`,
    alt: `${employee.name} profile photo`,
    rootMargin: '100px', // Start loading when 100px away from viewport
    threshold: 0.1,
  });

  const handleClick = () => {
    if (onClick) {
      onClick(employee);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && onClick) {
      event.preventDefault();
      onClick(employee);
    }
  };

  // Size-based styling
  const sizeStyles = {
    small: {
      padding: 'var(--space-2)',
      avatarSize: '32px',
      nameSize: '0.75rem',
      roleSize: '0.625rem',
      gap: 'var(--space-1)',
    },
    medium: {
      padding: 'var(--space-3)',
      avatarSize: '48px',
      nameSize: '0.875rem',
      roleSize: '0.75rem',
      gap: 'var(--space-2)',
    },
    large: {
      padding: 'var(--space-4)',
      avatarSize: '64px',
      nameSize: '1rem',
      roleSize: '0.875rem',
      gap: 'var(--space-3)',
    },
  };

  const styles = sizeStyles[size];

  // Tier-based styling
  const tierStyles = {
    executive: {
      backgroundColor: 'var(--color-orange-50)',
      borderColor: 'var(--color-orange-400)',
      textColor: 'var(--color-orange-900)',
    },
    lead: {
      backgroundColor: 'var(--color-orange-50)',
      borderColor: 'var(--color-orange-300)',
      textColor: 'var(--color-orange-800)',
    },
    manager: {
      backgroundColor: 'var(--color-white)',
      borderColor: 'var(--color-gray-300)',
      textColor: 'var(--color-gray-900)',
    },
    individual: {
      backgroundColor: 'var(--color-white)',
      borderColor: 'var(--color-gray-200)',
      textColor: 'var(--color-gray-800)',
    },
    intern: {
      backgroundColor: 'var(--color-gray-50)',
      borderColor: 'var(--color-gray-200)',
      textColor: 'var(--color-gray-700)',
    },
  };

  const tierStyle = tierStyles[employee.tier];

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: styles.gap,
    padding: styles.padding,
    backgroundColor: tierStyle.backgroundColor,
    border: `2px solid ${tierStyle.borderColor}`,
    borderRadius: 'var(--border-radius)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all var(--duration-fast) ease',
    position: 'relative',
    width: '100%',
    boxShadow: isHighlighted 
      ? '0 0 20px var(--color-highlight-glow)' 
      : 'var(--shadow-sm)',
    transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
  };

  const avatarStyle: React.CSSProperties = {
    width: styles.avatarSize,
    height: styles.avatarSize,
    borderRadius: '50%',
    backgroundColor: 'var(--color-gray-200)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
  };

  const textContainerStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0, // Allow text to truncate
    color: tierStyle.textColor,
  };

  const nameStyle: React.CSSProperties = {
    fontSize: styles.nameSize,
    fontWeight: '600',
    margin: 0,
    lineHeight: 1.2,
  };

  const roleStyle: React.CSSProperties = {
    fontSize: styles.roleSize,
    color: 'var(--color-text-secondary)',
    margin: 0,
    marginTop: 'var(--space-1)',
    lineHeight: 1.2,
  };

  const teamStyle: React.CSSProperties = {
    fontSize: styles.roleSize,
    color: 'var(--color-text-muted)',
    margin: 0,
    marginTop: 'var(--space-1)',
    lineHeight: 1.2,
  };

  // Generate initials fallback
  const initials = employee.name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`profile-card ${className} ${isHighlighted ? 'highlight-pulse' : ''}`}
      style={cardStyle}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `View details for ${employee.name}` : undefined}
    >
      {/* Avatar */}
      <div style={avatarStyle}>
        {!lazyImage.isError ? (
          <>
            <img
              ref={lazyImage.imgRef}
              src={lazyImage.src}
              alt={`${employee.name} profile photo`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: lazyImage.isLoaded ? 1 : 0,
                transition: 'opacity var(--duration-normal) ease',
              }}
            />
            {/* Loading placeholder */}
            {!lazyImage.isLoaded && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'var(--color-gray-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '0.75rem',
                fontWeight: '500',
              }}>
                {lazyImage.isInView ? (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid var(--color-gray-300)',
                      borderTop: '2px solid var(--color-primary)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                    aria-label="Loading photo"
                  />
                ) : (
                  initials
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--color-gray-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.75rem',
            fontWeight: '500',
          }}>
            {initials}
          </div>
        )}
      </div>

      {/* Text Content */}
      <div style={textContainerStyle}>
        <h4 className="text-truncate" style={nameStyle}>
          {employee.name}
        </h4>
        
        {showRole && (
          <p className="text-truncate" style={roleStyle}>
            {employee.designation}
          </p>
        )}
        
        {showTeam && size !== 'small' && (
          <p className="text-truncate" style={teamStyle}>
            {employee.team}
          </p>
        )}
      </div>

      {/* Highlight indicator */}
      {isHighlighted && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-highlight)',
          animation: 'highlight-pulse 2s ease-in-out infinite',
        }} />
      )}
    </div>
  );
};

export default ProfileCard;