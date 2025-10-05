import { create } from 'zustand';
import { Employee } from './employee';

export interface UndoOperation {
  type: 'DELETE_NODE' | 'DELETE_BRANCH';
  employee: Employee;
  parentId?: string;
  timestamp: number;
  children?: Employee[];
}

interface UndoState {
  lastOperation: UndoOperation | null;
  isUndoAlertVisible: boolean;
  undoTimeoutId: ReturnType<typeof setTimeout> | null;
  
  // Actions
  recordDelete: (operation: Omit<UndoOperation, 'timestamp'>) => void;
  performUndo: () => UndoOperation | null;
  dismissUndo: () => void;
  clearUndo: () => void;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  lastOperation: null,
  isUndoAlertVisible: false,
  undoTimeoutId: null,

  recordDelete: (operation) => {
    const { undoTimeoutId } = get();
    
    // Clear any existing timeout
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }

    const newOperation: UndoOperation = {
      ...operation,
      timestamp: Date.now(),
    };

    // Auto-dismiss after 8 seconds
    const timeoutId = setTimeout(() => {
      set({ isUndoAlertVisible: false, lastOperation: null, undoTimeoutId: null });
    }, 8000);

    set({
      lastOperation: newOperation,
      isUndoAlertVisible: true,
      undoTimeoutId: timeoutId,
    });
  },

  performUndo: () => {
    const { lastOperation, undoTimeoutId } = get();
    
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }

    set({
      isUndoAlertVisible: false,
      lastOperation: null,
      undoTimeoutId: null,
    });

    return lastOperation;
  },

  dismissUndo: () => {
    const { undoTimeoutId } = get();
    
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }

    set({
      isUndoAlertVisible: false,
      lastOperation: null,
      undoTimeoutId: null,
    });
  },

  clearUndo: () => {
    const { undoTimeoutId } = get();
    
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }

    set({
      isUndoAlertVisible: false,
      lastOperation: null,
      undoTimeoutId: null,
    });
  },
}));