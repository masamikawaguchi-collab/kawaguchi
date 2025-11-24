import { GoogleGenAI } from "@google/genai";
import { InventoryItem, InventoryLog } from "../types";

// Initialize the AI client
// The API key must be provided via environment variable in a real build, 
// or injected by the preview environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const sendInventoryQuery = async (
  question: string,
  inventory: InventoryItem[],
  logs: InventoryLog[]
): Promise<string> => {
  try {
    // Create a structured context for the AI
    const currentInventorySummary = inventory.map(item => 
      `- 商品名: ${item.name} (コード: ${item.code}), 在庫数: ${item.quantity}, 保管場所: ${item.location}, 最新入庫: ${item.lastInDate || 'なし'}, 最新出庫: ${item.lastOutDate || 'なし'}`
    ).join('\n');

    // Get recent logs (last 10)
    const recentLogsSummary = logs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(log => `- ${new Date(log.date).toLocaleDateString()} ${log.type === 'in' ? '入庫' : '出庫'}: ${log.itemName} (${log.quantity}個)`)
      .join('\n');

    const systemInstruction = `
      あなたは倉庫管理システムのAIアシスタントです。
      ユーザーは倉庫の作業員または管理者です。
      以下の「現在の在庫データ」と「最近の入出庫履歴」をもとに、ユーザーの質問に日本語で丁寧に答えてください。
      
      【現在の在庫データ】
      ${currentInventorySummary || 'データなし'}

      【最近の入出庫履歴】
      ${recentLogsSummary || 'データなし'}

      回答のルール:
      1. 常に丁寧な「です・ます」調を使ってください。
      2. 具体的な数字（在庫数など）を聞かれた場合は、提供されたデータに基づいて正確に答えてください。
      3. データにない商品について聞かれた場合は、「その商品のデータは見当たりません」と正直に答えてください。
      4. 在庫不足（0個）の商品がある場合は、注意喚起をしてください。
      5. JSON形式ではなく、自然な会話文で返答してください。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5, // Keep it relatively factual
      }
    });

    return response.text || "申し訳ありません。回答を生成できませんでした。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "申し訳ありません。AIサービスの接続に失敗しました。時間をおいて再度お試しください。";
  }
};