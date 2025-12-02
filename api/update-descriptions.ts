export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[update-descriptions] Method:', req.method);
    console.log('[update-descriptions] Body type:', typeof req.body);
    console.log('[update-descriptions] Body keys:', req.body ? Object.keys(req.body) : 'null');
    console.log('[update-descriptions] Body content:', JSON.stringify(req.body).substring(0, 300));

    let descriptions = req.body?.descriptions;
    
    // Handle case where body is a string (shouldn't happen with proper headers, but let's be safe)
    if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        descriptions = parsed.descriptions;
      } catch (e) {
        console.error('Failed to parse string body');
      }
    }

    console.log('[update-descriptions] descriptions type:', typeof descriptions);
    console.log('[update-descriptions] descriptions is array:', Array.isArray(descriptions));
    console.log('[update-descriptions] descriptions length:', descriptions?.length);

    if (!Array.isArray(descriptions) || descriptions.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid descriptions format',
        received: {
          type: typeof descriptions,
          isArray: Array.isArray(descriptions),
          length: descriptions?.length
        }
      });
    }

    let updated = 0;
    let failed = 0;
    let debugLogs = [];

    // Update each description by SKU
    for (const item of descriptions) {
      try {
        // SKUs are stored as strings WITHOUT padding (e.g., "1", "10", "100")
        const skuOriginal = String(item.sku);
        
        debugLogs.push(`Processing SKU: "${skuOriginal}"`);

        // Update by exact SKU match
        const result = await sql`
          UPDATE products 
          SET descripcion = ${item.descripcion}
          WHERE sku = ${skuOriginal}
          RETURNING sku
        `;
        
        if (result.rows.length > 0) {
          updated++;
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
    console.log(`[update-descriptions] Results: ${updated} updated, ${failed} failed`);

    res.status(200).json({
      success: true,
      message: `Descriptions updated: ${updated} successful, ${failed} failed`,
      updated,
      failed,
      total: descriptions.length,
      debug: debugLogs.slice(0, 10)
    });
  } catch (error: any) {
    console.error('[update-descriptions] Unhandled error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update descriptions',
      message: error.message
    });
  }
}
