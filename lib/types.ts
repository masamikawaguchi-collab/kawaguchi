// データベース型定義
export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  code: string;
  quantity: number;
  location: string;
  last_in_date: string | null;
  last_out_date: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryLog {
  id: string;
  user_id: string;
  item_id: string;
  item_name: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'model';
  text: string;
  created_at: string;
}

// フロントエンド表示用の型
export type ViewMode = 'list' | 'calendar' | 'chat';

export enum OperationType {
  ADD_STOCK = 'ADD_STOCK',
  REMOVE_STOCK = 'REMOVE_STOCK',
  CREATE_ITEM = 'CREATE_ITEM',
  EDIT_ITEM = 'EDIT_ITEM'
}
