// pages/api/save-settings.js
import { getServerSession } from 'next-auth/next';
import { authOptions }       from '@/pages/api/auth/[...nextauth]';
import { clientPromise }     from '@/lib/mongodb';

export default async function handler(req, res) {
  console.log('➡️ [/api/save-settings] %s', req.method);

  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  let session;
  try {
    session = await getServerSession(req, res, authOptions);
  } catch (e) {
    console.error('🔒 Session fetch failed:', e);
    return res.status(500).json({ error: 'Auth failure' });
  }
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const userId = session.user.id || session.user.email;
  const { name, age, style, progress } = req.body ?? {};
  if (!name || age == null)
    return res.status(400).json({ error: 'Missing required fields' });

  try {
    const client      = await clientPromise;
    const collection  = client.db('myformdb').collection('formdata');

    const result = await collection.updateOne(
      { _id: userId },
      { $set: { name, age, style, progress, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    console.log('🗄️ Mongo:', result.matchedCount ? 'updated' : 'inserted');
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('💥 Mongo error:', err);
    return res.status(500).json({ error: 'DB failure' });
  }
}
