import express from "express";
import axios from "axios";

const router = express.Router();
const COHERE_API_KEY = "KwuRYacNfds6QS4AgxWoChRTZ6gY3t4mphFRwQQg"; // Replace this with your real key or use process.env

router.post("/analyze-comment", async (req, res) => {
  const { comment } = req.body;

  try {
    const response = await axios.post(
      "https://api.cohere.ai/v1/classify",
      {
        inputs: [comment],
        examples: [
          { text: "I love your work", label: "Positive" },
          { text: "That's okay, I guess", label: "Neutral" },
          { text: "You're so stupid", label: "Toxic" },
          { text: "Amazing job!", label: "Positive" },
          { text: "I hate you", label: "Toxic" },
          { text: "Could be better", label: "Neutral" },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const prediction = response.data.classifications?.[0]?.prediction;
    res.json({ tone: prediction });
  } catch (error) {
    console.error("Cohere AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze tone" });
  }
});

export default router;
