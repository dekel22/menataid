// pages/api/get-settings.js
import { MongoClient } from 'mongodb';

/**
 * GET /api/get-settings?userId=<email>
 *   ↳ מחזיר את מסמך ההגדרות של המשתמש שאצור כ-_id == כתובת‑המייל.
 *     200  → JSON עם כל השדות (progress, name, age ...)
 *     404  → { error: '_id not found' }
 *     400  → { error: 'Missing userId' }
 *     405  → Method Not Allowed (אם הבקשה אינה GET)
 *     500  → שגיאת שרת (Mongo, וכו')
 */

const uri  = process.env.MONGODB_URI;
const DB   = 'myformdb';
const COLL = 'formdata';

export default async function handler(req, res) {
  /* -------- 1. מתירים רק GET -------- */
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  /* -------- 2. אימות פרמטר userId -------- */
  const userId = req.query.userId;
  if (!userId) {
    // אין userId בבקשה → מחזירים 400
    return res.status(400).json({ error: 'Missing userId' });
  }

  console.log('🔍 מחפש מסמך עם _id =', userId);

  /* -------- 3. שאילתה ל‑MongoDB -------- */
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const doc = await client
      .db(DB)
      .collection(COLL)
      .findOne({ _id: userId });   // החיפוש לפי _id = כתובת‑המייל

    if (!doc) {
      console.log('❗️לא נמצא _id:', userId);
      return res.status(404).json({ error: '_id not found' });
    }
    sessionStorage.setItem('name', new URLSearchParams(location.search).get('name'));
    return res.status(200).json(doc);
  } catch (err) {
    console.error('Mongo error:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}
