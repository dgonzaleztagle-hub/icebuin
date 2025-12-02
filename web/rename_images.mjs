import fs from 'fs';
import path from 'path';

const imagesDir = './public/images';
const files = fs.readdirSync(imagesDir);

files.forEach(file => {
  if (file === '.gitkeep') return;
  
  // Extraer SKU del nombre (buscar patrón "SKU0XXX" o "SKU XXX")
  const skuMatch = file.match(/SKU\s*0?(\d+)/i);
  if (skuMatch) {
    const skuNum = parseInt(skuMatch[1], 10);
    const paddedSku = String(skuNum).padStart(3, '0');
    
    // Obtener extensión del archivo original
    const ext = path.extname(file).toLowerCase();
    const newName = `${paddedSku}${ext}`;
    
    const oldPath = path.join(imagesDir, file);
    const newPath = path.join(imagesDir, newName);
    
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`✓ ${file} → ${newName}`);
    } catch (err) {
      console.log(`✗ Error renombrando ${file}: ${err.message}`);
    }
  } else {
    console.log(`⚠️ No SKU encontrado en: ${file}`);
  }
});

console.log('\n✅ Renombrado completado!');
