const fs = require('fs');
const path = require('path');

// Files to update with their paths relative to the project root
const filesToUpdate = [
  'index.html',
  'public/favicon.svg',
  'src/components/Footer.tsx',
  'src/components/CircularNav.tsx',
  'src/components/RazorpayPayment.tsx',
  'src/pages/BatchDetail.tsx',
  'src/pages/Batches.tsx',
  'src/pages/Index.tsx'
];

// Process each file
filesToUpdate.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const updatedContent = content.replace(/\/lovable-uploads\//g, '/Web_asset/');
      
      if (content !== updatedContent) {
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
      } else {
        console.log(`ℹ️  No changes needed: ${filePath}`);
      }
    } else {
      console.warn(`⚠️  File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log('\n✅ All files have been processed.');
