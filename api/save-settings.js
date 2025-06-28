// pages/api/save-settings.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { clientPromise } from '@/lib/mongodb';

export default async function handler(req, res) {
  console.log('➡️  [/api/save-settings] New request:', req.method);

  // 1) קבל רק POST
  if (req.method !== 'POST') {
    console.warn('⚠️  Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2) Session
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    console.warn('🔒  No session – returning 401');
    return res.status(401).json({ error: 'Not authenticated' });
  }
  console.log('✅  Session found for:', session.user.email);

  // 3) User key
  const userId = session.user.id || session.user.email;
  if (!userId) {
    console.error('❌  Session missing user id/email:', session);
    return res.status(400).json({ error: 'Missing user id' });
  }

  // 4) Body validation
  const { name, age, style, progress } = req.body || {};
  if (!name || age == null) {
    console.warn('⚠️  Bad payload:', req.body);
    return res.status(400).json({ error: 'Missing required fields' });
  }
  console.log('📦  Payload OK');

  // 5) DB upsert
  try {
    const client = await clientPromise;                 // singleton
    const collection = client.db('myformdb').collection('formdata');

    const result = await collection.updateOne(
      { _id: userId },
      {
        $set: { name, age, style, progress, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    console.log(
      '🗄️  Mongo result:',
      result.matchedCount
        ? `updated existing doc for ${userId}`
        : `inserted new doc _id=${result.upsertedId?._id}`
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('💥  MongoDB error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
