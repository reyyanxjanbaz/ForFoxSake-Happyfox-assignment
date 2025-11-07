import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactFlowProvider } from 'reactflow';
import OrgChartProvider, { useOrgChart } from '../features/org-chart/context/OrgChartProvider';
import Sidebar from '../components/sidebar/Sidebar';
import { SidebarSlim } from '../components/sidebar/SidebarSlim';
import FilterPanel, { type FilterCriteria } from '../components/sidebar/FilterPanel';
import OrgChartCanvas from '../features/org-chart/components/OrgChartCanvas';
import AddNodeModal from '../features/org-chart/components/AddNodeModal';
import { HelpModal } from '../components/modals/HelpModal';
import { SettingsModal } from '../components/modals/SettingsModal';
import type { Employee } from '../features/org-chart/state/employee';
import '../styles/globals.css';

type OverlayType = 'filters' | 'tree' | 'settings' | 'help';

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
        color: 'var(--color-white)',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: 'var(--shadow-lg)',
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
  const { state, highlightedEmployeeIds, selectEmployee, removeEmployeeBranch, restoreFromUndo, dragAndDrop } = useOrgChart();
  
  // Get theme from document
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
    setTheme(currentTheme);
    
    // Watch for theme changes
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
      setTheme(newTheme);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    return () => observer.disconnect();
  }, []);

  const handleSelectEmployee = useCallback((employeeId: string) => {
    // Toggle selection: if the same employee is already selected, deselect them
    if (state.selectedEmployeeId === employeeId) {
      selectEmployee(null);
    } else {
      selectEmployee(employeeId);
    }
  }, [selectEmployee, state.selectedEmployeeId]);

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
      onSelectEmployee={handleSelectEmployee}
      onClearSelection={() => selectEmployee(null)}
      onDeleteBranch={handleDeleteBranch}
      onRestoreFromUndo={restoreFromUndo}
      dragAndDrop={dragAndDrop}
      showMiniMap={true}
      showControls={true}
      showBackground={true}
      allowInteraction={true}
      theme={theme}
    />
  );
}

