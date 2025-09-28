#!/usr/bin/env node

import { chromium } from 'playwright';

async function testDndKit() {
  console.log('🚀 Testing @dnd-kit drag and drop implementation...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:5176');
    console.log('✅ Navigated to app');
    
    // Wait for the org chart to load
    await page.waitForSelector('[data-testid="org-chart-node"], .react-flow__node', { timeout: 10000 });
    console.log('✅ Org chart nodes loaded');
    
    // Find draggable elements (nodes with @dnd-kit setup)
    const draggableElements = await page.$$('[data-testid="org-chart-node"], .react-flow__node');
    console.log(`📊 Found ${draggableElements.length} nodes`);
    
    if (draggableElements.length >= 2) {
      const sourceNode = draggableElements[0];
      const targetNode = draggableElements[1];
      
      // Get node information
      const sourceInfo = await sourceNode.evaluate(el => ({
        id: el.getAttribute('data-id') || 'unknown',
        text: el.textContent?.substring(0, 50) || 'No text'
      }));
      
      const targetInfo = await targetNode.evaluate(el => ({
        id: el.getAttribute('data-id') || 'unknown', 
        text: el.textContent?.substring(0, 50) || 'No text'
      }));
      
      console.log(`🎯 Source: ${sourceInfo.text} (ID: ${sourceInfo.id})`);
      console.log(`🎯 Target: ${targetInfo.text} (ID: ${targetInfo.id})`);
      
      // Test @dnd-kit drag and drop
      console.log('🔄 Testing @dnd-kit drag operation...');
      
      // Get bounding boxes
      const sourceBounds = await sourceNode.boundingBox();
      const targetBounds = await targetNode.boundingBox();
      
      if (sourceBounds && targetBounds) {
        // Start drag
        await page.mouse.move(
          sourceBounds.x + sourceBounds.width/2, 
          sourceBounds.y + sourceBounds.height/2
        );
        await page.mouse.down();
        console.log('📤 Mouse down on source');
        
        // Drag to target
        await page.mouse.move(
          targetBounds.x + targetBounds.width/2,
          targetBounds.y + targetBounds.height/2,
          { steps: 10 }
        );
        console.log('🎯 Dragged to target');
        
        // Drop
        await page.mouse.up();
        console.log('📥 Mouse up (drop)');
        
        // Wait a moment for any async operations
        await page.waitForTimeout(1000);
        
        console.log('✅ @dnd-kit drag and drop test completed!');
      } else {
        console.log('❌ Could not get node boundaries');
      }
    } else {
      console.log('❌ Not enough nodes found for drag test');
    }
    
    // Check console for any @dnd-kit related messages
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(2000);
    
    const dndLogs = logs.filter(log => 
      log.includes('dnd') || 
      log.includes('drag') || 
      log.includes('drop') ||
      log.includes('@dnd-kit')
    );
    
    if (dndLogs.length > 0) {
      console.log('📝 Drag-related console messages:');
      dndLogs.forEach(log => console.log(`  - ${log}`));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testDndKit().catch(console.error);