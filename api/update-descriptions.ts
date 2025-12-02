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
        // Try multiple SKU formats: original, padded, and uppercase
        const skuOriginal = item.sku.toString();
        const skuPadded = skuOriginal.padStart(3, '0');
        const skuUppercase = skuOriginal.toUpperCase();
        const skuPaddedUpper = skuPadded.toUpperCase();
        
        // Update by SKU match - flexible search to find the product regardless of format
        const result = await sql`
          UPDATE products 
          SET descripcion = ${item.descripcion}
          WHERE 
            sku = ${skuOriginal} 
            OR sku = ${skuPadded} 
            OR LOWER(sku) = LOWER(${skuOriginal})
            OR LOWER(sku) = LOWER(${skuPadded})
          RETURNING sku
        `;
        
        if (result.rows.length > 0) {
          updated++;
          console.log(`Updated SKU ${item.sku} (found as: ${result.rows[0].sku})`);
        } else {
          failed++;
          console.warn(`No match found for SKU: ${item.sku}`);
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
