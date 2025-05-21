export default async function handler(req, res) {
  const { prompt } = req.body;

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await openaiResponse.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "שגיאה בשרת", details: err });
  }
}
