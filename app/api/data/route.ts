import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'items' or 'logs'

    if (type === 'items') {
      // 在庫アイテムを取得
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data })
    } else if (type === 'logs') {
      // 入出庫ログを取得
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('*')
        .order('date', { ascending: false })
        .limit(100) // 最新100件

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data })
    } else if (type === 'chat') {
      // チャット履歴を取得
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50) // 最新50件

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('GET /api/data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, action, data: itemData } = body

    if (type === 'item') {
      if (action === 'create') {
        // 新規在庫アイテム作成
        const { data, error } = await supabase
          .from('inventory_items')
          .insert({
            user_id: user.id,
            name: itemData.name,
            code: itemData.code,
            quantity: itemData.quantity || 0,
            location: itemData.location || '',
            image_url: itemData.imageUrl || null,
            last_in_date: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          // 重複コードエラーチェック
          if (error.code === '23505') {
            return NextResponse.json(
              { error: 'この商品コードは既に登録されています' },
              { status: 400 }
            )
          }
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data })
      } else if (action === 'update') {
        // 在庫アイテム更新
        const { data, error } = await supabase
          .from('inventory_items')
          .update({
            name: itemData.name,
            code: itemData.code,
            quantity: itemData.quantity,
            location: itemData.location,
            image_url: itemData.imageUrl,
          })
          .eq('id', itemData.id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data })
      } else if (action === 'delete') {
        // 在庫アイテム削除
        const { error } = await supabase
          .from('inventory_items')
          .delete()
          .eq('id', itemData.id)
          .eq('user_id', user.id)

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
      }
    } else if (type === 'stock') {
      // 入出庫操作
      const isAdd = action === 'add'
      const itemId = itemData.itemId
      const quantity = itemData.quantity

      // 現在の在庫情報を取得
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !currentItem) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }

      // 出庫時の在庫チェック
      if (!isAdd && currentItem.quantity < quantity) {
        return NextResponse.json(
          { error: '在庫数が不足しています' },
          { status: 400 }
        )
      }

      const newQuantity = isAdd
        ? currentItem.quantity + quantity
        : currentItem.quantity - quantity

      const now = new Date().toISOString()

      // 在庫数を更新
      const updateData: { quantity: number; last_in_date?: string; last_out_date?: string } = {
        quantity: newQuantity
      }
      if (isAdd) {
        updateData.last_in_date = now
      } else {
        updateData.last_out_date = now
      }

      const { data: updatedItem, error: updateError } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', itemId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // ログを記録
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert({
          user_id: user.id,
          item_id: itemId,
          item_name: currentItem.name,
          type: isAdd ? 'in' : 'out',
          quantity: quantity,
          date: now,
        })

      if (logError) {
        console.error('Failed to create log:', logError)
        // ログ作成失敗しても処理は続行
      }

      return NextResponse.json({ data: updatedItem })
    } else if (type === 'chat') {
      // チャットメッセージ保存
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role: itemData.role,
          text: itemData.text,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'chat-all') {
      // チャット履歴を全削除
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('DELETE /api/data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
