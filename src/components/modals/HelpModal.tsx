// Help modal with navigation instructions

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
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
              maxWidth: '600px',
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
                📖 Help & Navigation Guide
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
                  backgroundColor: 'var(--color-gray-100)',
                  border: 'none',
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
              {/* Sidebar Navigation */}
              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-primary)' }}>
                  🎯 Sidebar Navigation
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Expand Button (←):</strong> Click to expand the sidebar and view button labels
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Filter Button (🔍):</strong> Opens filter panel to search employees by name, designation, or ID
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Highlight Button (⭐):</strong> Shows count of currently highlighted employees
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Organization Tree (📊):</strong> Opens hierarchical tree view of the organization
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Settings Button (⚙️):</strong> Access theme and app settings
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Help Button (?):</strong> Opens this help guide
                  </li>
                </ul>
              </section>

              {/* Chart Interactions */}
              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-primary)' }}>
                  🗺️ Chart Interactions
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Pan:</strong> Click and drag on empty space to move around the chart
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Zoom:</strong> Use mouse wheel or pinch gesture to zoom in/out
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Select Employee:</strong> Click on an employee card to select and highlight them
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Drag & Drop:</strong> Drag employee cards to reassign them to different managers
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Delete Branch:</strong> Select an employee and use delete button to remove their entire branch
                  </li>
                </ul>
              </section>

              {/* Filtering */}
              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-primary)' }}>
                  🔍 Search & Filter
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Name Search:</strong> Type employee name to filter results (partial matches work)
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Designation Filter:</strong> Select from dropdown to filter by job title
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Employee ID:</strong> Search by specific employee ID number
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Highlights:</strong> Filtered employees are automatically highlighted on the chart
                  </li>
                </ul>
              </section>

              {/* Keyboard Shortcuts */}
              <section style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-primary)' }}>
                  ⌨️ Keyboard Shortcuts
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Escape:</strong> Clear selection or close modals
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Arrow Keys:</strong> Navigate through tree view in sidebar
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Enter/Space:</strong> Expand/collapse nodes in tree view
                  </li>
                </ul>
              </section>

              {/* Tips */}
              <section>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-primary)' }}>
                  💡 Tips & Tricks
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '8px' }}>
                    Use the minimap (bottom-right) for quick navigation across large organizations
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Filter results are highlighted in orange on the chart for easy identification
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    The tree view automatically expands to show highlighted employees
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Drag & drop supports undo - check the undo alert after making changes
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    Different employee tiers are color-coded: Executive (Orange), Lead (Yellow), Manager (Blue), Individual (Purple), Intern (Green)
                  </li>
                </ul>
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
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
