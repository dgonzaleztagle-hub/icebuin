import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  try {
    // Get all SKUs from database
    const { rows } = await sql`
      SELECT sku, nombre FROM products ORDER BY sku ASC LIMIT 20
    `;

    // Also show the JSON format
    const descriptions = [
      { sku: "1", nombre: "CHURRASCO CAJA 2 KGS. RUPANCO" },
      { sku: "2", nombre: "LOMITO INT 2 KGS. RUPANCO" }
    ];

    res.status(200).json({
      database_skus: rows.map((r: any) => ({
        sku: r.sku,
        sku_type: typeof r.sku,
        sku_length: r.sku ? r.sku.length : 0,
        nombre: r.nombre
      })),
      json_format: descriptions.map(d => ({
        sku: d.sku,
        sku_type: typeof d.sku,
        sku_padded: d.sku.toString().padStart(3, '0')
      })),
      total_products: (await sql`SELECT COUNT(*) as count FROM products`).rows[0].count
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
