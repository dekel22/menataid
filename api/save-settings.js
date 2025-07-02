// pages/api/save-settings.js
import { MongoClient } from 'mongodb';

/**
 * POST /api/save-settings
 *   body: {
 *     userId: "<user's email>",   // מגיע מה‑sessionStorage בצד‑הקליינט
 *     name:   "string",           // חובה
 *     age:    number,              // חובה
 *     style:  "string",           // אופציונלי
 *     progress: { [lessonId]:bool }
 *   }
 *
 * תשובה:
 *   200 → { success:true, _id:<email> }
 *   400 → { error:'Missing required fields' }
 *   405 → Method Not Allowed
 *   500 → שגיאת שרת / Mongo
 */

const uri = process.env.MONGODB_URI;     // ודא משתנה‑סביבה מוגדר
const DB  = 'myformdb';
const CL  = 'formdata';

export default async function handler(req, res) {
  /* -------- 1. מתירים רק POST -------- */
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  /* -------- 2. אימות שדות חיוניים -------- */
  const { userId, name, age, style, progress } = req.body ?? {};
  if (!userId || !name || age == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  /* -------- 3. חיבור ל‑Mongo -------- */
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const collection = client.db(DB).collection(CL);

    /* --- upsert לפי _id=userId (המייל) --- */
    const result = await collection.updateOne(
      { _id: userId },
      {
        $set:        { name, age, style, progress, updatedAt: new Date() },
        $setOnInsert:{ createdAt: new Date() }
      },
      { upsert: true }
    );

    console.log('✅ upsert result:', result);

    /* --- החזרת תשובה --- */
    return res.status(200).json({ success: true, _id: userId });
  } catch (err) {
    console.error('💥 MongoDB error:', err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  } finally {
    await client.close();
  }
}
