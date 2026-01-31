export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const ORIGIN = process.env.CLOUD_RUN_ORIGIN || "https://gringa-backend-xt06g2z0ka-uc.a.run.app";

export default async function handler(req, res) {
  try {
    const path = (req.query.path || []).join("/");
    const qs = req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";
    const target = `${ORIGIN}/${path}${qs}`;

    // Copia headers (removendo hop-by-hop)
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers['content-length'];

    // Monta body (se não for GET/HEAD)
    const method = req.method || "GET";
    const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());

    const fetchOpts = {
      method,
      headers,
      redirect: "manual",
      body: hasBody ? req : undefined,
    };

    const upstream = await fetch(target, fetchOpts);

    // Status
    res.status(upstream.status);

    // Headers de resposta (evita conflitos)
    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === "transfer-encoding") return;
      if (k === "content-encoding") return; // evita gzip/br quebrando
      res.setHeader(key, value);
    });

    // Stream do body
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  } catch (err) {
    res.status(502).json({
      ok: false,
      error: "proxy_failed",
      message: err?.message || String(err),
    });
  }
}
