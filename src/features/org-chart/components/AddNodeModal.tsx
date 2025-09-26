// Modal component for adding new employee nodes to the org chart

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Employee } from '../state/employee';
import { employeeApi, type EmployeeCreateRequest } from '../services/api';

export interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded?: (newEmployee: Employee) => void;
  managers: Employee[]; // Available managers for selection
  defaultManagerId?: string | null;
  className?: string;
}

export interface EmployeeFormData {
  name: string;
  designation: string;
  tier: Employee['tier'];
  team: string;
  managerId: string | null;
}

const initialFormData: EmployeeFormData = {
  name: '',
  designation: '',
  tier: 'individual',
  team: '',
  managerId: null,
};

const TIER_OPTIONS: { value: Employee['tier']; label: string }[] = [
  { value: 'executive', label: 'Executive' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
  { value: 'individual', label: 'Individual Contributor' },
  { value: 'intern', label: 'Intern' },
];

export const AddNodeModal: React.FC<AddNodeModalProps> = ({
  isOpen,
  onClose,
  onEmployeeAdded,
  managers,
  defaultManagerId,
  className = '',
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    ...initialFormData,
    managerId: defaultManagerId || null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<EmployeeFormData>>({});
  
  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLInputElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Update form field
  const updateField = useCallback((field: keyof EmployeeFormData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Validate form data
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<EmployeeFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }

    if (!formData.team.trim()) {
      newErrors.team = 'Team is required';
    }

    if (!formData.managerId && formData.tier !== 'executive') {
      newErrors.managerId = 'Manager is required for non-executive roles';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const createRequest: EmployeeCreateRequest = {
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        tier: formData.tier,
        team: formData.team.trim(),
        managerId: formData.managerId,
      };

      const newEmployee = await employeeApi.createEmployee(createRequest);
      
      onEmployeeAdded?.(newEmployee);
      handleClose();
      
    } catch (error) {
      console.error('Error creating employee:', error);
      setErrors({ name: 'Failed to create employee. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onEmployeeAdded]);

  // Handle modal close with cleanup
  const handleClose = useCallback(() => {
    setFormData({ ...initialFormData, managerId: defaultManagerId || null });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  }, [defaultManagerId, onClose]);

  // Focus trap implementation
  useEffect(() => {
    if (isOpen) {
      // Focus the first input when modal opens
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
      
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle keyboard navigation and focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
      return;
    }
    
    // Focus trap logic
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'input, select, button, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [handleClose]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div 
      className={`modal-overlay ${className}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-employee-title"
      aria-describedby="add-employee-description"
    >
      <div 
        ref={modalRef}
        className="modal-content"
        role="document"
      >
        <div className="modal-header">
          <h2 id="add-employee-title" className="modal-title">
            Add New Employee
          </h2>
          <p id="add-employee-description" className="sr-only">
            Fill out the form below to add a new employee to the organization chart
          </p>
          <button
            type="button"
            className="modal-close-button"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="employee-name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              ref={firstFocusableRef}
              id="employee-name"
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter employee's full name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'employee-name-error' : undefined}
              required
            />
            {errors.name && (
              <span id="employee-name-error" className="form-error" role="alert" aria-live="polite">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="employee-designation" className="form-label">
              Designation <span className="required">*</span>
            </label>
            <input
              id="employee-designation"
              type="text"
              className={`form-input ${errors.designation ? 'error' : ''}`}
              value={formData.designation}
              onChange={(e) => updateField('designation', e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              required
            />
            {errors.designation && (
              <span className="form-error" role="alert">
                {errors.designation}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="employee-tier" className="form-label">
              Tier <span className="required">*</span>
            </label>
            <select
              id="employee-tier"
              className="form-select"
              value={formData.tier}
              onChange={(e) => updateField('tier', e.target.value as Employee['tier'])}
              required
            >
              {TIER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="employee-team" className="form-label">
              Team <span className="required">*</span>
            </label>
            <input
              id="employee-team"
              type="text"
              className={`form-input ${errors.team ? 'error' : ''}`}
              value={formData.team}
              onChange={(e) => updateField('team', e.target.value)}
              placeholder="e.g., Engineering, Marketing, Sales"
              required
            />
            {errors.team && (
              <span className="form-error" role="alert">
                {errors.team}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="employee-manager" className="form-label">
              Manager {formData.tier !== 'executive' && <span className="required">*</span>}
            </label>
            <select
              id="employee-manager"
              className={`form-select ${errors.managerId ? 'error' : ''}`}
              value={formData.managerId || ''}
              onChange={(e) => updateField('managerId', e.target.value || null)}
              required={formData.tier !== 'executive'}
            >
              <option value="">
                {formData.tier === 'executive' ? 'No manager (CEO/Founder)' : 'Select a manager'}
              </option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} - {manager.designation}
                </option>
              ))}
            </select>
            {errors.managerId && (
              <span className="form-error" role="alert">
                {errors.managerId}
              </span>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              ref={lastFocusableRef}
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
              aria-describedby={isSubmitting ? 'submit-status' : undefined}
            >
              {isSubmitting ? 'Creating...' : 'Add Employee'}
              {isSubmitting && (
                <span id="submit-status" className="sr-only" aria-live="polite">
                  Please wait, creating employee...
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNodeModal;