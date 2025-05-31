// api/test.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("myformdb");
    const collection = db.collection("formdata");
    await collection.insertOne({ name: "test", time: new Date() });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    await client.close();
  }
}
