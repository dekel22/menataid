export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, userText } = req.body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: userText }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    res.status(200).json({ text: data.choices?.[0]?.message?.content || 'אין תגובה' });
  } catch (error) {
    console.error('API ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
}
