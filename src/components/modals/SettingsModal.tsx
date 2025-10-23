// Settings modal with theme toggle and other preferences

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              zIndex: 10000,
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)',
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>
                ⚙️ Settings
              </h2>
              <button
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: 'var(--color-text-secondary)',
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text-primary)' }}>
              {/* Theme Setting */}
              <section style={{ marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                    Theme
                  </div>
                  <button
                    onClick={toggleTheme}
                    style={{
                      position: 'relative',
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-gray-300)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      flexShrink: 0,
                    }}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        x: theme === 'dark' ? 22 : 2,
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        left: '0px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--color-background)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                      }}
                    />
                  </button>
                </div>
              </section>

              {/* Info Section */}
              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
                  About
                </h3>
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                    <strong>Version:</strong> 1.0.0
                  </div>
                  <div style={{ marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                    <strong>Built with:</strong> React + TypeScript
                  </div>
                  <div style={{ color: 'var(--color-text-primary)' }}>
                    <strong>Created:</strong> October 2025
                  </div>
                </div>
              </section>

              {/* Placeholder for future settings */}
              <section>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
                  More Settings Coming Soon
                </h3>
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Additional customization options will be added in future updates
                </div>
              </section>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
