// controllers/musicController.js
import Music from "../models/musicModel.js";

export const uploadMusic = async (req, res) => {
  const { title, url } = req.body;
  try {
    const music = await Music.create({
      title,
      url,
      uploadedBy: req.user._id,
    });
    res.status(201).json(music);
  } catch (error) {
    res.status(400).json({ message: "Music upload failed" });
  }
};

export const getAllMusic = async (req, res) => {
  const music = await Music.find();
  res.json(music);
};
