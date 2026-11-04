import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.json({
    status: "AI Cartoon Backend is running",
    message: "Backend ready"
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { story, language, voice, image } = req.body;

    if (!story || !image) {
      return res.status(400).json({
        error: "Story and image are required"
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is not configured"
      });
    }

    return res.status(501).json({
      status: "Backend connected",
      message: "Video generation provider is not configured yet.",
      story,
      language,
      voice
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
