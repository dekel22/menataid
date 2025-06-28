// /api/get-settings.js
import { MongoClient } from 'mongodb';

const uri      = process.env.MONGODB_URI;
const DB_NAME  = 'myformdb';
const COLL     = 'formdata';

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' });

  const userId = 'dekel testid';          // קבוע לבדיקות
  console.log('🔍 מחפש מסמך עם', { userId });

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const doc = await client
      .db(DB_NAME)
      .collection(COLL)
      .findOne({ userId });

    if (!doc) {
      console.log('❗️לא נמצא userId:', userId);
      return res.status(404).json({ error: 'userId not found' });
    }

    res.status(200).json(doc);
  } catch (err) {
    console.error('Mongo error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}
