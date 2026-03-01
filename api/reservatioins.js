// api/reservations.js
// Vercel のサーバーレス関数 — APIキーはここでのみ使用
// ブラウザからは見えない

const JSONBIN_BASE = 'https://api.jsonbin.io/v3';
const API_KEY = process.env.JSONBIN_API_KEY; // 環境変数から読む（外部には非公開）

export default async function handler(req, res) {
  // CORS（同一サイトからのアクセスのみ許可）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!API_KEY) {
    return res.status(500).json({ error: 'APIキーが設定されていません' });
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Master-Key': API_KEY,
  };

  try {
    // POST /api/reservations → 新しいBinを作成
    if (req.method === 'POST') {
      const { groupCode } = req.body;
      const response = await fetch(`${JSONBIN_BASE}/b`, {
        method: 'POST',
        headers: {
          ...headers,
          'X-Bin-Name': `mikami-${groupCode}`,
          'X-Bin-Private': 'false',
        },
        body: JSON.stringify({ reservations: [], groupCode }),
      });
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(200).json({ binId: data.metadata.id });
    }

    // GET /api/reservations?binId=xxx → 予約一覧取得
    if (req.method === 'GET') {
      const { binId } = req.query;
      if (!binId) return res.status(400).json({ error: 'binId が必要です' });
      const response = await fetch(`${JSONBIN_BASE}/b/${binId}/latest`, { headers });
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(200).json({ reservations: data.record.reservations || [] });
    }

    // PUT /api/reservations?binId=xxx → 予約を更新
    if (req.method === 'PUT') {
      const { binId } = req.query;
      if (!binId) return res.status(400).json({ error: 'binId が必要です' });
      const { reservations, groupCode } = req.body;
      const response = await fetch(`${JSONBIN_BASE}/b/${binId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ reservations, groupCode }),
      });
      const data = await response.json();
      if (!response.ok) return res.status(response.status).json(data);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
