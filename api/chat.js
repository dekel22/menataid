// /pages/api/chat.js  (או /api/chat במבנה שלך)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    /** ---------------------------------------------------
     *  קבלת הנתונים מה-client
     *  --------------------------------------------------*/
    const { messages, prompt, userText } = req.body;

    // אם הקליינט כבר שלח מערך messages – משתמשים בו כמו שהוא.
    // אחרת מרכיבים אותו מ-prompt + userText (לכיסוי הקריאות הישנות).
    const openaiMessages = messages ?? [
      { role: 'system', content: prompt || '' },
      { role: 'user',   content: userText || '' }
    ];

    /** ---------------------------------------------------
     *  קריאה ל-OpenAI
     *  --------------------------------------------------*/
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',          // שנה למודל הזמין לך אם צריך
        messages: openaiMessages, // כאן משתמשים במערך המאוחד
        temperature: 0.7
      })
    });

    const data = await response.json();

    // אם OpenAI מחזיר שגיאה – מעבירים אותה לקליינט:
    if (data.error) {
      console.error('OPENAI ERROR:', data.error);
      return res.status(500).json({ error: data.error.message });
    }

    res.status(200).json({
      text: data.choices?.[0]?.message?.content || 'אין תגובה'
    });

  } catch (err) {
    console.error('SERVER ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
}
