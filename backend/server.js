require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "orbit",
  user: process.env.DB_USER || "orbituser",
  password: process.env.DB_PASSWORD || "orbit@123"
});

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", database: "disconnected", detail: err.message });
  }
});

app.get("/api/requests", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM support_requests ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch requests", detail: err.message });
  }
});

app.post("/api/requests", async (req, res) => {
  const { customer_name, category, description } = req.body || {};
  if (!customer_name?.trim() || !category?.trim() || !description?.trim()) {
    return res.status(400).json({ error: "Name, category, and description are required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO support_requests (customer_name, category, description) VALUES ($1, $2, $3) RETURNING *",
      [customer_name.trim(), category.trim(), description.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Unable to create request", detail: err.message });
  }
});

app.patch("/api/requests/:id", async (req, res) => {
  const allowed = ["Open", "In Progress", "Resolved"];
  const { status } = req.body || {};
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
  try {
    const result = await pool.query(
      "UPDATE support_requests SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: "Request not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Unable to update request", detail: err.message });
  }
});

app.delete("/api/requests/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM support_requests WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: "Request not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Unable to delete request", detail: err.message });
  }
});

app.listen(port, "0.0.0.0", () => console.log(`API listening on port ${port}`));
