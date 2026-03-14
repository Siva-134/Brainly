const fs = require('fs');
const https = require('https');
const envFile = fs.readFileSync('.env', 'utf8');
const keyMatch = envFile.match(/GEMINI_API_KEY=(.+)/);
const key = keyMatch ? keyMatch[1].trim().replace(/\"/g, '') : '';

const options = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};
const req = https.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});
req.on('error', (e) => {
  console.error(e);
});
req.write(JSON.stringify({
  contents: [{ parts: [{ text: 'Hello?' }] }]
}));
req.end();
