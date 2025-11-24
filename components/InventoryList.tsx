'use client'

import React, { useState, useMemo } from 'react'
import { InventoryItem } from '@/lib/types'
import { Button } from './Button'

interface InventoryListProps {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onAddStock: (item: InventoryItem) => void
  onRemoveStock: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
}

export const InventoryList: React.FC<InventoryListProps> = ({ items, onEdit, onAddStock, onRemoveStock, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: keyof InventoryItem; direction: 'asc' | 'desc' } | null>(null)

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [items, searchTerm])

  const sortedItems = useMemo(() => {
    let sortableItems = [...filteredItems]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]

        if (aVal === undefined || aVal === null || bVal === undefined || bVal === null) return 0

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableItems
  }, [filteredItems, sortConfig])

  const requestSort = (key: keyof InventoryItem) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const SortIcon = ({ columnKey }: { columnKey: keyof InventoryItem }) => {
    if (sortConfig?.key !== columnKey) return <span className="ml-1 text-gray-400">↕</span>
    return <span className="ml-1 text-primary-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 justify-between items-center">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
            placeholder="商品名、コード、場所で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">全 {filteredItems.length} 件</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">画像</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => requestSort('name')}>
                商品名 <SortIcon columnKey="name" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => requestSort('code')}>
                コード <SortIcon columnKey="code" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => requestSort('quantity')}>
                在庫数 <SortIcon columnKey="quantity" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => requestSort('location')}>
                保管場所 <SortIcon columnKey="location" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最新入出庫</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  該当する在庫は見つかりませんでした。
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-10 w-10 rounded bg-gray-200 overflow-hidden border border-gray-200 flex items-center justify-center">
                      {item.image_url ? <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" /> : <span className="text-xs text-gray-400">No Img</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    <div>入: {item.last_in_date ? new Date(item.last_in_date).toLocaleDateString() : '-'}</div>
                    <div>出: {item.last_out_date ? new Date(item.last_out_date).toLocaleDateString() : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => onAddStock(item)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded">
                      入庫
                    </button>
                    <button onClick={() => onRemoveStock(item)} className="text-orange-600 hover:text-orange-900 bg-orange-50 px-2 py-1 rounded">
                      出庫
                    </button>
                    <button onClick={() => onEdit(item)} className="text-gray-600 hover:text-gray-900 px-2 py-1">
                      編集
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
