import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { question, inventory, logs } = body

    if (!question || !inventory || !logs) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Gemini API キーチェック
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Gemini APIクライアント初期化
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // コンテキスト作成
    const currentInventorySummary = inventory
      .map(
        (item: any) =>
          `- 商品名: ${item.name} (コード: ${item.code}), 在庫数: ${item.quantity}, 保管場所: ${item.location}, 最新入庫: ${item.last_in_date || 'なし'}, 最新出庫: ${item.last_out_date || 'なし'}`
      )
      .join('\n')

    const recentLogsSummary = logs
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(
        (log: any) =>
          `- ${new Date(log.date).toLocaleDateString()} ${log.type === 'in' ? '入庫' : '出庫'}: ${log.item_name} (${log.quantity}個)`
      )
      .join('\n')

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
    `

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: question }] }],
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1000,
      },
    })

    const response = result.response
    const text = response.text()

    if (!text) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }

    return NextResponse.json({ answer: text })
  } catch (error: any) {
    console.error('POST /api/ai error:', error)

    // Gemini APIエラーの詳細を返す
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid Gemini API key' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
