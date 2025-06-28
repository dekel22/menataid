// pages/api/save-settings.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;          // ודא קיים ב-env

export default async function handler(req, res) {
  // מקבלים רק POST
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  // נתונים מה-Client
  const { userId, name, age, style, progress } = req.body ?? {};
  if (!userId || !name || age == null)
    return res.status(400).json({ error: 'Missing required fields' });

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const collection = client.db('myformdb').collection('formdata');

    await collection.updateOne(
      { _id: userId },
      {
        $set:        { name, age, style, progress, updatedAt: new Date() },
        $setOnInsert:{ createdAt: new Date() }
      },
      { upsert: true }
    );

    console.log('🗄️  Saved settings for', userId);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('💥 MongoDB error:', err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  } finally {
    await client.close();
  }
}
