// MirageJS server configuration with employee CRUD operations

import { createServer, Model, Factory, Response } from 'miragejs';
import { faker } from '@faker-js/faker';
import type { Employee } from '../features/org-chart/state/employee';
import { generateOrgHierarchy } from '../features/org-chart/utils/dummyData';
import { buildOrgHierarchy, detectCycle, getDescendants } from '../features/org-chart/state/orgHierarchy';

// MirageJS models
const EmployeeModel = Model.extend({});

// MirageJS factories
const EmployeeFactory = Factory.extend({
  id() {
    return `emp_${faker.string.alphanumeric(8)}`;
  },
  name() {
    return faker.person.fullName();
  },
  designation() {
    return faker.person.jobTitle();
  },
  tier() {
    return faker.helpers.arrayElement(['executive', 'lead', 'manager', 'individual', 'intern']);
  },
  team() {
    return faker.helpers.arrayElement([
      'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 
      'Operations', 'Finance', 'HR', 'Legal'
    ]);
  },
  managerId() {
    return null; // Will be set explicitly in seeding
  },
  employeeId() {
    return `EMP${faker.string.numeric(4)}`;
  },
  photoAssetKey() {
    const photoAssets = [
      'person-01', 'person-02', 'person-03', 'person-04', 'person-05',
      'person-06', 'person-07', 'person-08', 'person-09', 'person-10',
      'person-11', 'person-12', 'person-13', 'person-14', 'person-15',
      'person-16', 'person-17', 'person-18', 'person-19', 'person-20',
    ];
    return faker.helpers.arrayElement(photoAssets);
  },
  photoUrl() {
    return null;
  },
  highlightState() {
    return {
      active: false,
      reason: null,
    };
  },
  lastUpdatedAt() {
    return new Date().toISOString();
  },
});

// Helper to build hierarchy metadata
const buildHierarchyMetadata = (employees: Employee[]) => {
  const hierarchy = buildOrgHierarchy(employees);
  
  // Calculate levels for each employee
  const levels: Record<string, number> = {};
  const calculateLevel = (employeeId: string, visited = new Set<string>()): number => {
    if (visited.has(employeeId)) return 0; // Cycle protection
    if (levels[employeeId] !== undefined) return levels[employeeId];
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee || !employee.managerId) {
      levels[employeeId] = 0;
      return 0;
    }
    
    visited.add(employeeId);
    const level = 1 + calculateLevel(employee.managerId, visited);
    visited.delete(employeeId);
    levels[employeeId] = level;
    return level;
  };
  
  employees.forEach(emp => calculateLevel(emp.id));
  
  return {
    roots: hierarchy.roots,
    children: hierarchy.children,
    levels,
  };
};

// Create and configure MirageJS server
export function makeServer({ environment = 'development' } = {}) {
  return createServer({
    environment,

    models: {
      employee: EmployeeModel,
    },

    factories: {
      employee: EmployeeFactory,
    },

    seeds(server) {
      // Generate realistic 5-tier hierarchy using our dummy data
      const orgData = generateOrgHierarchy();
      
      // Seed database with generated hierarchy
      orgData.forEach(employee => {
        server.create('employee', employee as any);
      });
    },

    routes() {
      this.namespace = 'api';

      // GET /api/employees - Retrieve all employees with hierarchy metadata
      this.get('/employees', (schema) => {
        const employees = schema.db.employees as Employee[];
        const hierarchy = buildHierarchyMetadata(employees);
        
        return {
          data: employees,
          hierarchy,
        };
      });

      // POST /api/employees - Create new employee
      this.post('/employees', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        
        // Generate missing fields
        const newEmployee = {
          ...attrs,
          id: `emp_${faker.string.alphanumeric(8)}`,
          employeeId: `EMP${faker.string.numeric(4)}`,
          photoAssetKey: faker.helpers.arrayElement([
            'person-01', 'person-02', 'person-03', 'person-04', 'person-05',
            'person-06', 'person-07', 'person-08', 'person-09', 'person-10',
            'person-11', 'person-12', 'person-13', 'person-14', 'person-15',
            'person-16', 'person-17', 'person-18', 'person-19', 'person-20',
          ]),
          photoUrl: null,
          highlightState: {
            active: false,
            reason: null,
          },
          lastUpdatedAt: new Date().toISOString(),
        };

        const employee = schema.create('employee', newEmployee);
        return new Response(201, {}, employee.attrs);
      });

      // PATCH /api/employees/:id - Update employee
      this.patch('/employees/:id', (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        
        const employee = schema.find('employee', id);
        if (!employee) {
          return new Response(404, {}, { 
            status: 'error', 
            message: 'Employee not found' 
          });
        }

        // Check for cycle if managerId is being updated
        if (attrs.managerId && attrs.managerId !== employee.attrs.managerId) {
          const employees = schema.db.employees as Employee[];
          const hierarchy = buildOrgHierarchy(employees);
          
          // Check if the reassignment would create a cycle
          if (detectCycle(id, attrs.managerId, hierarchy)) {
            return new Response(409, {}, {
              status: 'error',
              message: 'Cannot reassign employee: would create circular dependency'
            });
          }
        }

        // Update employee
        const updatedAttrs = {
          ...attrs,
          lastUpdatedAt: new Date().toISOString(),
        };
        
        employee.update(updatedAttrs);
        return new Response(200, {}, employee.attrs);
      });

      // DELETE /api/employees/:id - Delete employee (optionally cascade to descendants)
      this.delete('/employees/:id', (schema, request) => {
        const id = request.params.id;
        const cascade = request.queryParams?.cascade === 'true';

        const employee = schema.find('employee', id);
        if (!employee) {
          return new Response(404, {}, {
            status: 'error',
            message: 'Employee not found',
          });
        }

        if (cascade) {
          const employees = schema.db.employees as Employee[];
          const hierarchy = buildOrgHierarchy(employees);
          const descendantIds = getDescendants(id, hierarchy);
          const branchIds = [id, ...descendantIds];

          branchIds.forEach(employeeId => {
            const target = schema.find('employee', employeeId);
            target?.destroy();
          });

          return new Response(204);
        }

  const hasReports = (schema.db.employees as Employee[]).some((emp) => emp.managerId === id);
        if (hasReports) {
          return new Response(409, {}, {
            status: 'error',
            message: 'Cannot delete employee with direct reports. Use cascade delete to remove the entire branch.',
          });
        }

        employee.destroy();
        return new Response(204);
      });

      // Handle CORS for development
      this.pretender.prepareHeaders = function(headers: Record<string, string>) {
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, DELETE, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        return headers;
      };

      // Passthrough for any unhandled requests
      this.passthrough();
    },
  });
}

// Auto-start server in development (check for browser environment)
if (typeof window !== 'undefined') {
  makeServer();
}