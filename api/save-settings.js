// pages/api/save-settings.js
import { clientPromise } from '@/lib/mongodb';

export default async function handler(req, res) {
  console.log('➡️ [/api/save-settings] %s', req.method);

  // מקבלים רק POST
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  // ---- נתונים שמגיעים מה-Client ----
  const { userId, name, age, style, progress } = req.body ?? {};

  // בדיקת שדות חובה
  if (!userId || !name || age == null)
    return res.status(400).json({ error: 'Missing required fields' });

  try {
    const client      = await clientPromise;                 // singleton
    const collection  = client.db('myformdb').collection('formdata');

    await collection.updateOne(
      { _id: userId },
      {
        $set:        { name, age, style, progress, updatedAt: new Date() },
        $setOnInsert:{ createdAt: new Date() }
      },
      { upsert: true }
    );

    console.log('🗄️  Saved for user', userId);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('💥 Mongo error:', err);
    return res.status(500).json({ error: 'DB failure' });
  }
}
