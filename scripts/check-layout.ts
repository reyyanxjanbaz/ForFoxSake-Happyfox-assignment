import { generateOrgHierarchy } from '../src/features/org-chart/utils/dummyData.ts';
import { buildOrgHierarchy } from '../src/features/org-chart/state/orgHierarchy.ts';
import { buildOrgChart } from '../src/features/org-chart/services/graphBuilder.ts';

const employees = generateOrgHierarchy();
const hierarchy = buildOrgHierarchy(employees);
const chart = buildOrgChart({ data: employees, hierarchy });

const positions = new Map<string, string>();
for (const node of chart.nodes) {
  const key = `${Math.round(node.position.x)}:${Math.round(node.position.y)}`;
  if (positions.has(key)) {
    console.error('Overlap detected for', node.id, 'and', positions.get(key));
    process.exit(1);
  }
  positions.set(key, node.id);
}

console.log(`Unique positions for ${chart.nodes.length} nodes.`);
