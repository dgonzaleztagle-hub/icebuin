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
    console.log('Adding description column to products table...');
    
    // Add description column if it doesn't exist
    await sql`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS descripcion TEXT;
    `;
    
    console.log('✓ Description column added successfully');
    response.status(200).json({ message: 'Database migration completed' });
  } catch (error) {
    console.error('Migration error:', error);
    response.status(500).json({ error: 'Migration failed', details: error });
  }
}
