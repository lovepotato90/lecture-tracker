const { Redis } = require("@upstash/redis");
const crypto = require("crypto");
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});
function merge(a, b) {
  const o = Object.assign({}, a);
  for (const k in b) { const v = b[k]; if (v && typeof v.t === "number" && (!o[k] || v.t > o[k].t)) o[k] = v; }
  return o;
}
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const code = String(req.headers["x-sync-code"] || "");
  if (!/^[A-Za-z0-9_-]{24,64}$/.test(code)) return res.status(400).json({ error: "bad code" });
  const key = "lt:" + crypto.createHash("sha256").update(code).digest("hex");
  try {
    let cur = (await redis.get(key)) || {};
    if (typeof cur === "string") cur = JSON.parse(cur);
    if (req.method === "PUT" || req.method === "POST") {
      const inc = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      cur = merge(cur, inc);
      if (JSON.stringify(cur).length > 900000) return res.status(413).json({ error: "too large" });
      await redis.set(key, cur);
    }
    return res.status(200).json(cur);
  } catch (e) { return res.status(500).json({ error: "server" }); }
};
