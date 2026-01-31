export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  try {
    // health check local do proxy
    if (req.method === "GET" && (req.url === "/api/health" || req.url === "/health")) {
      res.status(200).json({ ok: true, from: "vercel-function" });
      return;
    }

    const base = process.env.CLOUD_RUN_BASE_URL || "https://gringa-backend-xt06g2z0ka-uc.a.run.app";
    const url = new URL(req.url, "http://localhost"); // só pra parsear path/query
    const target = new URL(base);
    target.pathname = url.pathname.replace(/^\/api/, "");
    target.search = url.search;

    // Copia headers (limpando os problemáticos)
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers["content-length"];

    const method = (req.method || "GET").toUpperCase();

    // Lê body (quando não for GET/HEAD)
    let body = undefined;
    if (!["GET", "HEAD"].includes(method)) {
      body = await new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
      });
    }

    const upstream = await fetch(target.toString(), {
      method,
      headers,
      body,
      redirect: "manual",
    });

    // Repasse status + headers
    res.status(upstream.status);
    upstream.headers.forEach((v, k) => {
      // evita headers que quebram
      if (k.toLowerCase() === "transfer-encoding") return;
      res.setHeader(k, v);
    });

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
