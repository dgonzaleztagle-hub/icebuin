export default async function handler(req: any, res: any) {
  console.log('[test-endpoint] Received request');
  console.log('[test-endpoint] Method:', req.method);
  console.log('[test-endpoint] Body:', JSON.stringify(req.body).substring(0, 200));
  
  res.status(200).json({
    ok: true,
    method: req.method,
    bodyType: typeof req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    timestamp: new Date().toISOString()
  });
}
