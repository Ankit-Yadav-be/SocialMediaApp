import express from "express";
import axios from "axios";

const router = express.Router();
const COHERE_API_KEY = "KwuRYacNfds6QS4AgxWoChRTZ6gY3t4mphFRwQQg"; // use from .env ideally

router.post("/analyze-comment", async (req, res) => {
  const { comment } = req.body;

  try {
    const response = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        prompt: `Analyze the tone of this comment: "${comment}". Reply only with one of the following: Positive, Neutral, or Toxic.`,
        max_tokens: 10,
        temperature: 0.3,
        stop_sequences: ["\n"],
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.generations?.[0]?.text?.trim();
    res.json({ tone: text });
  } catch (error) {
    console.error("Cohere AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze tone" });
  }
});

export default router;
