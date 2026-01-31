module.exports = async (req, res) => {
  try {
    const ORIGIN = process.env.CLOUD_RUN_ORIGIN || "https://gringa-backend-xt06g2z0ka-uc.a.run.app";

    // Monta URL do request recebido no Vercel
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const url = new URL(req.url, `${proto}://${host}`);

    // path vem do route: /api/proxy?path=...
    const path = url.searchParams.get("path") || "";
    url.searchParams.delete("path");

    const target = new URL(`${ORIGIN.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`);
    // repassa outros query params (além de path)
    for (const [k, v] of url.searchParams.entries()) target.searchParams.append(k, v);

    // Clona headers com limpeza
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers["content-length"];

    const method = (req.method || "GET").toUpperCase();

    // Lê body em Buffer (resolve incompatibilidade com stream)
    let bodyBuf = null;
    if (!["GET", "HEAD"].includes(method)) {
      bodyBuf = await new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (c) => chunks.push(Buffer.from(c)));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
      });
    }

    const upstream = await fetch(target.toString(), {
      method,
      headers,
      body: bodyBuf && bodyBuf.length ? bodyBuf : undefined,
      redirect: "manual",
    });

    res.statusCode = upstream.status;

    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === "transfer-encoding") return;
      if (k === "content-encoding") return;
      res.setHeader(key, value);
    });

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (e) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: "proxy_failed", message: e?.message || String(e) }));
  }
};
