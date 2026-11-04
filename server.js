
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.get("/", (req, res) => {
  res.json({
    status: "AI Cartoon Backend is running",
    provider: "Gemini Omni Flash"
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { story, language, voice, animation, image } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key missing"
      });
    }

    if (!story || !image) {
      return res.status(400).json({
        error: "Photo and story required"
      });
    }

    const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

    if (!match) {
      return res.status(400).json({
        error: "Invalid image format"
      });
    }

    const mimeType = match[1];
    const imageData = match[2];

    const prompt = `
Animate this cartoon image.
Animation: ${animation || "Talking"}.
Story: ${story}
Language: ${language || "Hindi"}.
Voice style: ${voice || "Storyteller"}.
Create a colorful family-friendly 3D cartoon video.
Make the character move naturally and express emotions.
Use portrait 9:16 video format.
`;

    const apiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          model: "gemini-omni-1.1-flash",
          input: [
            {
              type: "image",
              data: imageData,
              mime_type: mimeType
            },
            {
              type: "text",
              text: prompt
            }
          ],
          generation_config: {
            video_config: {
              task: "image_to_video"
            }
          },
          response_format: {
            type: "video",
            aspect_ratio: "9:16"
          }
        })
      }
    );

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Gemini error:", result);
      return res.status(apiResponse.status).json({
        error: result.error?.message || "Video provider error"
      });
    }

    const video = result.steps
      ?.flatMap(step => step.content || [])
      .find(item => item.type === "video" && item.data);

    if (!video) {
      return res.status(502).json({
        error: "Video was not returned by the AI provider"
      });
    }

    const videoBuffer = Buffer.from(video.data, "base64");

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="cartoon-story.mp4"'
    );

    return res.send(videoBuffer);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AI Cartoon Backend running on port " + PORT);
});
