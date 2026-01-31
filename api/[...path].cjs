/**
 * Catch-all API proxy for Vercel -> Cloud Run
 * Matches: /api/*  (except routes that have a more specific file like /api/health)
 */
const { URL } = require('url');

const CLOUD_RUN_BASE =
  process.env.CLOUD_RUN_BASE ||
  "https://gringa-backend-xt06g2z0ka-uc.a.run.app"; // <-- confirme se é esta

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  try {
    // Remove "/api" do começo e monta a URL final no Cloud Run
    const originalUrl = req.url || '/';
    const pathAndQuery = originalUrl.startsWith('/api')
      ? originalUrl.slice(4) || '/'
      : originalUrl;

    const target = new URL(pathAndQuery, CLOUD_RUN_BASE);

    // Copia headers "seguros" (remove hop-by-hop headers)
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers['content-length'];

    const method = (req.method || 'GET').toUpperCase();
    const hasBody = !['GET', 'HEAD'].includes(method);
    const body = hasBody ? await readBody(req) : undefined;

    const upstream = await fetch(target.toString(), {
      method,
      headers,
      body: hasBody ? body : undefined,
    });

    // Devolve status + headers
    res.statusCode = upstream.status;
    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      // evita alguns headers que podem quebrar resposta em proxy
      if (k === 'transfer-encoding' || k === 'connection') return;
      res.setHeader(key, value);
    });

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      ok: false,
      error: 'proxy_failed',
      message: err && err.message ? err.message : String(err),
    }));
  }
};
