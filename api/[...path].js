export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const targetBase = 'https://gringa-backend-xt06g2z0ka-uc.a.run.app';
  const path = (req.query.path || []).join('/');
  const url = new URL(`${targetBase}/api/${path}`);

  for (const [k, v] of Object.entries(req.query)) {
    if (k === 'path') continue;
    if (Array.isArray(v)) v.forEach(x => url.searchParams.append(k, x));
    else url.searchParams.set(k, v);
  }

  const headers = { ...req.headers };
  delete headers.host;

  const r = await fetch(url.toString(), { method: req.method, headers });
  res.status(r.status);

  r.headers.forEach((val, key) => {
    const k = key.toLowerCase();
    if (k === 'content-encoding') return;
    res.setHeader(key, val);
  });

  const buf = Buffer.from(await r.arrayBuffer());
  res.send(buf);
}
