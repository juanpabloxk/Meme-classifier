import fs from 'fs/promises';
import path from 'path';

// Robust prompt designed specifically to guide small parameter vision models
const SYSTEM_PROMPT = `You are a strict, highly accurate local file-renaming tool.
Your job is to look at an image (a meme) and generate ONE SINGLE concise filename string.

RULES:
1. ONLY OUTPUT THE FILENAME. Do not include extensions (.jpg, .png).
2. NO conversational text like "Here is the name", "Sure", or "I think it should be...".
3. Use lowercase letters, numbers, and underscores instead of spaces. E.g., "drake_hotline_bling".
4. The main emotion in the overall meme or main character of the picture is relevant, so it should be part of the name when possible (at the beginning).
5. If the meme contains a famous TV series, character, actor, actress, politician, etc., it should be part of the name too (at the beginning).
6. If there is text in the meme, use the text to create the name (shortened if necessary). The filename should be in the same language as the text in the image.
7. If the image is not a meme, try to use a simple description of the image.
8. If the image is entirely unclassifiable or just a blank image, output EXACTLY: "UNCLASSIFIABLE_IMAGE" (all uppercase).
9. Maximum length is 150 characters.

EXAMPLES:
User: [Image of dog sitting in fine dining room saying "This is fine" while room burns]
Assistant: this_is_fine_dog

User: [Image of distracted boyfriend looking at another girl]
Assistant: distracted_boyfriend

User: [A normal picture of a wall with no text or joke]
Assistant: UNCLASSIFIABLE_IMAGE`;

async function convertImageToBase64(imagePath) {
  const fileBuffer = await fs.readFile(imagePath);
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
}

/**
 * Handles communication with Ollama using the /api/generate endpoint
 */
async function callOllama(base64Image, settings) {
  // Extract just the base64 part
  const [prefix, base64Data] = base64Image.split(',');

  const body = {
    model: settings.modelName,
    system: SYSTEM_PROMPT,
    prompt: "What is an appropriate filename for this meme?",
    images: [base64Data],
    stream: false,
    think: settings.enableThinking,
    options: {
      num_predict: 4096,
      temperature: 0.2
    }
  };

  let baseUrl = settings.baseUrl.replace(/\/$/, '');
  baseUrl = baseUrl.replace(/\/v1\/chat\/completions$/, '')
                   .replace(/\/chat\/completions$/, '')
                   .replace(/\/v1$/, '')
                   .replace(/\/api\/generate$/, '');

  const endpoint = `${baseUrl}/api/generate`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Ollama API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Full Ollama API Response:", JSON.stringify(data, null, 2));
  return data.response?.trim() || "UNCLASSIFIABLE_IMAGE";
}

/**
 * Handles communication with OpenAI-compatible APIs (OpenAI, LMStudio)
 */
async function callOpenAICompatible(base64Image, settings) {
  const body = {
    model: settings.modelName,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: [
          { type: "text", text: "What is an appropriate filename for this meme?" },
          {
            type: "image_url",
            image_url: {
              url: base64Image,
              detail: "low" // Keep it low resolution for small local models to process faster
            }
          }
        ]
      }
    ],
    // max_tokens: settings.enableThinking ? 4000 : 150, // Give reasoning models plenty of tokens to "think" before outputting the final content
    max_tokens: 4096,
    temperature: 0.2, // Low temp for more deterministic output,
    thinking: settings.enableThinking
  };

  const headers = { 'Content-Type': 'application/json' };
  if (settings.apiKey) {
    headers['Authorization'] = `Bearer ${settings.apiKey}`;
  }

  const endpoint = settings.baseUrl.endsWith('/chat/completions') 
    ? settings.baseUrl 
    : `${settings.baseUrl.replace(/\/$/, '')}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Full API Response:", JSON.stringify(data, null, 2));
  console.log("AI message object:", JSON.stringify(data.choices?.[0]?.message, null, 2));
  return data.choices?.[0]?.message?.content?.trim() || "UNCLASSIFIABLE_IMAGE";
}

/**
 * Handles communication with Anthropic API
 */
async function callAnthropic(base64Image, settings) {
  // Extract just the base64 part and mime type
  const [prefix, base64Data] = base64Image.split(',');
  const mimeType = prefix.match(/:(.*?);/)[1];

  const body = {
    model: settings.modelName || 'claude-3-haiku-20240307',
    max_tokens: 30,
    temperature: 0.1,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: base64Data
            }
          },
          { type: "text", text: "What is an appropriate filename for this meme?" }
        ]
      }
    ]
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Anthropic API Error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.content?.[0]?.text?.trim() || "UNCLASSIFIABLE_IMAGE";
}

/**
 * Handles communication with Google Gemini API
 */
async function callGemini(base64Image, settings) {
  // Extract just the base64 part and mime type
  const [prefix, base64Data] = base64Image.split(',');
  const mimeType = prefix.match(/:(.*?);/)[1];

  const body = {
    system_instruction: {
      parts: [
        { text: SYSTEM_PROMPT }
      ]
    },
    contents: [
      {
        parts: [
          { text: "What is an appropriate filename for this meme?" },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      maxOutputTokens: 30,
      temperature: 0.1,
    }
  };

  const endpoint = `${settings.baseUrl.replace(/\/$/, '')}/models/${settings.modelName}:generateContent?key=${settings.apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "UNCLASSIFIABLE_IMAGE";
}

export async function classifyImage(imagePath, settings) {
  try {
    const base64Image = await convertImageToBase64(imagePath);
    
    let rawResult = "";
    
    if (settings.provider === 'claude') {
      rawResult = await callAnthropic(base64Image, settings);
    } else if (settings.provider === 'google') {
      rawResult = await callGemini(base64Image, settings);
    } else if (settings.provider === 'ollama') {
      rawResult = await callOllama(base64Image, settings);
    } else {
      // General path for OpenAI, LMStudio
      rawResult = await callOpenAICompatible(base64Image, settings);
    }

    // Clean up the output in case small models leaked conversation text
    let cleanName = rawResult.toLowerCase();

    // Strip common Markdown like ```text, **name**, or "name"
    cleanName = cleanName.replace(/["*`]|\b(?:here is|the filename|name is)\b/gi, '').trim();
    cleanName = cleanName.replace(/\.(jpg|jpeg|png)$/i, '');

    // Replace non-alphanumeric with underscores and trim multiple underscores
    cleanName = cleanName.replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    return cleanName || "unnamed_meme";
  } catch (error) {
    console.error("Classification failed:", error.message || error);
    throw error;
  }
}
