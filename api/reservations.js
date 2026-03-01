// api/reservations.js
const JSONBIN_BASE = 'https://api.jsonbin.io/v3';
const API_KEY = process.env.JSONBIN_API_KEY;
const BIN_ID = process.env.BIN_ID; // 固定のBin ID（1つだけ使う）

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!API_KEY || !BIN_ID) {
    return res.status(500).json({ error: 'サーバーの設定が不完全です' });
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Master-Key': API_KEY,
  };

  try {
    // GET → 全データ取得
    if (req.method === 'GET') {
      const r = await fetch(`${JSONBIN_BASE}/b/${BIN_ID}/latest`, { headers });
      const d = await r.json();
      if (!r.ok) return res.status(r.status).json(d);
      return res.status(200).json(d.record);
    }

    // PUT → 全データ保存
    if (req.method === 'PUT') {
      const body = req.body;
      const r = await fetch(`${JSONBIN_BASE}/b/${BIN_ID}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) return res.status(r.status).json(d);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
