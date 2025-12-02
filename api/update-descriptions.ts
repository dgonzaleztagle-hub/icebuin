import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { descriptions } = req.body;

    if (!Array.isArray(descriptions) || descriptions.length === 0) {
      return res.status(400).json({ error: 'Invalid descriptions format' });
    }

    let updated = 0;
    let failed = 0;

    // Update each description by SKU
    for (const item of descriptions) {
      try {
        // Ensure SKU is padded to 3 digits
        const skuPadded = item.sku.toString().padStart(3, '0');
        
        // Update by SKU match
        const result = await sql`
          UPDATE products 
          SET descripcion = ${item.descripcion}
          WHERE "SKU" = ${skuPadded}
          RETURNING "SKU"
        `;
        
        if (result.rows.length > 0) {
          updated++;
        } else {
          failed++;
        }
      } catch (error: any) {
        console.error(`Error updating SKU ${item.sku}:`, error.message);
        failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Descriptions updated: ${updated} successful, ${failed} failed`,
      updated,
      failed,
      total: descriptions.length
    });
  } catch (error: any) {
    console.error('Error updating descriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update descriptions',
      message: error.message
    });
  }
}
