-- ====================================
-- Smart Inventory Manager - Database Setup
-- ====================================
-- このSQLをSupabaseのSQL Editorで実行してください
-- ====================================

-- 1. inventory_items テーブル（在庫アイテム）
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  location TEXT,
  last_in_date TIMESTAMPTZ,
  last_out_date TIMESTAMPTZ,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ユーザーごとに商品コードはユニーク
  UNIQUE(user_id, code)
);

-- inventory_itemsのインデックス
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_code ON inventory_items(user_id, code);

-- 2. inventory_logs テーブル（入出庫履歴）
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- inventory_logsのインデックス
CREATE INDEX IF NOT EXISTS idx_inventory_logs_user_id ON inventory_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_item_id ON inventory_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_date ON inventory_logs(date DESC);

-- 3. chat_messages テーブル（AIチャット履歴）
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- chat_messagesのインデックス
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ====================================
-- Row Level Security (RLS) ポリシー
-- ====================================

-- inventory_items のRLS有効化
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- inventory_items: SELECT ポリシー（自分のデータのみ閲覧可能）
CREATE POLICY "Users can view their own inventory items"
  ON inventory_items FOR SELECT
  USING (auth.uid() = user_id);

-- inventory_items: INSERT ポリシー（自分のデータのみ作成可能）
CREATE POLICY "Users can insert their own inventory items"
  ON inventory_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- inventory_items: UPDATE ポリシー（自分のデータのみ更新可能）
CREATE POLICY "Users can update their own inventory items"
  ON inventory_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- inventory_items: DELETE ポリシー（自分のデータのみ削除可能）
CREATE POLICY "Users can delete their own inventory items"
  ON inventory_items FOR DELETE
  USING (auth.uid() = user_id);

-- inventory_logs のRLS有効化
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- inventory_logs: SELECT ポリシー
CREATE POLICY "Users can view their own inventory logs"
  ON inventory_logs FOR SELECT
  USING (auth.uid() = user_id);

-- inventory_logs: INSERT ポリシー
CREATE POLICY "Users can insert their own inventory logs"
  ON inventory_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- inventory_logs: UPDATE ポリシー
CREATE POLICY "Users can update their own inventory logs"
  ON inventory_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- inventory_logs: DELETE ポリシー
CREATE POLICY "Users can delete their own inventory logs"
  ON inventory_logs FOR DELETE
  USING (auth.uid() = user_id);

-- chat_messages のRLS有効化
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- chat_messages: SELECT ポリシー
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

-- chat_messages: INSERT ポリシー
CREATE POLICY "Users can insert their own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- chat_messages: DELETE ポリシー
CREATE POLICY "Users can delete their own chat messages"
  ON chat_messages FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================
-- updated_at自動更新のトリガー関数
-- ====================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- inventory_itemsのupdated_at自動更新トリガー
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- 完了
-- ====================================
-- これでデータベースのセットアップは完了です！
