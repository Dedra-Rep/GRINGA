module.exports = async (req, res) => {
  try {
    const ORIGIN = process.env.CLOUD_RUN_ORIGIN || "https://gringa-backend-xt06g2z0ka-uc.a.run.app";

    // pega o path que veio do route: ?path=...
    const path = (req.query && req.query.path) ? String(req.query.path) : "";
    const qsIndex = req.url.indexOf("&"); // porque a query começa com ?path=...
    const extraQs = qsIndex >= 0 ? req.url.substring(qsIndex) : ""; // mantém outros params

    const target = `${ORIGIN}/${path}${extraQs ? extraQs.replace("&", "?") : ""}`;

    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers["content-length"];

    const method = (req.method || "GET").toUpperCase();
    const hasBody = !["GET", "HEAD"].includes(method);

    const upstream = await fetch(target, {
      method,
      headers,
      redirect: "manual",
      body: hasBody ? req : undefined,
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
