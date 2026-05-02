import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

admin.initializeApp();

const projectId = 'peak-bit-486121-n6';
const location = 'us-central1';
const model = 'gemini-2.5-flash-lite';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: any;
}

interface ChatRequest {
  messages: ChatMessage[];
  userId?: string;
}

interface ChatResponse {
  message: string;
  extractedData?: any;
}

export const chat = onRequest(
  {
    region: 'us-central1',
    cors: true,
    maxInstances: 10,
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (req, res) => {
  // CORS is handled automatically by the cors: true option
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Verify Firebase Auth token (optional for now)
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        await admin.auth().verifyIdToken(token);
        // Token is valid - could use for additional security checks
      } catch (error) {
        console.warn('Token verification failed:', error);
        // Continue without auth for now - can make this required later
      }
    }

    const { messages, userId }: ChatRequest = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    // Initialize Vertex AI
    const vertexAI = new VertexAI({ project: projectId, location });
    const generativeModel = vertexAI.getGenerativeModel({
      model,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.8,
      },
    });

    // Build conversation history for Gemini
    const conversationHistory = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // System prompt for legal case intake
    const systemPrompt = `You are a helpful AI assistant for a legal case intake system. Your job is to:
1. Ask clarifying questions about the user's legal incident
2. Gather key information: what happened, when, where, who was involved, damages/injuries
3. Be empathetic and professional
4. Extract structured data from the conversation

When you have enough information, extract it in this JSON format at the end of your response:
EXTRACTED_DATA: {
  "incident_description": "brief summary",
  "incident_date": "YYYY-MM-DD or null",
  "city": "city name or null",
  "state": "state code or null",
  "damages": {
    "medical_expenses": number or null,
    "lost_wages": number or null
  },
  "parties": [
    { "role": "defendant", "name": "party name" }
  ]
}

Only include EXTRACTED_DATA when you have concrete information to extract.`;

    // Add system prompt to the beginning
    const chat = generativeModel.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I will help gather legal case information professionally and extract structured data when available.' }],
        },
        ...conversationHistory.slice(0, -1), // All messages except the last user message
      ],
    });

    // Send the latest user message
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const aiMessage = response.candidates?.[0]?.content?.parts?.[0]?.text || 
                      "I'm sorry, I couldn't process that. Could you rephrase?";

    // Try to extract structured data from the response
    let extractedData = null;
    const extractedMatch = aiMessage.match(/EXTRACTED_DATA:\s*({[\s\S]*?})/);
    if (extractedMatch) {
      try {
        extractedData = JSON.parse(extractedMatch[1]);
      } catch (e) {
        console.error('Failed to parse extracted data:', e);
      }
    }

    // Remove the EXTRACTED_DATA section from the user-facing message
    const cleanMessage = aiMessage.replace(/EXTRACTED_DATA:[\s\S]*$/, '').trim();

    const responseData: ChatResponse = {
      message: cleanMessage,
    };

    if (extractedData) {
      responseData.extractedData = extractedData;
    }

    // Log for debugging (no PHI in logs for HIPAA)
    console.log('Chat request processed', {
      userId: userId || 'anonymous',
      messageCount: messages.length,
      hasExtractedData: !!extractedData,
    });

    res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Chat function error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to process chat request',
    });
  }
}
);
