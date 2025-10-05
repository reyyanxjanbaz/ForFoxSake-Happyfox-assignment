import { applyHighlightChanges, type Employee } from '../../../src/features/org-chart/state/employee';

describe('applyHighlightChanges', () => {
  const baseEmployee = (overrides: Partial<Employee>): Employee => ({
    id: overrides.id ?? 'emp-1',
    name: overrides.name ?? 'Test User',
    designation: overrides.designation ?? 'Engineer',
    tier: overrides.tier ?? 'individual',
    team: overrides.team ?? 'Engineering',
    managerId: overrides.managerId ?? null,
    photoAssetKey: overrides.photoAssetKey ?? null,
    photoUrl: overrides.photoUrl ?? null,
    employeeId: overrides.employeeId ?? '#1000',
    highlightState: overrides.highlightState ?? { active: false, reason: null },
    lastUpdatedAt: overrides.lastUpdatedAt ?? new Date().toISOString(),
  });

  it('activates new filter highlights and clears stale ones', () => {
    const employees: Employee[] = [
      baseEmployee({ id: 'emp-1', highlightState: { active: true, reason: 'filter' } }),
      baseEmployee({ id: 'emp-2', highlightState: { active: true, reason: 'filter' } }),
    ];

    const updated = applyHighlightChanges(employees, ['emp-1'], { active: true, reason: 'filter' });

    expect(updated[0].highlightState).toEqual({ active: true, reason: 'filter' });
    expect(updated[1].highlightState).toEqual({ active: false, reason: null });
  });

  it('clears all filter highlights when requested', () => {
    const employees: Employee[] = [
      baseEmployee({ id: 'emp-1', highlightState: { active: true, reason: 'filter' } }),
      baseEmployee({ id: 'emp-2', highlightState: { active: true, reason: 'filter' } }),
    ];

    const updated = applyHighlightChanges(employees, ['emp-1', 'emp-2'], { active: false, reason: null });

    expect(updated.every(emp => emp.highlightState.active === false)).toBe(true);
    expect(updated.every(emp => emp.highlightState.reason === null)).toBe(true);
  });

  it('toggles drag highlights and clears reason when inactive', () => {
    const employees: Employee[] = [
      baseEmployee({ id: 'emp-1' }),
    ];

    const activated = applyHighlightChanges(employees, ['emp-1'], { active: true, reason: 'drag' });
    expect(activated[0].highlightState).toEqual({ active: true, reason: 'drag' });

    const cleared = applyHighlightChanges(activated, ['emp-1'], { active: false, reason: 'drag' });
    expect(cleared[0].highlightState).toEqual({ active: false, reason: null });
  });
});
