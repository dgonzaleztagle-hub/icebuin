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

  // Simple auth check - in production use proper authentication
  const authHeader = request.headers.authorization;
  const expectedToken = process.env.INIT_TOKEN;
  
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    console.log('Initializing database...');
    
    // Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        sku VARCHAR(50) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        precioUnit DECIMAL(10, 2),
        precioMayor DECIMAL(10, 2),
        umbralMayor INT,
        favorito BOOLEAN DEFAULT false,
        superfavorito BOOLEAN DEFAULT false,
        visible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_categoria ON products(categoria);
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_visible ON products(visible);
    `;
    
    // Check table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'products'
      );
    `;
    
    // Count rows
    const countResult = await sql`SELECT COUNT(*) as count FROM products;`;
    const count = (countResult.rows[0] as { count: string }).count;
    
    response.status(200).json({
      message: 'Database initialized successfully',
      tableExists: tableCheck.rows[0],
      productCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    response.status(500).json({
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
