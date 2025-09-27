// SquaresBackground component for animated square pattern backdrop  

import React, { useEffect, useState } from 'react';

export interface SquaresBackgroundProps {
  /** Number of squares to render */
  count?: number;
  /** Animation speed (1 = normal, 0.5 = slow, 2 = fast) */
  speed?: number;
  /** Base opacity of squares */
  opacity?: number;
  /** Color theme for squares */
  color?: 'orange' | 'gray';
  /** Whether animation is enabled */
  animated?: boolean;
  className?: string;
}

interface Square {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  animationDelay: number;
  animationDuration: number;
}

const SquaresBackground: React.FC<SquaresBackgroundProps> = ({
  count = 50,
  speed = 1,
  opacity = 0.1,
  color = 'orange',
  animated = true,
  className = '',
}) => {
  const [squares, setSquares] = useState<Square[]>([]);
  const [_dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Generate squares on mount and window resize
  useEffect(() => {
    const generateSquares = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });

      const newSquares: Square[] = [];
      
      for (let i = 0; i < count; i++) {
        newSquares.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 40 + 10, // 10-50px
          opacity: Math.random() * opacity + opacity * 0.3, // Vary opacity
          rotation: Math.random() * 360,
          animationDelay: Math.random() * 10, // 0-10s delay
          animationDuration: (Math.random() * 10 + 10) / speed, // 10-20s duration, adjusted by speed
        });
      }
      
      setSquares(newSquares);
    };

    generateSquares();

    const handleResize = () => {
      generateSquares();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [count, speed, opacity]);

  const colorMap = {
    orange: {
      primary: 'var(--color-orange-200)',
      secondary: 'var(--color-orange-300)',
      tertiary: 'var(--color-orange-100)',
    },
    gray: {
      primary: 'var(--color-gray-200)',
      secondary: 'var(--color-gray-300)',
      tertiary: 'var(--color-gray-100)',
    },
  };

  const colors = colorMap[color];

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: -1,
  };

  return (
    <div className={`squares-background ${className}`} style={containerStyle}>
      {squares.map((square) => {
        const squareColor = [colors.primary, colors.secondary, colors.tertiary][
          square.id % 3
        ];

        const baseStyle: React.CSSProperties = {
          position: 'absolute',
          left: square.x - square.size / 2,
          top: square.y - square.size / 2,
          width: square.size,
          height: square.size,
          backgroundColor: squareColor,
          opacity: square.opacity,
          borderRadius: '2px',
          transform: `rotate(${square.rotation}deg)`,
        };

        if (animated) {
          return (
            <div
              key={square.id}
              style={{
                ...baseStyle,
                animation: `
                  squareFloat ${square.animationDuration}s ease-in-out infinite ${square.animationDelay}s,
                  squareRotate ${square.animationDuration * 0.8}s linear infinite ${square.animationDelay}s,
                  squareFade ${square.animationDuration * 1.2}s ease-in-out infinite ${square.animationDelay}s
                `,
              }}
            />
          );
        }

        return <div key={square.id} style={baseStyle} />;
      })}

      {/* Keyframes for animations */}
      {animated && (
        <style>
          {`
            @keyframes squareFloat {
              0%, 100% {
                transform: translateY(0px) rotate(${squares[0]?.rotation || 0}deg);
              }
              50% {
                transform: translateY(-20px) rotate(${squares[0]?.rotation || 0}deg);
              }
            }

            @keyframes squareRotate {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }

            @keyframes squareFade {
              0%, 100% {
                opacity: ${opacity * 0.3};
              }
              50% {
                opacity: ${opacity};
              }
            }
          `}
        </style>
      )}
    </div>
  );
};

export default SquaresBackground;