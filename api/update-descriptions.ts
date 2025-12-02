export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { descriptions } = req.body;

    console.log('[DEBUG] Received body:', JSON.stringify(req.body).substring(0, 200));
    console.log('[DEBUG] descriptions array:', Array.isArray(descriptions), descriptions?.length);

    if (!Array.isArray(descriptions) || descriptions.length === 0) {
      return res.status(400).json({ error: 'Invalid descriptions format' });
    }

    let updated = 0;
    let failed = 0;
    let debugLogs = [];

    // Update each description by SKU
    for (const item of descriptions) {
      try {
        // SKUs are stored as strings WITHOUT padding (e.g., "1", "10", "100")
        const skuOriginal = item.sku.toString();
        
        debugLogs.push(`Processing SKU: "${skuOriginal}" (type: ${typeof skuOriginal}, length: ${skuOriginal.length})`);

        // Update by exact SKU match
        const result = await sql`
          UPDATE products 
          SET descripcion = ${item.descripcion}
          WHERE sku = ${skuOriginal}
          RETURNING sku
        `;
        
        if (result.rows.length > 0) {
          updated++;
          debugLogs.push(`✓ Updated SKU ${item.sku}`);
        } else {
          failed++;
          debugLogs.push(`✗ No match for SKU: "${skuOriginal}"`);
        }
      } catch (error: any) {
        console.error(`Error updating SKU ${item.sku}:`, error.message);
        debugLogs.push(`ERROR on SKU ${item.sku}: ${error.message}`);
        failed++;
      }
    }

    // Log first 10 debug entries
    console.log('[DEBUG] First 10 updates:', debugLogs.slice(0, 10).join(' | '));

    res.status(200).json({
      success: true,
      message: `Descriptions updated: ${updated} successful, ${failed} failed`,
      updated,
      failed,
      total: descriptions.length,
      debug: debugLogs.slice(0, 5)  // Send first 5 for debugging
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
