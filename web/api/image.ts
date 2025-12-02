import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { sku } = req.query;
  
  if (!sku || typeof sku !== 'string') {
    return res.status(400).json({ error: 'SKU parameter required' });
  }

  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    const files = fs.readdirSync(imagesDir);
    
    // Busca un archivo que contenga el SKU
    const foundFile = files.find(f =>
      f.toLowerCase().includes(sku.toLowerCase())
    );

    if (!foundFile) {
      return res.status(404).json({ error: 'Image not found', searched: sku });
    }

    const filePath = path.join(imagesDir, foundFile);
    const fileContent = fs.readFileSync(filePath);
    const ext = path.extname(foundFile).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.jfif': 'image/jpeg',
      '.gif': 'image/gif',
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.end(fileContent);
  } catch (err) {
    console.error('Image resolver error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
