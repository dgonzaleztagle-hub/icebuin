import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = request.headers.authorization;
  const expectedToken = process.env.INIT_TOKEN;
  
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    console.log('Dropping and recreating products table...');
    
    // Drop existing table
    await sql`DROP TABLE IF EXISTS products`;
    
    // Create table with corrected schema
    await sql`
      CREATE TABLE products (
        sku VARCHAR(50) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        precioUnit DECIMAL(10, 2),
        precioMayor DECIMAL(10, 2),
        umbralMayor VARCHAR(255),
        favorito BOOLEAN DEFAULT false,
        superfavorito BOOLEAN DEFAULT false,
        visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create indexes
    await sql`CREATE INDEX idx_categoria ON products(categoria);`;
    await sql`CREATE INDEX idx_visible ON products(visible);`;
    
    response.status(200).json({
      message: 'Database table recreated successfully with corrected schema',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database recreation error:', error);
    response.status(500).json({
      error: 'Database recreation failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
