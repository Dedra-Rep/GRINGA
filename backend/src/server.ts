import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "gringa-backend" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "gringa-backend" });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Backend rodando na porta ${port}`);
});
