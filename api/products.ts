import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  try {
    if (request.method === 'GET') {
      // GET all products
      const { rows } = await sql`SELECT * FROM products ORDER BY nombre ASC`;
      response.status(200).json(rows);
    } else if (request.method === 'POST') {
      // POST bulk insert products
      const products = request.body;
      
      if (!Array.isArray(products)) {
        response.status(400).json({ error: 'Expected array of products' });
        return;
      }

      // Delete existing products first
      await sql`DELETE FROM products`;

      // Insert new products
      for (const product of products) {
        await sql`
          INSERT INTO products (sku, nombre, categoria, precioUnit, precioMayor, umbralMayor, favorito, superfavorito, visible)
          VALUES (${product.sku}, ${product.nombre}, ${product.categoria}, ${product.precioUnit}, ${product.precioMayor}, ${product.umbralMayor}, ${product.favorito || false}, ${product.superfavorito || false}, ${product.visible !== false})
        `;
      }

      response.status(201).json({ message: `${products.length} products inserted` });
    } else if (request.method === 'PUT') {
      // PUT update single product
      const { sku, ...updateData } = request.body;
      
      if (!sku) {
        response.status(400).json({ error: 'SKU is required' });
        return;
      }

      await sql`
        UPDATE products
        SET 
          nombre = COALESCE(${updateData.nombre}, nombre),
          categoria = COALESCE(${updateData.categoria}, categoria),
          precioUnit = COALESCE(${updateData.precioUnit}, precioUnit),
          precioMayor = COALESCE(${updateData.precioMayor}, precioMayor),
          umbralMayor = COALESCE(${updateData.umbralMayor}, umbralMayor),
          favorito = COALESCE(${updateData.favorito}, favorito),
          superfavorito = COALESCE(${updateData.superfavorito}, superfavorito),
          visible = COALESCE(${updateData.visible}, visible)
        WHERE sku = ${sku}
      `;

      response.status(200).json({ message: 'Product updated' });
    } else if (request.method === 'DELETE') {
      // DELETE single product
      const { sku } = request.query;
      
      if (!sku) {
        response.status(400).json({ error: 'SKU is required' });
        return;
      }

      await sql`DELETE FROM products WHERE sku = ${sku}`;
      response.status(200).json({ message: 'Product deleted' });
    } else {
      response.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    response.status(500).json({ error: 'Database error', details: error instanceof Error ? error.message : String(error) });
  }
}
