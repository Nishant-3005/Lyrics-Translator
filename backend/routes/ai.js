// backend/routes/ai.js
import express from 'express';
import Groq from 'groq-sdk';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/generate-lyrics', requireAdmin, async (req, res) => {
  const { song_title, artist_name } = req.body;

  if (!song_title || !artist_name) {
    return res.status(400).json({ error: 'Song title and artist name are required' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a Punjabi music expert. I need the lyrics and English meanings for this song:

Song: "${song_title}"
Artist: "${artist_name}"

Please provide the lyrics in this EXACT JSON format and nothing else:
{
  "found": true,
  "lyrics": [
    {
      "punjabi_text": "ਪੰਜਾਬੀ ਲਾਈਨ ਇੱਥੇ",
      "english_meaning": "English meaning of that line here",
      "line_order": 1
    },
    {
      "punjabi_text": "ਦੂਜੀ ਲਾਈਨ",
      "english_meaning": "English meaning of second line",
      "line_order": 2
    }
  ]
}

If you do not know this song or it does not exist respond with exactly:
{
  "found": false,
  "lyrics": []
}

Important rules:
- Only return JSON no other text before or after
- Include actual Punjabi script Gurmukhi
- Give meaningful English meanings not just word for word translation
- Include main chorus and one verse if song is found
- Maximum 20 lines`
        }
      ]
    });

    const rawText = completion.choices[0].message.content.trim();

    // Extract JSON even if model adds extra text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'AI returned unexpected format. Try again.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return res.status(500).json({ error: 'AI returned unexpected format. Try again.' });
    }

    if (!parsed.found) {
      return res.json({
        found: false,
        message: `Sorry, lyrics for "${song_title}" by ${artist_name} were not found. Please add them manually.`,
        lyrics: []
      });
    }

    res.json({
      found: true,
      message: `Found ${parsed.lyrics.length} lines for "${song_title}"`,
      lyrics: parsed.lyrics
    });

  } catch (err) {
    console.error('Groq error:', err);
    res.status(500).json({ error: 'AI service error: ' + err.message });
  }
});

export default router;