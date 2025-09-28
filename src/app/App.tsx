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

          {/* Add Employee Button - Top Right */}
          <motion.button
            className="add-employee-btn"
            onClick={handleAddEmployee}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: 'fixed',
              top: 'var(--space-4)',
              right: 'var(--space-4)',
              zIndex: 1000,
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