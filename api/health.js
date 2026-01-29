module.exports = async (req, res) => {
  // CORS básico
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const CLOUD_RUN = 'https://gringa-backend-645941755023.us-central1.run.app';

  try {
    const r = await fetch(`${CLOUD_RUN}/health`, { method: 'GET' });
    const text = await r.text();
    // tenta devolver JSON, se não for JSON devolve texto
    try {
      const data = JSON.parse(text);
      return res.status(r.status).json(data);
    } catch {
      return res.status(r.status).send(text);
    }
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Bad gateway', detail: String(err) });
  }
};
