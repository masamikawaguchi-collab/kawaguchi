import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 認証が不要なパス
  const publicPaths = ['/login', '/signup']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // APIルートは別途認証チェックしているのでスキップ
  if (request.nextUrl.pathname.startsWith('/api')) {
    return supabaseResponse
  }

  // 環境変数チェック
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables not set')
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // セッション更新（重要: これがないと認証が維持されない）
  const { data: { user } } = await supabase.auth.getUser()

  // ログインページにアクセス済みのユーザーは/にリダイレクト
  if (isPublicPath && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 未認証ユーザーがプライベートページにアクセスしようとしたら/loginにリダイレクト
  if (!isPublicPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
