# 🚀 Smart Inventory Manager - Vercelデプロイガイド

このガイドに従えば、**Vercelで確実にビルドが通り、本番環境で正常に動作します**。

---

## 📋 前提条件

以下の準備が完了していることを確認してください：

- [x] GitHubアカウント
- [x] Vercelアカウント
- [x] Supabaseアカウント（無料プラン可）
- [x] Gemini API Key（Google AI Studioで取得）

---

## ステップ1: Supabaseプロジェクトのセットアップ

### 1.1 Supabaseプロジェクトを作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 「New Project」をクリック
3. プロジェクト名、データベースパスワード、リージョン（Tokyo推奨）を設定
4. 「Create new project」をクリック

### 1.2 データベーススキーマを実行

1. Supabase Dashboardの左メニューから「SQL Editor」を選択
2. `supabase-schema.sql` ファイルの内容をコピー
3. SQL Editorに貼り付けて「Run」をクリック
4. すべてのテーブルとRLSポリシーが作成されたことを確認

### 1.3 認証設定（Email/Password）

1. 左メニューから「Authentication」→「Providers」を選択
2. 「Email」プロバイダーが有効になっていることを確認
3. **重要:** 「Confirm email」をOFFにする（開発用）
   - `Settings` → `Auth` → `Email Auth` → `Enable email confirmations` をOFF

### 1.4 接続情報を取得

1. 左メニューから「Settings」→「API」を選択
2. 以下の情報をメモ：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` （長い文字列）

---

## ステップ2: Gemini API Keyの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. 「Create API Key」をクリック
3. 生成されたAPIキーをメモ

---

## ステップ3: Vercelへデプロイ

### 3.1 GitHubリポジトリをプッシュ

ローカルで以下を実行：

```bash
git add .
git commit -m "feat: Complete production-ready setup for Vercel deployment"
git push -u origin claude/fullstack-nextjs-vercel-01LYotb14pwDptKwpNpqk8LR
```

### 3.2 Vercelプロジェクトを作成

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. 「Add New」→「Project」をクリック
3. GitHubリポジトリを選択（`kawaguchi`）
4. 「Import」をクリック

### 3.3 環境変数を設定

「Environment Variables」セクションで以下を追加：

| Name | Value | 備考 |
|------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabaseから取得 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabaseから取得 |
| `GEMINI_API_KEY` | `AIzaSy...` | Google AI Studioから取得 |

**重要:**
- `NEXT_PUBLIC_` で始まる変数はクライアント側でも利用可能
- `GEMINI_API_KEY` はサーバーサイドでのみ利用（セキュアに保持）

### 3.4 デプロイ実行

1. 「Deploy」ボタンをクリック
2. ビルドログを確認
3. ✅ ビルド成功！デプロイ完了まで2-3分待機

---

## ステップ4: 動作確認

### 4.1 アプリにアクセス

デプロイが完了したら、Vercelが発行したURLにアクセス：

```
https://your-project-name.vercel.app
```

### 4.2 ユーザー登録

1. 「新規登録」をクリック
2. メールアドレスとパスワードを入力
3. ログイン画面にリダイレクトされる
4. 同じ認証情報でログイン

### 4.3 機能テスト

- [x] 在庫アイテムの新規作成
- [x] デモデータ挿入ボタン
- [x] 入庫/出庫操作
- [x] カレンダー表示
- [x] AIチャット機能

**AIチャット例:**
- 「在庫数が少ない商品は？」
- 「A123の在庫数は？」
- 「今週の入庫状況を教えて」

---

## 🔧 トラブルシューティング

### エラー: `NEXT_PUBLIC_SUPABASE_URL is not defined`

**原因:** 環境変数が設定されていない

**解決策:**
1. Vercel Dashboard → プロジェクト → Settings → Environment Variables
2. 上記の環境変数を再確認
3. 「Redeploy」を実行

### エラー: `Failed to fetch data`

**原因:** SupabaseのRLSポリシーが正しく設定されていない

**解決策:**
1. Supabase Dashboard → SQL Editor
2. `supabase-schema.sql` を再実行
3. RLSポリシーが正しく作成されているか確認

### エラー: `Gemini API key not configured`

**原因:** Gemini API Keyが設定されていない

**解決策:**
1. Vercel環境変数に `GEMINI_API_KEY` を追加
2. 「Redeploy」を実行

### ビルドエラー: `Module not found`

**原因:** `package.json` の依存関係不足

**解決策:**
1. ローカルで `npm install` を実行
2. `package.json` が最新であることを確認
3. 再度プッシュ & デプロイ

---

## 📊 本番運用のベストプラクティス

### セキュリティ

- ✅ RLSが有効化されているため、ユーザーは自分のデータのみアクセス可能
- ✅ Gemini API Keyはサーバーサイドでのみ利用
- ✅ 環境変数は暗号化されてVercelに保存

### パフォーマンス

- ✅ Next.js App Routerの静的生成を活用
- ✅ Tailwind CSSでCSSサイズを最小化
- ✅ Supabaseの接続プーリングで高速化

### スケーラビリティ

- ✅ Vercelの自動スケーリング
- ✅ Supabaseの無料プランで500MBまで対応
- ✅ 必要に応じてProプランへアップグレード可能

---

## 🎉 デプロイ完了！

おめでとうございます！アプリが本番環境で正常に動作しています。

**次のステップ:**
- カスタムドメインの設定（Vercel Dashboard → Domains）
- メール認証の有効化（Supabase → Auth Settings）
- Google Analytics等の分析ツール導入

---

## 📞 サポート

問題が発生した場合は、以下を確認してください：

- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Vercel公式ドキュメント](https://vercel.com/docs)

Happy Deploying! 🚀
