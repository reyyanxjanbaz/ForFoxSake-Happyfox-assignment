// Script to generate placeholder profile photos for lazy loading demo

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
  '#A3E4D7', '#F9E79F', '#D5A6BD', '#AED6F1', '#A9DFBF'
];

// Create SVG placeholder for each person
for (let i = 1; i <= 20; i++) {
  const personId = i.toString().padStart(2, '0');
  const color = colors[i - 1];
  const initials = `P${personId}`;
  
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="${color}"/>
  <text x="100" y="120" font-family="Arial" font-size="48" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
</svg>`;

  // Note: In a real app, you'd use actual photos
  // This creates SVG placeholders for development
  writeFileSync(join(process.cwd(), 'public', 'assets', 'photos', `person-${personId}.jpg`), svg);
}

console.log('Generated 20 placeholder profile photos');