// Wrapper component to provide sidebar data from context
function SidebarWrapper({ onAddEmployee }: { onAddEmployee: () => void }) {
  const { state, selectEmployee, highlightedEmployeeIds } = useOrgChart();

  const handleEmployeeClick = (employee: Employee) => {
    // Toggle selection: if the same employee is already selected, deselect them
    if (state.selectedEmployeeId === employee.id) {
      selectEmployee(null);
    } else {
      selectEmployee(employee.id);
    }
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
function FilterPanelWrapper({ isCollapsed = false }: { isCollapsed?: boolean } = {}) {
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
      isCollapsed={isCollapsed}
    />
  );
}

// Wrapper for SidebarSlim that provides data from context
function SidebarSlimWrapper({
  showLabels,
  onToggleLabels,
  onOpenFilter,
  onOpenTree,
  onOpenSettings,
  onOpenHelp,
  onHighlightInterns,
  onHighlightExecutives,
  onHighlightLeads,
}: {
  showLabels: boolean;
  onToggleLabels: () => void;
  onOpenFilter: () => void;
  onOpenTree: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onHighlightInterns: () => void;
  onHighlightExecutives: () => void;
  onHighlightLeads: () => void;
}) {
  const { state, highlightedEmployeeIds } = useOrgChart();

  return (
    <SidebarSlim
      showLabels={showLabels}
      onToggleLabels={onToggleLabels}
      filterState={state.filterState}
      highlightCount={highlightedEmployeeIds.length}
      onOpenFilter={onOpenFilter}
      onOpenTree={onOpenTree}
      onOpenSettings={onOpenSettings}
      onOpenHelp={onOpenHelp}
      onHighlightInterns={onHighlightInterns}
      onHighlightExecutives={onHighlightExecutives}
      onHighlightLeads={onHighlightLeads}
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

  const teams = useMemo(() => {
    const uniqueTeams = new Set<string>();
    state.employees.forEach((employee) => {
      const teamName = employee.team?.trim();
      if (teamName) {
        uniqueTeams.add(teamName);
      }
    });

    if (uniqueTeams.size === 0) {
      return ['Unassigned'];
    }

    return Array.from(uniqueTeams).sort((a, b) => a.localeCompare(b));
  }, [state.employees]);

  return (
    <AddNodeModal
      isOpen={isOpen}
      onClose={onClose}
      managers={managers}
      teams={teams}
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
  const [activeOverlay, setActiveOverlay] = useState<OverlayType | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const stored = window.localStorage.getItem('ffs-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

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

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ffs-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    if (!activeOverlay) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveOverlay(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeOverlay]);

  const overlayTitles: Record<OverlayType, string> = useMemo(() => ({
    filters: 'Filters',
    tree: 'Organization Tree',
    settings: 'Quick Settings',
    help: 'Help & Guidance',
  }), []);

  const helpTopics = useMemo(
    () => [
      {
        title: 'Expand navigation',
        details: 'Use the top arrow to toggle labels for every sidebar tool without opening the full-width panel.',
      },
      {
        title: 'Filter employees',
        details: 'Tap the funnel icon to open the floating filter window. Apply name, role, or ID filters and watch the badge count update instantly.',
      },
      {
        title: 'Explore the org tree',
        details: 'Select the grid icon to open the hierarchy window. You can expand nodes, highlight branches, and add people from there.',
      },
      {
        title: 'Track highlights',
        details: 'The star badge shows how many employees are highlighted. Hover to review counts, or open the tree to inspect them.',
      },
      {
        title: 'Adjust quick settings',
        details: 'Open the gear icon to switch themes. We will keep adding controls here, and this guide will grow alongside them.',
      },
    ],
    []
  );

  const renderOverlayBody = (): ReactNode => {
    if (!activeOverlay) {
      return null;
    }

    switch (activeOverlay) {
      case 'filters':
        return (
          <div className="floating-window__scroll">
            <FilterPanelWrapper isCollapsed={false} />
          </div>
        );
      case 'tree':
        return (
          <div className="floating-window__scroll">
            <SidebarWrapper onAddEmployee={handleAddEmployee} />
          </div>
        );
      case 'settings':
        return (
          <div className="floating-window__settings">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                    {theme === 'dark' ? 'Dark theme' : 'Light theme'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {theme === 'dark' ? 'Dark mode is active' : 'Light mode is active'}
                  </div>
                </div>
                <button
                  onClick={handleToggleTheme}
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
                  aria-label={`Switch to ${theme === 'light' ? 'Dark theme' : 'Light theme'}`}
                  title={`Switch to ${theme === 'light' ? 'Dark theme' : 'Light theme'}`}
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
                      backgroundColor: 'var(--color-surface)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                    }}
                  />
                </button>
              </div>
            <p className="floating-window__note">More settings will appear here as features are added.</p>
          </div>
        );
      case 'help':
        return (
          <div className="floating-window__scroll">
            <ul className="floating-window__list">
              {helpTopics.map((topic) => (
                <li key={topic.title}>
                  <strong>{topic.title}:</strong> {topic.details}
                </li>
              ))}
            </ul>
            <p className="floating-window__note">
              We refresh these notes whenever the navigation changes, so you always have the latest guidance.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const toggleOverlay = useCallback((type: OverlayType) => {
    setActiveOverlay(prev => (prev === type ? null : type));
  }, []);

  const closeOverlay = useCallback(() => {
    setActiveOverlay(null);
  }, []);

  const handleAddEmployee = useCallback(() => {
    closeOverlay();
    setShowAddModal(true);
  }, [closeOverlay]);

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  const handleOpenFilterOverlay = useCallback(() => {
    toggleOverlay('filters');
  }, [toggleOverlay]);

  const handleOpenTreeOverlay = useCallback(() => {
    toggleOverlay('tree');
  }, [toggleOverlay]);

  const handleOpenSettingsOverlay = useCallback(() => {
    toggleOverlay('settings');
  }, [toggleOverlay]);

  const handleOpenHelpOverlay = useCallback(() => {
    toggleOverlay('help');
  }, [toggleOverlay]);

  const handleToggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <OrgChartProvider>
      <InnerApp
        sidebarCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        isTablet={isTablet}
        showAddModal={showAddModal}
        activeOverlay={activeOverlay}
        theme={theme}
        toggleSidebar={toggleSidebar}
        closeOverlay={closeOverlay}
        handleAddEmployee={handleAddEmployee}
        handleCloseModal={handleCloseModal}
        handleOpenFilterOverlay={handleOpenFilterOverlay}
        handleOpenTreeOverlay={handleOpenTreeOverlay}
        handleOpenSettingsOverlay={handleOpenSettingsOverlay}
        handleOpenHelpOverlay={handleOpenHelpOverlay}
        handleToggleTheme={handleToggleTheme}
        overlayTitles={overlayTitles}
        renderOverlayBody={renderOverlayBody}
      />
    </OrgChartProvider>
  );
}

// Inner component with access to context
function InnerApp({
  sidebarCollapsed,
  isMobile,
  isTablet,
  showAddModal,
  activeOverlay,
  theme,
  toggleSidebar,
  closeOverlay,
  handleAddEmployee,
  handleCloseModal,
  handleOpenFilterOverlay,
  handleOpenTreeOverlay,
  handleOpenSettingsOverlay,
  handleOpenHelpOverlay,
  handleToggleTheme,
  overlayTitles,
  renderOverlayBody,
}: any) {
  const { state, highlightEmployees, clearAllHighlights, highlightedEmployeeIds } = useOrgChart();
  
  // Track which tier is currently highlighted for toggle functionality
  const [activeTier, setActiveTier] = useState<'intern' | 'executive' | 'lead' | null>(null);

  const toggleTierHighlights = useCallback((tier: 'intern' | 'executive' | 'lead') => {
    if (activeTier === tier) {
      clearAllHighlights();
      setActiveTier(null);
      return;
    }

    const tierEmployeeIds = state.employees
      .filter(emp => emp.tier === tier)
      .map(emp => emp.id);

    if (tierEmployeeIds.length === 0) {
      clearAllHighlights();
      setActiveTier(null);
      return;
    }

    highlightEmployees(tierEmployeeIds, 'filter');
    setActiveTier(tier);
  }, [activeTier, state.employees, highlightEmployees, clearAllHighlights]);

  const handleHighlightInterns = useCallback(() => {
    toggleTierHighlights('intern');
  }, [toggleTierHighlights]);

  const handleHighlightExecutives = useCallback(() => {
    toggleTierHighlights('executive');
  }, [toggleTierHighlights]);

  const handleHighlightLeads = useCallback(() => {
    toggleTierHighlights('lead');
  }, [toggleTierHighlights]);

  return (
    <ReactFlowProvider>
  <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
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
              background: 'var(--color-surface)',
              boxShadow: 'var(--shadow-md)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--color-border)',
              pointerEvents: 'none',
            }}
          >
            <span
              aria-hidden
              style={{
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                boxShadow: '0 0 12px rgba(249, 115, 22, 0.35)',
              }}
            />
            <span
              style={{
                fontSize: '1.25rem',
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
                width: '56px',
                height: '56px',
                borderRadius: '10%',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                border: 'none',
                fontSize: '28px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
              title="Add Employee"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </motion.button>

            {/* GitHub Button */}
            <motion.button
              onClick={() => window.open('https://github.com/reyyanxjanbaz/ForFoxSake-Happyfox-assignment', '_blank')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '56px',
                height: '56px',
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
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </motion.button>

            {/* Help Button */}
            <motion.button
              onClick={() => window.open('https://youtu.be/xSqxG6dsBJE', '_blank')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                overflow: 'hidden',
              }}
              title="Help & Documentation"
            >
              <img
                src="/ummm-actually.png"
                alt="Help"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block',
                }}
              />
            </motion.button>
          </div>

          {/* Sidebar Panel - Slim Icon-based Navigation */}
          <motion.div 
            className={`sidebar-panel ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
            style={{
              width: sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-slim-expanded)',
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--space-3)',
              gap: 'var(--space-2)',
            }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1],
              type: 'tween'
            }}
          >
            <SidebarSlimWrapper
              showLabels={!sidebarCollapsed}
              onToggleLabels={toggleSidebar}
              onOpenFilter={handleOpenFilterOverlay}
              onOpenTree={handleOpenTreeOverlay}
              onOpenSettings={handleOpenSettingsOverlay}
              onOpenHelp={handleOpenHelpOverlay}
              onHighlightInterns={handleHighlightInterns}
              onHighlightExecutives={handleHighlightExecutives}
              onHighlightLeads={handleHighlightLeads}
            />
          </motion.div>

          <AnimatePresence>
            {activeOverlay && (
              <>
                <motion.div
                  key="floating-overlay-backdrop"
                  className="floating-overlay-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  role="presentation"
                  onClick={closeOverlay}
                />

                <motion.div
                  key={`floating-window-${activeOverlay}`}
                  className="floating-window"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    left: `calc(${sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-slim-expanded)'} + 24px)`,
                  }}
                >
                  <div className="floating-window__header">
                    <h2>{overlayTitles[activeOverlay]}</h2>
                    <button
                      type="button"
                      onClick={closeOverlay}
                      aria-label="Close floating panel"
                    >
                      X
                    </button>
                  </div>
                  <div className="floating-window__body">
                    {renderOverlayBody()}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

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
  );
}

export default App;