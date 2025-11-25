<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 📦 Smart Inventory Manager

**AI搭載の次世代在庫管理システム** - Next.js × Supabase × Gemini AI

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.48-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

## ✨ 主な機能

- 🎯 **在庫管理**: 商品の登録・編集・削除、在庫数のリアルタイム更新
- 📥📤 **入出庫管理**: 入庫・出庫操作の記録と履歴管理
- 📅 **カレンダー表示**: 入出庫履歴をカレンダー形式で可視化
- 🤖 **AIチャット**: Gemini AIによる在庫状況の自然言語クエリ
- 🔐 **認証機能**: Supabase Auth（Email/Password）によるセキュアな認証
- 📱 **レスポンシブ対応**: モバイル・タブレット・デスクトップ完全対応
- 🚀 **Vercel最適化**: 本番環境でのゼロダウンタイムデプロイ

## 🛠 技術スタック

### フロントエンド
- **Next.js 15.1** (App Router)
- **React 19**
- **TypeScript 5.8**
- **Tailwind CSS 3.4**

### バックエンド
- **Supabase** (PostgreSQL + Auth + RLS)
- **Next.js API Routes** (サーバーサイド処理)
- **@supabase/ssr** (セッション管理)

### AI
- **Google Gemini 2.0 Flash** (自然言語処理)

### インフラ
- **Vercel** (ホスティング & CI/CD)

## 🚀 クイックスタート

### 前提条件

- Node.js 18.17.0以上
- npm 9.0.0以上

### 1. リポジトリをクローン

```bash
git clone https://github.com/your-username/kawaguchi.git
cd kawaguchi
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env.local` ファイルを作成：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Supabaseセットアップ

`supabase-schema.sql` の内容をSupabase SQL Editorで実行

### 5. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開く

## 📖 デプロイガイド

本番環境へのデプロイ手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

## 📁 プロジェクト構造

```
kawaguchi/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── ai/              # Gemini AI統合
│   │   ├── auth/            # 認証コールバック
│   │   └── data/            # CRUD操作
│   ├── login/               # ログインページ
│   ├── signup/              # 新規登録ページ
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # メインダッシュボード
│   └── globals.css          # グローバルスタイル
├── components/              # Reactコンポーネント
│   ├── AIChat.tsx
│   ├── Button.tsx
│   ├── CalendarView.tsx
│   ├── InventoryList.tsx
│   └── Modal.tsx
├── lib/                     # ユーティリティ
│   ├── auth-context.tsx     # 認証コンテキスト
│   ├── supabase.ts          # Supabaseクライアント
│   └── types.ts             # 型定義
├── middleware.ts            # 認証ミドルウェア
├── supabase-schema.sql      # データベーススキーマ
└── DEPLOYMENT.md            # デプロイガイド
```

## 🔐 セキュリティ

- ✅ **Row Level Security (RLS)**: ユーザーは自分のデータのみアクセス可能
- ✅ **サーバーサイドAPI**: クライアントから直接DBアクセス不可
- ✅ **環境変数管理**: 機密情報はVercelで暗号化保存

## 🤝 コントリビューション

プルリクエストを歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License

## 📞 サポート

問題が発生した場合は、[Issue](https://github.com/your-username/kawaguchi/issues)を作成してください。

---

Made with ❤️ using Next.js, Supabase, and Gemini AI
