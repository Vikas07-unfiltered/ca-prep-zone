// Vercel/Next.js API Route: /api/create-daily-room
// This must be deployed on Vercel or another Node.js backend
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
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
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 1 week expiry
      }
    }),
  });
  if (!response.ok) {
    const error = await response.text();
    return res.status(500).json({ error });
  }
  const data = await response.json();
  res.status(200).json({ url: data.url });
}
