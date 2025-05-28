const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/create-daily-room', async (req, res) => {
  const { roomName } = req.body;
  const DAILY_API_KEY = process.env.NEXT_PUBLIC_DAILY_API_KEY;
  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DAILY_API_KEY}`,
    },
    body: JSON.stringify({
      name: roomName,
      properties: {
        enable_chat: true,
        enable_screenshare: false,
        start_audio_off: false,
        start_video_off: true,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
      }
    }),
  });
  if (!response.ok) {
    const error = await response.text();
    return res.status(500).json({ error });
  }
  const data = await response.json();
  res.status(200).json({ url: data.url });
});

app.listen(3001, () => {
  console.log('API server running on http://localhost:3001');
});