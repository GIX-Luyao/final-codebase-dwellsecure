import * as FileSystem from 'expo-file-system/legacy';

const OPENAI_API_KEY = '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'; // TODO: Replace with your API key or use environment variable

// For production, store API key securely (e.g., in environment variables or secure storage)
// You can also create a config file or use expo-constants for environment variables

export const identifyShutoffFromImage = async (imageUri, question = 'What type of shutoff is this? Help me identify this utility shutoff and provide key information about it.') => {
  try {
    // Read the image file and convert to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that helps residents identify utility shutoffs (fire/gas, power/electrical, and water shutoffs) in their homes. 
            
            When analyzing images, help users identify:
            1. What type of shutoff they're looking at (fire/gas, power/electrical, or water)
            2. Key identifying features
            3. Safety information
            4. How to locate it in their home
            
            IMPORTANT: Respond in plain text only. Do NOT use markdown formatting like *, -, #, or bullet points. Write in clear, simple sentences. Be concise, helpful, and safety-focused.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: question
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to identify shutoff');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to identify the shutoff. Please try again.';
  } catch (error) {
    console.error('Error identifying shutoff:', error);
    throw error;
  }
};

export const askAboutShutoffs = async (question) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that helps residents find and identify utility shutoffs (fire/gas, power/electrical, and water shutoffs) in their homes.
            
            Provide helpful, concise, and safety-focused answers about:
            - How to locate different types of shutoffs (fire/gas, power, water)
            - How to identify shutoffs by appearance
            - Safety information
            - Common locations for shutoffs
            - What to look for
            
            IMPORTANT: Respond in plain text only. Do NOT use markdown formatting like *, -, #, or bullet points. Write in clear, simple sentences. Keep responses clear, practical, and as concise as possible.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to answer your question. Please try again.';
  } catch (error) {
    console.error('Error asking about shutoffs:', error);
    throw error;
  }
};

