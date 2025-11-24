# Smart Inventory Manager - セットアップガイド

## 📋 概要

このプロジェクトは、**Supabase**（データベース）と**Gemini API**（AI機能）を使用した在庫管理システムです。**Vercel**で簡単にデプロイできます。

## 🚀 セットアップ手順

### 1. Supabaseのセットアップ

#### 1.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. データベースパスワードを設定（必ず保存してください）

#### 1.2 データベースの初期化

1. Supabaseダッシュボードの左側メニューから「SQL Editor」を選択
2. `supabase-setup.sql`ファイルの内容を全てコピー
3. SQL Editorに貼り付けて「Run」をクリック

これで以下のテーブルが作成されます：
- `inventory_items` - 在庫アイテム
- `inventory_logs` - 入出庫履歴
- `chat_messages` - AIチャット履歴

#### 1.3 Supabase認証の設定

1. Supabaseダッシュボードの左側メニューから「Authentication」→「Providers」を選択
2. 「Email」プロバイダーが有効になっていることを確認
3. 「Email Confirm」をオフにする（開発時のみ。本番環境では有効にすることを推奨）

#### 1.4 Supabase環境変数の取得

1. Supabaseダッシュボードの左側メニューから「Settings」→「API」を選択
2. 以下の値をメモしてください：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Gemini APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey)にアクセス
2. Googleアカウントでログイン
3. 「Get API Key」ボタンをクリック
4. 新しいAPIキーを作成
5. APIキーをコピーして保存 → `GEMINI_API_KEY`

### 3. Vercelへのデプロイ

#### 3.1 GitHubへのプッシュ

```bash
git add .
git commit -m "feat: Setup Next.js with Supabase and Gemini AI"
git push origin main
```

#### 3.2 Vercelでのデプロイ

1. [Vercel](https://vercel.com/)にアクセスしてアカウントを作成
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. 「Import」をクリック

#### 3.3 環境変数の設定

Vercelのプロジェクト設定画面で「Environment Variables」を選択し、以下の環境変数を追加してください：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | SupabaseプロジェクトのURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabaseの匿名キー |
| `GEMINI_API_KEY` | `AIzaSyC...` | Gemini APIキー |

**注意:**
- `NEXT_PUBLIC_`で始まる変数はクライアント側でも使用されます
- `GEMINI_API_KEY`は**サーバーサイドのみ**で使用され、ブラウザには公開されません

#### 3.4 デプロイの実行

1. 「Deploy」ボタンをクリック
2. デプロイが完了するまで待ちます（通常2〜3分）
3. デプロイが完了したら、URLをクリックしてアプリケーションにアクセス

## ✅ 動作確認

1. デプロイされたURLにアクセス
2. 「アカウント登録」からユーザーを作成
3. メールを確認してアカウントを有効化（Email Confirmをオフにした場合は不要）
4. ログインしてダッシュボードにアクセス
5. 「デモデータ挿入」ボタンをクリックしてサンプルデータを追加
6. AIチャット機能で「在庫数が少ない商品は？」などと質問してみる

## 🔒 セキュリティ

- **Row Level Security (RLS)**: 全てのテーブルでRLSが有効になっており、ユーザーは自分のデータのみにアクセスできます
- **API Routes**: Gemini APIキーとSupabaseのシークレットキーはサーバーサイドでのみ使用され、ブラウザには公開されません
- **認証**: Supabase Authを使用して安全にユーザー認証を行います

## 📝 トラブルシューティング

### データベース接続エラー

- Supabaseの環境変数が正しく設定されているか確認
- SupabaseプロジェクトのURLが正しいか確認

### Gemini API エラー

- Gemini APIキーが正しく設定されているか確認
- Gemini APIの利用制限に達していないか確認

### ログインできない

- Supabase AuthenticationでEmailプロバイダーが有効になっているか確認
- Email Confirmの設定を確認

## 🛠 ローカル開発

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.localファイルを編集して環境変数を設定

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## 📚 その他

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Supabase ドキュメント](https://supabase.com/docs)
- [Gemini API ドキュメント](https://ai.google.dev/docs)

---

セットアップでお困りの場合は、プロジェクトのIssueを作成してください。
