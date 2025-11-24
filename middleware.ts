import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()

  // 認証が不要なパス
  const publicPaths = ['/login', '/signup']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // APIルートは別途認証チェックしているのでスキップ
  if (request.nextUrl.pathname.startsWith('/api')) {
    return res
  }

  // 環境変数チェック
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables not set')
    return res
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // トークンの検証
  const { data: { user } } = await supabase.auth.getUser()

  // ログインページにアクセス済みのユーザーは/にリダイレクト
  if (isPublicPath && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 未認証ユーザーがプライベートページにアクセスしようとしたら/loginにリダイレクト
  if (!isPublicPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
