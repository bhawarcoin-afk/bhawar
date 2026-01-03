import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GoogleGenAI, Chat } from '@google/genai';
import { CoinInfo } from '../types/coin-info';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private http = inject(HttpClient);
  private ai: GoogleGenAI;
  private apiKey: string;
  public loading = signal(false);
  public error = signal<string | null>(null);

  constructor() {
    this.apiKey = (window as any).process?.env?.API_KEY;
    if (!this.apiKey) {
      const errorMsg = 'API key is not configured. Please set the API_KEY environment variable.';
      console.error(errorMsg);
      this.error.set(errorMsg);
      this.ai = {} as GoogleGenAI; // Prevent crash
    } else {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  async identifyCoin(
    obverseImageBase64: string,
    reverseImageBase64: string,
    localPredictionHint?: string | null
  ): Promise<CoinInfo | null> {
    if (this.error()) {
      return null;
    }
    this.loading.set(true);
    this.error.set(null);

    let systemInstruction = `You are a world-class numismatist specializing in Indian coinage from 1100 AD to the present, including British India, Republic India, the Mughal Empire, Sultanates, and Princely States.
Analyze the provided obverse and reverse images of a coin.
Provide a detailed analysis in a JSON object format. The JSON object must be the only content in your response, with no extra text or markdown formatting like \`\`\`json.
Your analysis MUST include up-to-date market value information obtained from your web search knowledge.

CRITICAL: MINT MARK IDENTIFICATION
For Republic India and British India coins, you MUST identify the Mint Mark to determine the Mint location accurately.
1. Republic India (1950-Present): Look BELOW the date.
   - Diamond (◆) or 'B' or 'M' = Mumbai
   - No Mark = Kolkata
   - Star (★) = Hyderabad
   - Round Dot (●) = Noida (only if year >= 1988)

2. British India (1835-1947): 
   - Queen Victoria (1862-1901): Mint marks can be tiny dots in the floral design on the reverse.
   - George V & VI: Look below the date or lotus flower.
   - Lahore Mint: Look for 'L'.
   - Pretoria Mint (1943-45): Look for dot below date on some issues.

If you identify a mint mark, describe it specifically in the 'mintMarkDescription' field (e.g., "Small dot below the year 1998 indicating Noida mint", or "No mint mark present below date, indicating Kolkata mint").

The JSON object structure must be: { name: string, era: string, category: 'British India' | 'Republic India' | 'Mughal Empire' | 'Sultanates' | 'Princely States' | 'Other', year: string, mint: string, mintMarkDescription: string, estimatedValue: string, obverseDescription: string, reverseDescription: string, material: string, weight: string, diameter: string, shape: string, errorTypes: string[], historicalContext: string }`;
    
    if (localPredictionHint) {
      systemInstruction += `\n\nA local on-device model has provided a preliminary identification of this coin as "${localPredictionHint}". Please verify this identification using the provided images and your expert knowledge. If the local model is correct, confirm it and provide the detailed analysis. If it is incorrect, please provide the correct identification and analysis.`;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: obverseImageBase64 } },
            { inlineData: { mimeType: 'image/jpeg', data: reverseImageBase64 } },
          ],
        },
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      let jsonText = response.text.trim();
      // Clean potential markdown fences
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      
      const coinInfo = JSON.parse(jsonText) as CoinInfo;
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        coinInfo.sources = groundingMetadata.groundingChunks
          .map((chunk: any) => chunk.web)
          .filter((source: any) => source && source.uri && source.title);
      }

      return coinInfo;

    } catch (e: any) {
      console.error('Error identifying coin:', e);
      this.error.set(`Failed to identify the coin. The AI response might be malformed. Error: ${e.message}`);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  startChat(initialContext: string): Chat {
    return this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are a helpful numismatist chatbot. You are having a conversation about the following coin: ${initialContext}. Answer the user's questions concisely and accurately based on this context and your general knowledge.`,
      }
    });
  }

  sendMessageStream(chat: Chat, message: string) {
    return chat.sendMessageStream({ message });
  }

  async generateSpeech(text: string): Promise<string | null> {
     if (!this.apiKey) {
      this.error.set('API key is not configured for TTS.');
      return null;
    }

    // NOTE: This uses a hypothetical endpoint as per the user's instructions.
    // The official API and model name may differ.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:synthesizeSpeech?key=${this.apiKey}`;
    const body = { text };

    try {
      const response = await firstValueFrom(this.http.post<{ audioContent: string }>(url, body));
      return response.audioContent;
    } catch (e: any) {
      console.error('Error generating speech:', e);
      this.error.set(`Failed to generate speech. Error: ${e.message}`);
      return null;
    }
  }
}