/* eslint-env node */
/* global console, process */

import { makeServer } from '../src/mocks/server.ts';
import { employeeApi } from '../src/features/org-chart/services/api.ts';

const server = makeServer({ environment: 'test' });

try {
  const collection = await employeeApi.loadEmployees();
  const { buildOrgChart } = await import('../src/features/org-chart/services/graphBuilder.ts');
  const chart = buildOrgChart(collection);

  const positions = new Map();
  for (const node of chart.nodes) {
    const key = `${Math.round(node.position.x)}:${Math.round(node.position.y)}`;
    if (positions.has(key)) {
      console.error('Overlap detected for', node.id, 'and', positions.get(key));
      process.exit(1);
    }
    positions.set(key, node.id);
  }

  console.log('Unique positions for', chart.nodes.length, 'nodes.');
} finally {
  server.shutdown();
}
