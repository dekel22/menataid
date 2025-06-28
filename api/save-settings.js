// pages/api/save-settings.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;     // ודא קיים ב-env
const DB  = 'myformdb';
const CL  = 'formdata';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { userId, name, age, style, progress } = req.body ?? {};
  if (!userId || !name || age == null)
    return res.status(400).json({ error: 'Missing required fields' });

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const collection = client.db(DB).collection(CL);

    // upsert לפי _id=userId
    const result = await collection.updateOne(
      { _id: userId },
      {
        $set:        { name, age, style, progress, updatedAt: new Date() },
        $setOnInsert:{ createdAt: new Date() }
      },
      { upsert: true }
    );

    // ---- בדיקת הצלחה והחזרת מידע ----
    const savedDoc = await collection.findOne({ _id: userId }, { projection: { _id: 1 } });
    console.log('✅ upsert result:', result);
    console.log('📦 saved doc   :', savedDoc);       // מציג את ה-_id שנשמר

    if (!savedDoc) throw new Error('Document not found after upsert');

    return res.status(200).json({ success: true, _id: savedDoc._id });
  } catch (err) {
    console.error('💥 MongoDB error:', err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  } finally {
    await client.close();
  }
}
