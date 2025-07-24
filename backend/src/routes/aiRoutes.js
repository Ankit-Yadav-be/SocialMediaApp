// ✅ This goes in your Express backend
import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/comments-tone-summary", async (req, res) => {
  const { comments } = req.body; // Array of comment texts

  if (!comments || comments.length === 0) {
    return res.status(400).json({ error: "No comments provided" });
  }

  try {
    const prompt = `Analyze the overall tone of these comments and summarize as Positive, Neutral, or Toxic:\n\n${comments.join(
      "\n"
    )}\n\nSummary:`;

    const cohereRes = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model: "command",
        prompt,
        max_tokens: 20,
        temperature: 0.5,
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
