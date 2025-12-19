const fs = require('fs');
const path = require('path');

const distStylesDir = path.join(__dirname, '../dist/styles');
const srcStylesFile = path.join(__dirname, '../src/styles/globals.css');
const distStylesFile = path.join(distStylesDir, 'globals.css');

// Create dist/styles directory if it doesn't exist
if (!fs.existsSync(distStylesDir)) {
  fs.mkdirSync(distStylesDir, { recursive: true });
}

// Copy CSS file
if (fs.existsSync(srcStylesFile)) {
  fs.copyFileSync(srcStylesFile, distStylesFile);
  console.log('✓ Copied styles/globals.css to dist');
} else {
  console.warn('⚠ src/styles/globals.css not found');
}
