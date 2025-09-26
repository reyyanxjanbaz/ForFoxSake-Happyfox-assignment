import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/globals.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Panel */}
      <motion.div 
        className="sidebar-panel"
        animate={{ 
          width: sidebarCollapsed ? '60px' : '320px',
        }}
        transition={{ 
          duration: 0.3, 
          ease: 'easeInOut',
          type: 'tween'
        }}
      >
        <div style={{ padding: 'var(--space-4)' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            marginBottom: 'var(--space-6)'
          }}>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.h1 
                  key="title"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600',
                    color: 'var(--color-text-primary)',
                    margin: 0
                  }}
                >
                  Org Chart
                </motion.h1>
              )}
            </AnimatePresence>
            <motion.button
              onClick={toggleSidebar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                rotate: sidebarCollapsed ? 180 : 0 
              }}
              transition={{ duration: 0.2 }}
              style={{
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                transition: 'all var(--duration-fast) ease',
              }}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              →
            </motion.button>
          </div>
          
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {/* Filter Panel Placeholder */}
                <motion.div 
                  style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--color-border)',
                    marginBottom: 'var(--space-4)'
                  }}
                  whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    Filters
                  </h3>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--color-text-muted)',
                    margin: 0
                  }}>
                    Filter panel coming soon...
                  </p>
                </motion.div>

                {/* Sidebar Tree Placeholder */}
                <motion.div 
                  style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--color-border)',
                    flex: 1
                  }}
                  whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    Organization
                  </h3>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--color-text-muted)',
                    margin: 0
                  }}>
                    Employee tree coming soon...
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="chart-container">
          {/* Chart Canvas Placeholder */}
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-background)',
            position: 'relative'
          }}>
            {/* Squares Background Placeholder */}
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.1,
              background: `
                repeating-linear-gradient(
                  45deg,
                  var(--color-orange-200),
                  var(--color-orange-200) 2px,
                  transparent 2px,
                  transparent 20px
                )
              `
            }} />
            
            <div style={{
              textAlign: 'center',
              zIndex: 1
            }}>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                For Fox Sake Org Chart
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ 
                  color: 'var(--color-text-secondary)',
                  margin: 0
                }}
              >
                React Flow chart canvas coming soon...
              </motion.p>
              
              {/* Add Employee Button with Glow Effect */}
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 20px rgba(234, 88, 12, 0.3)',
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  marginTop: 'var(--space-6)',
                  padding: 'var(--space-3) var(--space-6)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-white)',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) ease',
                }}
              >
                + Add Employee
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;