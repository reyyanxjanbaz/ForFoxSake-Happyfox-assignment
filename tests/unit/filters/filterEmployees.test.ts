import {
  filterByName,
  filterByDesignation,
  filterByEmployeeId,
  combineFilters,
  initialFilterState,
  updateFilterQuery,
  type FilterState,
} from '../../../src/features/org-chart/state/filterState';
import type { Employee } from '../../../src/features/org-chart/state/employee';

let employeeCounter = 0;

const createEmployee = (overrides: Partial<Employee>): Employee => ({
  id: overrides.id ?? `emp-${++employeeCounter}`,
  name: overrides.name ?? 'Sample Employee',
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

const sampleEmployees: Employee[] = [
  createEmployee({ id: 'emp-1', name: 'Alice Johnson', designation: 'Engineer', employeeId: '#1234' }),
  createEmployee({ id: 'emp-2', name: 'Bob Smith', designation: 'Product Manager', employeeId: '#5678' }),
  createEmployee({ id: 'emp-3', name: 'Charlie Brown', designation: 'Engineer', employeeId: '#9012' }),
];

describe('Filter utilities', () => {
  describe('filterByName', () => {
    it('matches employees with case-insensitive partial queries', () => {
      const results = filterByName(sampleEmployees, 'ali');
      expect(results.map(emp => emp.id)).toEqual(['emp-1']);
    });

    it('returns all employees when query is empty', () => {
      const results = filterByName(sampleEmployees, '   ');
      expect(results).toEqual(sampleEmployees);
    });
  });

  describe('filterByDesignation', () => {
    it('finds matches regardless of casing', () => {
      const results = filterByDesignation(sampleEmployees, 'product');
      expect(results.map(emp => emp.id)).toEqual(['emp-2']);
    });
  });

  describe('filterByEmployeeId', () => {
    it('matches by formatted employee id and numeric shorthand', () => {
      expect(filterByEmployeeId(sampleEmployees, '#5678')).toHaveLength(1);
      expect(filterByEmployeeId(sampleEmployees, '5678')).toHaveLength(1);
      expect(filterByEmployeeId(sampleEmployees, '#0000')).toHaveLength(0);
    });
  });

  describe('combineFilters', () => {
    const activateFilter = (
      state: FilterState,
      field: 'name' | 'designation' | 'employeeId',
      query: string
    ) => updateFilterQuery(state, field, query, sampleEmployees);

    it('applies AND logic across active filters', () => {
      let state = activateFilter(initialFilterState, 'name', 'alice');
      expect(state.results).toEqual(['emp-1']);
      state = activateFilter(state, 'designation', 'engineer');
      expect(state.results).toEqual(['emp-1']);
      const results = combineFilters(state, sampleEmployees);
      expect(results).toEqual(['emp-1']);
    });

    it('returns empty array when no filters are active', () => {
      const results = combineFilters(initialFilterState, sampleEmployees);
      expect(results).toEqual([]);
    });
  });
});