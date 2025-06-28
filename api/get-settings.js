// pages/api/get-settings.js
import { MongoClient } from 'mongodb';

const uri  = process.env.MONGODB_URI;
const DB   = 'myformdb';
const COLL = 'formdata';

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' });

  const userId = 'dekel testid';              // קבוע לבדיקות
  console.log('🔍 מחפש מסמך עם _id =', userId);

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const doc = await client
      .db(DB)
      .collection(COLL)
      .findOne({ _id: userId });               // חיפוש לפי _id

    if (!doc) {
      console.log('❗️לא נמצא _id:', userId);
      return res.status(404).json({ error: '_id not found' });
    }

    res.status(200).json(doc);
  } catch (err) {
    console.error('Mongo error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}
