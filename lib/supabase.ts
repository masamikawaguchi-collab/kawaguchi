import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

// サーバー側で使用するSupabaseクライアント（環境変数から初期化）
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  return createClient(supabaseUrl, supabaseAnonKey)
}

// クライアント側で使用するSupabaseクライアント
export function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
