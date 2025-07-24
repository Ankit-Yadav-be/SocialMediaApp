import express from "express";
import axios from "axios";

const router = express.Router();
const GEMINI_API_KEY = "AIzaSyBwoorPsyidngqtUBmRA9QMv0dAkIwCces"; // 🔐 Replace with ENV later

router.post("/analyze-comment", async (req, res) => {
  const { comment } = req.body;

  try {
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Analyze the tone of this comment: "${comment}". Reply only with one of the following: Positive, Neutral, or Toxic.`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const tone = geminiResponse.data.candidates[0].content.parts[0].text.trim();
    res.json({ tone });
  } catch (error) {
    console.error("Gemini AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze tone" });
  }
});

export default router;
