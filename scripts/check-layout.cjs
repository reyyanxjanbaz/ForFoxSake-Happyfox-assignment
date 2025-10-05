/* eslint-env node */
/* global console, process */

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' }
});

const { generateOrgHierarchy } = require('../src/features/org-chart/utils/dummyData');
const { buildOrgHierarchy } = require('../src/features/org-chart/state/orgHierarchy');
const { buildOrgChart } = require('../src/features/org-chart/services/graphBuilder');

const employees = generateOrgHierarchy();
const hierarchy = buildOrgHierarchy(employees);
const chart = buildOrgChart({ data: employees, hierarchy });

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
