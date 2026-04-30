import { getAI, getGenerativeModel, VertexAIBackend } from "firebase/ai";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  writeBatch,
  type DocumentReference,
} from "firebase/firestore";
import { app, db } from "../config/firebase";

export type MinervaMessageRole = "user" | "assistant";

export interface MinervaChatMessage {
  role: MinervaMessageRole;
  content: string;
}

export interface SaveMinervaExchangeInput {
  sessionId: string | null;
  userId?: string;
  userMessage: MinervaChatMessage;
  assistantMessage: MinervaChatMessage;
}

const ai = getAI(app, { backend: new VertexAIBackend("us-central1") });

export const minervaSystemInstruction = `You are Minerva, True Legal's legal assistant for the website chat widget.

Your job is to help visitors understand general legal concepts, think through next steps, and decide what information may be useful to gather before speaking with an attorney.

Rules:
- Be professional, concise, and practical.
- Do not claim to be a lawyer and do not create an attorney-client relationship.
- Do not provide definitive legal advice, predictions, or guarantees.
- Ask one focused follow-up question when more context is needed.
- For urgent deadlines, safety risks, criminal exposure, or active court matters, recommend speaking with a licensed attorney promptly.
- Keep the conversation in normal chat prose. Do not output intake JSON or structured extraction blocks.`;

export const minervaModel = getGenerativeModel(ai, {
  model: "gemini-2.5-flash-lite",
  systemInstruction: minervaSystemInstruction,
  generationConfig: {
    maxOutputTokens: 1024,
    temperature: 0.4,
    topP: 0.9,
  },
});

export async function saveMinervaExchange({
  sessionId,
  userId,
  userMessage,
  assistantMessage,
}: SaveMinervaExchangeInput): Promise<string> {
  const sessionRef = await getOrCreateSession(sessionId, userId);
  const batch = writeBatch(db);
  const messagesRef = collection(sessionRef, "messages");

  batch.set(doc(messagesRef), {
    ...userMessage,
    createdAt: serverTimestamp(),
  });

  batch.set(doc(messagesRef), {
    ...assistantMessage,
    createdAt: serverTimestamp(),
  });

  batch.update(sessionRef, {
    lastMessage: assistantMessage.content,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return sessionRef.id;
}

async function getOrCreateSession(
  sessionId: string | null,
  userId?: string
): Promise<DocumentReference> {
  if (sessionId) {
    return doc(db, "minervaChats", sessionId);
  }

  const sessionRef = await addDoc(collection(db, "minervaChats"), {
    agent: "minerva",
    userId: userId ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(sessionRef, { id: sessionRef.id }, { merge: true });
  return sessionRef;
}
