// Interaction logging for session-level actions and testing validation

export interface InteractionLog {
  id: string;
  timestamp: string;
  type: 'filter' | 'reassignment' | 'add-node';
  payload: Record<string, unknown>;
}

export interface InteractionState {
  logs: InteractionLog[];
  sessionStarted: string;
}

// Initialize interaction logging
export const initializeInteractionLog = (): InteractionState => {
  return {
    logs: [],
    sessionStarted: new Date().toISOString(),
  };
};

// Generate unique log entry ID
const generateLogId = (): string => {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Log filter interaction
export const logFilterInteraction = (
  state: InteractionState,
  filterType: 'name' | 'designation' | 'employeeId' | 'clear',
  filterValue?: string,
  resultCount?: number
): InteractionState => {
  const newLog: InteractionLog = {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    type: 'filter',
    payload: {
      filterType,
      filterValue: filterValue || null,
      resultCount: resultCount || 0,
    },
  };

  return {
    ...state,
    logs: [...state.logs, newLog],
  };
};

// Log employee reassignment
export const logReassignmentInteraction = (
  state: InteractionState,
  employeeId: string,
  previousManagerId: string | null,
  newManagerId: string | null,
  success: boolean,
  reason?: string
): InteractionState => {
  const newLog: InteractionLog = {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    type: 'reassignment',
    payload: {
      employeeId,
      previousManagerId,
      newManagerId,
      success,
      reason: reason || null,
    },
  };

  return {
    ...state,
    logs: [...state.logs, newLog],
  };
};

// Log add node interaction
export const logAddNodeInteraction = (
  state: InteractionState,
  newEmployeeId: string,
  managerId: string | null,
  tier: string,
  success: boolean,
  generatedData?: Record<string, unknown>
): InteractionState => {
  const newLog: InteractionLog = {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    type: 'add-node',
    payload: {
      newEmployeeId,
      managerId,
      tier,
      success,
      generatedData: generatedData || null,
    },
  };

  return {
    ...state,
    logs: [...state.logs, newLog],
  };
};

// Get logs by type
export const getLogsByType = (
  state: InteractionState, 
  type: InteractionLog['type']
): InteractionLog[] => {
  return state.logs.filter(log => log.type === type);
};

// Get recent logs (last N entries)
export const getRecentLogs = (state: InteractionState, count: number = 10): InteractionLog[] => {
  return state.logs.slice(-count);
};

// Get logs within time range
export const getLogsInTimeRange = (
  state: InteractionState,
  startTime: string,
  endTime: string
): InteractionLog[] => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  return state.logs.filter(log => {
    const logTime = new Date(log.timestamp).getTime();
    return logTime >= start && logTime <= end;
  });
};

// Clear logs (useful for testing or session reset)
export const clearLogs = (state: InteractionState): InteractionState => {
  return {
    ...state,
    logs: [],
  };
};

// Get interaction statistics
export const getInteractionStats = (state: InteractionState) => {
  const totalLogs = state.logs.length;
  const filterLogs = getLogsByType(state, 'filter').length;
  const reassignmentLogs = getLogsByType(state, 'reassignment').length;
  const addNodeLogs = getLogsByType(state, 'add-node').length;

  const successfulReassignments = state.logs
    .filter(log => log.type === 'reassignment')
    .filter(log => log.payload.success === true).length;

  const successfulAddNodes = state.logs
    .filter(log => log.type === 'add-node')
    .filter(log => log.payload.success === true).length;

  return {
    totalInteractions: totalLogs,
    filterInteractions: filterLogs,
    reassignmentInteractions: reassignmentLogs,
    addNodeInteractions: addNodeLogs,
    successfulReassignments,
    successfulAddNodes,
    sessionDuration: Date.now() - new Date(state.sessionStarted).getTime(),
  };
};

// Export logs for testing or debugging
export const exportLogsAsJSON = (state: InteractionState): string => {
  return JSON.stringify({
    sessionStarted: state.sessionStarted,
    logs: state.logs,
    stats: getInteractionStats(state),
  }, null, 2);
};