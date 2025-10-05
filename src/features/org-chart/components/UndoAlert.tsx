import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUndoStore } from '../state/undoState';

// Add CSS animation styles
const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}

interface UndoAlertProps {
  onUndo: () => void;
}

export const UndoAlert: React.FC<UndoAlertProps> = ({ onUndo }) => {
  const { lastOperation, isUndoAlertVisible, dismissUndo } = useUndoStore();
  const [countdown, setCountdown] = useState(8);
  


  useEffect(() => {
    if (!isUndoAlertVisible) {
      setCountdown(8);
      return;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isUndoAlertVisible]);
  


  const handleUndo = () => {
    onUndo();
    dismissUndo();
  };

  const getActionText = () => {
    if (!lastOperation) return 'Node deleted';
    
    switch (lastOperation.type) {
      case 'DELETE_NODE':
        return `Deleted ${lastOperation.employee.name}`;
      case 'DELETE_BRANCH':
        return `Deleted ${lastOperation.employee.name} and their team`;
      default:
        return 'Node deleted';
    }
  };

  return (
    <AnimatePresence>
      {isUndoAlertVisible && lastOperation && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
        >
          <div style={{
            backgroundColor: '#1f2937',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #4b5563',
            padding: '16px 24px',
            minWidth: '320px',
            maxWidth: '500px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#f97316',
                  borderRadius: '50%',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}></div>
                <div>
                  <p style={{ fontWeight: '500', fontSize: '14px', margin: 0 }}>{getActionText()}</p>
                  <p style={{ color: '#d1d5db', fontSize: '12px', margin: 0 }}>
                    Did you delete this by mistake?
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUndo}
                  style={{
                    backgroundColor: '#f97316',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  Undo
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={dismissUndo}
                  style={{
                    color: '#9ca3af',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                >
                  ×
                </motion.button>
              </div>
            </div>
            
            {/* Countdown progress bar */}
            <div style={{ marginTop: '12px' }}>
              <div style={{
                width: '100%',
                backgroundColor: '#374151',
                borderRadius: '9999px',
                height: '4px',
              }}>
                <motion.div
                  style={{
                    backgroundColor: '#f97316',
                    height: '4px',
                    borderRadius: '9999px',
                  }}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(countdown / 8) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
              <p style={{
                color: '#9ca3af',
                fontSize: '12px',
                marginTop: '4px',
                textAlign: 'center',
                margin: '4px 0 0 0',
              }}>
                Auto-dismiss in {countdown}s
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};