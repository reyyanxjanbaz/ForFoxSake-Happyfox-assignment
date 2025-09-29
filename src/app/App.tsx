import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ReactFlowProvider } from 'reactflow';
import OrgChartProvider, { useOrgChart } from '../features/org-chart/context/OrgChartProvider';
import Sidebar from '../components/sidebar/Sidebar';
import FilterPanel, { type FilterCriteria } from '../components/sidebar/FilterPanel';
import OrgChartCanvas from '../features/org-chart/components/OrgChartCanvas';
import AddNodeModal from '../features/org-chart/components/AddNodeModal';
import type { Employee } from '../features/org-chart/state/employee';
import '../styles/globals.css';

// Notification component for showing drag and drop feedback
function NotificationArea() {
  const { state } = useOrgChart();
  
  if (!state.error) return null;
  
  const isSuccess = state.error.startsWith('✅');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1001,
        padding: '12px 20px',
        borderRadius: '8px',
        background: isSuccess 
          ? 'linear-gradient(135deg, #10b981, #34d399)' 
          : 'linear-gradient(135deg, #ef4444, #f87171)',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        maxWidth: '400px',
        textAlign: 'center',
      }}
    >
      {state.error}
    </motion.div>
  );
}

// Wrapper component that connects to context
function OrgChartCanvasWrapper() {
  const { state, highlightedEmployeeIds, selectEmployee, removeEmployeeBranch, dragAndDrop } = useOrgChart();

  const handleDeleteBranch = useCallback((employeeId: string) => {
    const targetEmployee = state.employees.find(emp => emp.id === employeeId);
    const displayName = targetEmployee?.name ?? 'this employee';
    const confirmed = typeof window === 'undefined'
      ? true
      : window.confirm(`Delete ${displayName}'s branch? This will remove all direct and indirect reports.`);

    if (!confirmed) {
      return;
    }

    void removeEmployeeBranch(employeeId).catch(error => {
      console.error('Failed to delete branch', error);
      if (typeof window !== 'undefined') {
        window.alert('Failed to delete branch. Please try again.');
      }
    });
  }, [removeEmployeeBranch, state.employees]);

  return (
    <OrgChartCanvas
      employees={state.employees}
      hierarchy={state.hierarchy}
      highlightedEmployeeIds={highlightedEmployeeIds}
      selectedEmployeeId={state.selectedEmployeeId}
      onSelectEmployee={selectEmployee}
      onDeleteBranch={handleDeleteBranch}
  dragAndDrop={dragAndDrop}
      showMiniMap={true}
      showControls={true}
      showBackground={true}
      allowInteraction={true}
    />
  );
}

// Wrapper component to provide sidebar data from context
function SidebarWrapper({ onAddEmployee }: { onAddEmployee: () => void }) {
  const { state, selectEmployee, highlightedEmployeeIds } = useOrgChart();

  const handleEmployeeClick = (employee: Employee) => {
    selectEmployee(employee.id);
  };

  return (
    <Sidebar
      employees={state.employees}
      hierarchy={state.hierarchy || undefined}
      highlightedEmployees={highlightedEmployeeIds}
      onEmployeeClick={handleEmployeeClick}
      onAddEmployee={onAddEmployee}
      selectedEmployeeId={state.selectedEmployeeId}
    />
  );
}

// Wrapper component to connect filter panel to context state
function FilterPanelWrapper() {
  const { state, updateFilter, clearFilters } = useOrgChart();

  const handleFilterChange = (criteria: FilterCriteria, changedField: keyof FilterCriteria) => {
    if (changedField === 'name') {
      updateFilter('name', criteria.name);
    } else if (changedField === 'designation') {
      updateFilter('designation', criteria.designation);
    } else if (changedField === 'employeeId') {
      updateFilter('employeeId', criteria.employeeId);
    }
  };

  return (
    <FilterPanel
      employees={state.employees}
      filterState={state.filterState}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
      isCollapsed
    />
  );
}

