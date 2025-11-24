import { InventoryItem, InventoryLog } from '../types';

const ITEMS_KEY = 'sim_inventory_items';
const LOGS_KEY = 'sim_inventory_logs';

export const getItems = (): InventoryItem[] => {
  try {
    const data = localStorage.getItem(ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load items', e);
    return [];
  }
};

export const saveItems = (items: InventoryItem[]) => {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save items', e);
  }
};

export const getLogs = (): InventoryLog[] => {
  try {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load logs', e);
    return [];
  }
};

export const saveLogs = (logs: InventoryLog[]) => {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs', e);
  }
};

export const clearAllData = () => {
  localStorage.removeItem(ITEMS_KEY);
  localStorage.removeItem(LOGS_KEY);
};