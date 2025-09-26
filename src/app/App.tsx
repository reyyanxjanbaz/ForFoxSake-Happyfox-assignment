import { useState } from 'react';
import '../styles/globals.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Panel */}
      <div className="sidebar-panel">
        <div style={{ padding: 'var(--space-4)' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 'var(--space-6)'
          }}>
            <h1 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              margin: 0
            }}>
              {!sidebarCollapsed && 'Org Chart'}
            </h1>
            <button
              onClick={toggleSidebar}
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
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
          
          {!sidebarCollapsed && (
            <>
              {/* Filter Panel Placeholder */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--color-border)',
                marginBottom: 'var(--space-4)'
              }}>
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
              </div>

              {/* Sidebar Tree Placeholder */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--color-border)',
                flex: 1
              }}>
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
              </div>
            </>
          )}
        </div>
      </div>

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
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                For Fox Sake Org Chart
              </h2>
              <p style={{ 
                color: 'var(--color-text-secondary)',
                margin: 0
              }}>
                React Flow chart canvas coming soon...
              </p>
              
              {/* Add Node Button Placeholder */}
              <button style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-3) var(--space-6)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                borderRadius: 'var(--border-radius)',
                fontWeight: '500',
                transition: 'background-color var(--duration-fast) ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }}>
                + Add Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
