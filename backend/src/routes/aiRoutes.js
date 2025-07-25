// ✅ This goes in your Express backend
import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/comments-tone-summary", async (req, res) => {
  const { comments } = req.body;

  if (!comments || comments.length === 0) {
    return res.status(400).json({ error: "No comments provided" });
  }

  try {
    const prompt = `You are an expert sentiment analyst.

Analyze the tone of the following user comments and give:
1. Overall tone summary: Positive, Neutral, or Toxic
2. Score-wise breakdown in percentage (e.g., 80% Positive)
3. Tone-wise percentage distribution (Positive, Neutral, Toxic)
4. Provide a final summary line based on the majority sentiment

Here are the comments:\n\n${comments.join("\n")}\n\nProvide output in JSON format like:
{
  "overallTone": "Positive",
  "score": "80%",
  "toneBreakdown": {
    "Positive": "80%",
    "Neutral": "15%",
    "Toxic": "5%"
  },
  "summary": "Most users shared positive feedback overall."
}`;

    const cohereRes = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model: "command",
        prompt,
        max_tokens: 200,
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer 5oxJp70rYDRjlVyKviK4FIRJpnf5dOukW09KApbw`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = cohereRes.data.generations[0].text.trim();
    const parsed = JSON.parse(text); // 🔥 Ensure your model gives clean JSON
    res.json(parsed);
  } catch (err) {
    console.error("Error analyzing tone summary:", err.message);
    res.status(500).json({ error: "AI tone summary failed" });
  }
});

export default router;
