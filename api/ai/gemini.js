/**
 * Serverless Secure AI Proxy for UniWorkload AI
 * Keeps GEMINI_API_KEY secure on the server side (Vercel Serverless Function)
 * Protects against exposing Google AI API keys in client-side bundles.
 */

export default async function handler(req, res) {
  // Set CORS and Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is accepted.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in server environment variables.',
        fallback: true
      });
    }

    const { messages, temperature = 0.2, maxTokens = 2000, model = 'gemini-2.5-flash' } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing "messages" array.' });
    }

    // Prepare Google Generative Language API payload
    const systemMsg = messages.find(m => m.role === 'system')?.content || '';
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content || '') }]
      }));

    const requestBody = {
      contents,
      generationConfig: {
        temperature: Number(temperature) || 0.2,
        maxOutputTokens: Number(maxTokens) || 2000
      }
    };

    if (systemMsg) {
      requestBody.systemInstruction = { parts: [{ text: systemMsg }] };
    }

    // Try primary and fallback models (Cascading gracefully from newest to stable)
    const modelsToTry = Array.from(new Set([
      model,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ])).filter(Boolean);

    let lastError = null;

    for (const m of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const apiRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (apiRes.ok) {
          const data = await apiRes.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          return res.status(200).json({
            success: true,
            model: m,
            content
          });
        } else {
          const errText = await apiRes.text();
          lastError = new Error(`Google API error (${m}): ${apiRes.status} ${errText}`);
        }
      } catch (err) {
        lastError = err;
      }
    }

    return res.status(502).json({
      error: 'Google Gemini API request failed',
      details: lastError ? lastError.message : 'Unknown upstream error'
    });
  } catch (err) {
    console.error('[API/AI/GEMINI] Internal Exception:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
