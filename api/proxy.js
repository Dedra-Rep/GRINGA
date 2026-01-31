export default async function handler(req, res) {
  try {
    const base = "https://gringa-backend-65941755023.us-central1.run.app";
    const url = new URL(req.url || "", "http://local");
    const target = new URL(base + url.pathname + url.search);

    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers["content-length"];

    const method = (req.method || "GET").toUpperCase();

    // lê body de forma segura (Node runtime)
    let body;
    if (!["GET", "HEAD"].includes(method)) {
      body = await new Promise((resolve) => {
        let data = "";
        req.on("data", (c) => (data += c));
        req.on("end", () => resolve(data || undefined));
      });
    }

    const r = await fetch(target, { method, headers, body });
    const text = await r.text();

    // repassa status + content-type
    res.status(r.status);
    res.setHeader("content-type", r.headers.get("content-type") || "text/plain; charset=utf-8");
    res.send(text);
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