// Wrapper for AddNodeModal that provides managers from context
function AddNodeModalWrapper({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, addEmployee, selectEmployee } = useOrgChart();
  
  // Filter employees who can be managers (executives, leads, managers)
  const managers = state.employees.filter(emp => 
    emp.tier === 'executive' || emp.tier === 'lead' || emp.tier === 'manager'
  );

  return (
    <AddNodeModal
      isOpen={isOpen}
      onClose={onClose}
      managers={managers}
      onEmployeeAdded={(employee) => {
        addEmployee(employee);
        selectEmployee(employee.id);
      }}
    />
  );
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Responsive breakpoint detection
  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 640);
      setIsTablet(width <= 768 && width > 640);
      
      // Auto-collapse sidebar on mobile
      if (width <= 768) {
        setSidebarCollapsed(true);
      }
    };

    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleAddEmployee = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  return (
    <OrgChartProvider>
      <ReactFlowProvider>
        <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Notification Area */}
          <NotificationArea />
          
          <div
            style={{
              position: 'fixed',
              top: 'var(--space-4)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              pointerEvents: 'none',
            }}
          >
            <span
              aria-hidden
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                boxShadow: '0 0 12px rgba(249, 115, 22, 0.35)',
              }}
            />
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
              }}
            >
              ForFoxSake
            </span>
          </div>

          {/* Action Buttons - Top Right */}
          <div style={{
            position: 'fixed',
            top: 'var(--space-4)',
            right: 'var(--space-4)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {/* Add Employee Button */}
            <motion.button
              className="add-employee-btn"
              onClick={handleAddEmployee}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                border: 'none',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Add Employee"
            >
              +
            </motion.button>

            {/* GitHub Button */}
            <motion.button
              onClick={() => window.open('https://github.com/reyyanxjanbaz/ForFoxSake-Happyfox-assignment', '_blank')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#24292e',
                color: 'var(--color-white)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(36, 41, 46, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="View on GitHub"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </motion.button>

            {/* Help Button */}
            <motion.button
              onClick={() => {
                // TODO: Add help link here
                console.log('Help button clicked - link to be added');
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#6b7280',
                color: 'var(--color-white)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
              }}
              title="Help & Documentation"
            >
              ?
            </motion.button>
          </div>

          {/* Sidebar Panel */}
          <motion.div 
            className={`sidebar-panel ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
            animate={{ 
              width: (isMobile || isTablet) ? '100%' : sidebarCollapsed ? '60px' : '320px',
              height: (isMobile || isTablet) && sidebarCollapsed ? '60px' : 'auto'
            }}
            transition={{ 
              duration: isMobile ? 0.2 : 0.3, 
              ease: 'easeInOut',
              type: 'tween'
            }}
          >
            {!sidebarCollapsed && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ 
                  padding: 'var(--space-4)',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <h1 style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600',
                    color: 'var(--color-text-primary)',
                    margin: 0
                  }}>
                    ForFoxSake
                  </h1>
                  <motion.button
                    onClick={toggleSidebar}
                    whileHover={!isMobile ? { scale: 1.05 } : {}}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                    }}
                    aria-label="Collapse sidebar"
                  >
                    ←
                  </motion.button>
                </div>

                {/* Filter Panel */}
                <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                  <FilterPanelWrapper />
                </div>

                {/* Sidebar Tree */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <SidebarWrapper onAddEmployee={handleAddEmployee} />
                </div>
              </div>
            )}

            {sidebarCollapsed && (
              <div style={{ 
                padding: 'var(--space-2)',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <motion.button
                  onClick={toggleSidebar}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                  }}
                  aria-label="Expand sidebar"
                >
                  →
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Main Content Area */}
          <div className="main-content">
            <div className="chart-container">
              <OrgChartCanvasWrapper />
            </div>
          </div>

          {/* Add Node Modal */}
          <AddNodeModalWrapper 
            isOpen={showAddModal}
            onClose={handleCloseModal}
          />
        </div>
      </ReactFlowProvider>
    </OrgChartProvider>
  );
}

export default App;