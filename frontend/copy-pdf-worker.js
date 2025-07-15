// Cross-platform script to copy PDF.js worker file
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const destination = path.join(__dirname, 'public/pdf.worker.min.js');

try {
  // Ensure the public directory exists
  const publicDir = path.dirname(destination);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copy the worker file
  fs.copyFileSync(source, destination);
  console.log('✅ PDF.js worker file copied successfully');
  console.log(`   From: ${source}`);
  console.log(`   To: ${destination}`);
} catch (error) {
  console.error('❌ Failed to copy PDF.js worker file:', error.message);
  process.exit(1);
} 