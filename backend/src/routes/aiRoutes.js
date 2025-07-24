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
    const prompt = `You are a sentiment analysis expert. Analyze the overall tone of the following user comments. Consider whether the tone is generally Positive (e.g., supportive, kind, happy), Neutral (e.g., factual, non-emotional), or Toxic (e.g., hateful, offensive, aggressive).

Comments:
${comments.join("\n")}

Provide only one of the following as the summary result: "Positive", "Neutral", or "Toxic".
If the tone is mixed, summarize based on the most dominant tone.

Overall Tone:`;

    const cohereRes = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model: "command",
        prompt,
        max_tokens: 20,
        temperature: 0.3, // lower temp = more focused
      },
      {
        headers: {
          Authorization: `Bearer KwuRYacNfds6QS4AgxWoChRTZ6gY3t4mphFRwQQg`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = cohereRes.data.generations[0].text.trim();
    res.json({ summary: result });
  } catch (err) {
    console.error("Error analyzing tone summary:", err.message);
    res.status(500).json({ error: "AI tone summary failed" });
  }
});

export default router;
