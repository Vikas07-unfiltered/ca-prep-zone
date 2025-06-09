// Minimal Express server for generating Agora RTC tokens
const express = require('express');
const cors = require('cors');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

// TODO: Replace these with your actual Agora App ID and Certificate
const AGORA_APP_ID = 'd997a2560ca7443fa3d656cd679e9d5d';
const AGORA_APP_CERTIFICATE = '9ebfb12476c44458822cd426c5701b54';

const app = express();
app.use(cors());

// Endpoint to generate RTC token
app.get('/rtc-token', (req, res) => {
  const channelName = req.query.channel;
  const uid = req.query.uid || 0;
  if (!channelName) {
    return res.status(400).json({ error: 'channel is required' });
  }

  const role = RtcRole.PUBLISHER;
  const expireTime = 3600; // 1 hour
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    parseInt(uid, 10),
    role,
    privilegeExpireTime
  );

  res.json({ token });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Agora Token Server listening on port ${PORT}`);
});
