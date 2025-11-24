export interface InventoryItem {
  id: string;
  name: string; // 商品名
  code: string; // 商品コード
  quantity: number; // 在庫数
  location: string; // 保管場所
  lastInDate?: string; // 最新入庫日 (ISO string)
  lastOutDate?: string; // 最新出庫日 (ISO string)
  imageUrl?: string; // 商品画像URL (Base64 or HTTP URL)
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out'; // 入庫 | 出庫
  quantity: number;
  date: string; // ISO string
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ViewMode = 'list' | 'calendar' | 'chat';

export enum OperationType {
  ADD_STOCK = 'ADD_STOCK',
  REMOVE_STOCK = 'REMOVE_STOCK',
  CREATE_ITEM = 'CREATE_ITEM',
  EDIT_ITEM = 'EDIT_ITEM'
}