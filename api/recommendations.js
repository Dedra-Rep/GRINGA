async function readRawBody(req) {
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const CLOUD_RUN = 'https://gringa-backend-645941755023.us-central1.run.app';

  try {
    const raw = await readRawBody(req);
    const contentType = req.headers['content-type'] || 'application/json';

    const r = await fetch(`${CLOUD_RUN}/api/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      body: raw && raw.length ? raw : '{}',
    });

    const text = await r.text();

    // devolve status e conteúdo
    res.statusCode = r.status;

    // tenta JSON
    try {
      const data = JSON.parse(text);
      return res.json(data);
    } catch {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end(text);
    }
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Bad gateway', detail: String(err) });
  }
};
