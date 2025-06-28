import { MongoClient } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]'; // נתיב לעץ שלך

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useUnifiedTopology: true });

export default async function handler(req, res) {
  // קבל רק POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  //  1. שלוף את ה-session של NextAuth
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  //  2. קח מזהה ייחודי מה-Google profile
  //    ברוב הקונפיגים זה user.id או user.email; ודא בקונסול שלך.
  const userKey = session.user.id || session.user.email;
  if (!userKey) {
    return res.status(400).json({ error: 'Missing Google user id/email in session' });
  }

  //  3. נתוני הטופס
  const { name, age, style, progress } = req.body || {};
  if (!name || age == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await client.connect();
    const db = client.db('myformdb');
    const collection = db.collection('formdata');

    //  4. Upsert לפי _id = userKey
    const result = await collection.updateOne(
      { _id: userKey },                             // מזהה ייחודי
      {
        $set: {
          name, age, style, progress,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }     // רק בהכנסה ראשונית
      },
      { upsert: true }
    );

    res.status(200).json({ success: true, upserted: result.upsertedId || false });
  } catch (err) {
    console.error('MongoDB error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}
