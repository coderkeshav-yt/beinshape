import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
async function updateFiles() {
  for (const filePath of filesToUpdate) {
    try {
      const fullPath = path.join(__dirname, filePath);
      
      try {
        await fs.access(fullPath);
        let content = await fs.readFile(fullPath, 'utf8');
        const updatedContent = content.replace(/\/lovable-uploads\//g, '/Web_asset/');
        
        if (content !== updatedContent) {
          await fs.writeFile(fullPath, updatedContent, 'utf8');
          console.log(`✅ Updated: ${filePath}`);
        } else {
          console.log(`ℹ️  No changes needed: ${filePath}`);
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.warn(`⚠️  File not found: ${filePath}`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
    }
  }
  
  console.log('\n✅ All files have been processed.');
}

// Run the update
updateFiles().catch(console.error);
