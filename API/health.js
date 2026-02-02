export default function handler(req, res) {
  return res.status(200).json({
    status: "ok",
    service: "Mordomo API",
    hint: "Use POST em /api/chat com JSON { message: \"...\" }"
  });
}
