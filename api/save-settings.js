// pages/api/save-settings.js
import { clientPromise } from 'mongotest';   // ← נתיב יחסי, בלי alias

export default async function handler(req, res) {
  console.log('➡️ [/api/save-settings]', req.method);

  // 1) מקבלים רק POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2) שליפת הנתונים מה-Client
  const { userId, name, age, style, progress } = req.body ?? {};

  if (!userId || !name || age == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 3) Upsert ב-Mongo
  try {
    const client      = await clientPromise;                // connection singleton
    const collection  = client.db('myformdb').collection('formdata');

    await collection.updateOne(
      { _id: userId },
      {
        $set:        { name, age, style, progress, updatedAt: new Date() },
        $setOnInsert:{ createdAt: new Date() }
      },
      { upsert: true }
    );

    console.log('🗄️ Saved settings for', userId);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('💥 Mongo error:', err);
    return res.status(500).json({ error: 'DB failure' });
  }
}
