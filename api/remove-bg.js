export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'REMOVE_BG_API_KEY not configured' });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // image is base64 data URL, extract the raw base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        image_file_b64: base64Data,
        size: 'auto',
        format: 'png',
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err.errors?.[0]?.title || `Remove.bg API error: ${response.status}`;
      return res.status(response.status).json({ error: msg });
    }

    const data = await response.json();
    return res.status(200).json({ result: `data:image/png;base64,${data.data.result_b64}` });
  } catch (err) {
    console.error('Remove BG error:', err);
    return res.status(500).json({ error: err.message });
  }
}
