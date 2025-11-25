'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { InventoryItem, InventoryLog, ViewMode, OperationType } from '@/lib/types'
import { InventoryList } from '@/components/InventoryList'
import { CalendarView } from '@/components/CalendarView'
import { AIChat } from '@/components/AIChat'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'

const DEMO_IMAGES = [
  'https://picsum.photos/id/1/200/200',
  'https://picsum.photos/id/20/200/200',
  'https://picsum.photos/id/36/200/200',
  'https://picsum.photos/id/48/200/200',
  'https://picsum.photos/id/60/200/200',
]

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<OperationType | null>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    quantity: 0,
    location: '',
    imageUrl: '',
  })
  const [opQuantity, setOpQuantity] = useState(0)

  // データ取得
  useEffect(() => {
    if (!authLoading && user) {
      fetchData()
    }
    // fetchData is stable, no need to include in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user])

  const fetchData = async () => {
    try {
      setDataLoading(true)
      const [itemsRes, logsRes] = await Promise.all([
        fetch('/api/data?type=items'),
        fetch('/api/data?type=logs'),
      ])

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        setItems(itemsData.data || [])
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setLogs(logsData.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      showNotification('error', 'データの取得に失敗しました')
    } finally {
      setDataLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const generateDemoData = async () => {
    if (isDemoLoading) return
    setIsDemoLoading(true)

    // デモデータ生成ロジック（簡略版）
    const demoItems: InventoryItem[] = Array.from({ length: 15 }).map((_, i) => ({
      id: `demo-${i}`,
      user_id: user?.id || '',
      name: `商品サンプル ${String.fromCharCode(65 + i)}`,
      code: `CODE-${1000 + i}`,
      quantity: Math.floor(Math.random() * 100),
      location: `棚番 ${Math.floor(i / 5) + 1}-${(i % 5) + 1}`,
      image_url: DEMO_IMAGES[i % DEMO_IMAGES.length],
      last_in_date: new Date().toISOString(),
      last_out_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    // API経由でデモデータを作成
    try {
      for (const item of demoItems) {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'item',
            action: 'create',
            data: {
              name: item.name,
              code: item.code,
              quantity: item.quantity,
              location: item.location,
              imageUrl: item.image_url,
            },
          }),
        })
      }

      await fetchData()
      showNotification('success', 'デモデータの挿入が完了しました')
    } catch (error) {
      showNotification('error', 'デモデータの挿入に失敗しました')
    } finally {
      setIsDemoLoading(false)
    }
  }

  const openModal = (mode: OperationType, item?: InventoryItem) => {
    setModalMode(mode)
    setSelectedItem(item || null)
    setOpQuantity(0)

    if (mode === OperationType.CREATE_ITEM) {
      setFormData({ name: '', code: '', quantity: 0, location: '', imageUrl: '' })
    } else if (item && mode === OperationType.EDIT_ITEM) {
      setFormData({
        name: item.name,
        code: item.code,
        quantity: item.quantity,
        location: item.location,
        imageUrl: item.image_url || '',
      })
    }

    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalMode(null)
    setSelectedItem(null)
  }

  const handleSaveItem = async () => {
    if (!formData.name || !formData.code) {
      showNotification('error', '商品名と商品コードは必須です')
      return
    }
    if (formData.quantity < 0) {
      showNotification('error', '在庫数は0以上である必要があります')
      return
    }

    try {
      const action = modalMode === OperationType.CREATE_ITEM ? 'create' : 'update'
      const body = {
        type: 'item',
        action,
        data: {
          ...formData,
          imageUrl: formData.imageUrl,
          ...(action === 'update' && selectedItem ? { id: selectedItem.id } : {}),
        },
      }

      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || '保存に失敗しました')
      }

      await fetchData()
      showNotification('success', action === 'create' ? '在庫情報を登録しました' : '在庫情報を更新しました')
      closeModal()
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : '保存に失敗しました')
    }
  }

  const handleStockOperation = async () => {
    if (opQuantity <= 0) {
      showNotification('error', '数量は1以上を入力してください')
      return
    }
    if (!selectedItem) return

    const isAdd = modalMode === OperationType.ADD_STOCK

    if (!isAdd && selectedItem.quantity < opQuantity) {
      showNotification('error', '在庫数が不足しています')
      return
    }

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'stock',
          action: isAdd ? 'add' : 'remove',
          data: {
            itemId: selectedItem.id,
            quantity: opQuantity,
          },
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || '操作に失敗しました')
      }

      await fetchData()
      showNotification('success', isAdd ? '入庫情報を登録しました' : '出庫情報を登録しました')
      closeModal()
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : '操作に失敗しました')
    }
  }

  const handleDelete = async (item: InventoryItem) => {
    if (!window.confirm('この在庫情報を削除してもよろしいですか？')) return

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          action: 'delete',
          data: { id: item.id },
        }),
      })

      if (!res.ok) {
        throw new Error('削除に失敗しました')
      }

      await fetchData()
      showNotification('success', '在庫情報を削除しました')
    } catch (error) {
      showNotification('error', '削除に失敗しました')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'ファイルサイズは5MB以下にしてください')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center text-primary-600 font-bold text-xl">
                <svg className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Smart Inventory
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <button
                  onClick={() => setCurrentView('list')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'list' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  在庫一覧
                </button>
                <button
                  onClick={() => setCurrentView('calendar')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'calendar' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  カレンダー
                </button>
                <button
                  onClick={() => setCurrentView('chat')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'chat' ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  AIチャット
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={generateDemoData} isLoading={isDemoLoading} className="text-xs">
                デモデータ挿入
              </Button>
              <Button onClick={() => openModal(OperationType.CREATE_ITEM)}>+ 新規追加</Button>
              <button
                onClick={handleSignOut}
                className="ml-2 text-sm text-gray-600 hover:text-gray-900"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="sm:hidden flex justify-around border-t border-gray-200 bg-gray-50 py-2">
          <button onClick={() => setCurrentView('list')} className={`text-xs p-2 ${currentView === 'list' ? 'text-primary-600 font-bold' : 'text-gray-500'}`}>
            一覧
          </button>
          <button onClick={() => setCurrentView('calendar')} className={`text-xs p-2 ${currentView === 'calendar' ? 'text-primary-600 font-bold' : 'text-gray-500'}`}>
            カレンダー
          </button>
          <button onClick={() => setCurrentView('chat')} className={`text-xs p-2 ${currentView === 'chat' ? 'text-primary-600 font-bold' : 'text-gray-500'}`}>
            AIチャット
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded shadow-lg text-white ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } transition-opacity duration-500`}
        >
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentView === 'list' && (
          <InventoryList
            items={items}
            onEdit={(item) => openModal(OperationType.EDIT_ITEM, item)}
            onAddStock={(item) => openModal(OperationType.ADD_STOCK, item)}
            onRemoveStock={(item) => openModal(OperationType.REMOVE_STOCK, item)}
            onDelete={handleDelete}
          />
        )}
        {currentView === 'calendar' && <CalendarView logs={logs} />}
        {currentView === 'chat' && <AIChat inventory={items} logs={logs} />}
      </main>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalMode === OperationType.CREATE_ITEM
            ? '新規在庫登録'
            : modalMode === OperationType.EDIT_ITEM
            ? '在庫情報編集'
            : modalMode === OperationType.ADD_STOCK
            ? `入庫登録: ${selectedItem?.name}`
            : modalMode === OperationType.REMOVE_STOCK
            ? `出庫登録: ${selectedItem?.name}`
            : ''
        }
        footer={
          <>
            <Button
              variant={modalMode === OperationType.REMOVE_STOCK ? 'danger' : 'primary'}
              onClick={modalMode === OperationType.CREATE_ITEM || modalMode === OperationType.EDIT_ITEM ? handleSaveItem : handleStockOperation}
            >
              {modalMode === OperationType.CREATE_ITEM
                ? '登録'
                : modalMode === OperationType.EDIT_ITEM
                ? '保存'
                : modalMode === OperationType.ADD_STOCK
                ? '入庫実行'
                : '出庫実行'}
            </Button>
            <Button variant="outline" onClick={closeModal} className="mr-3 sm:mr-0 sm:ml-3">
              キャンセル
            </Button>
          </>
        }
      >
        {(modalMode === OperationType.CREATE_ITEM || modalMode === OperationType.EDIT_ITEM) && (
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                商品名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 border p-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  商品コード <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 border p-2"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={modalMode === OperationType.EDIT_ITEM}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">現在庫数</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 border p-2"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">保管場所</label>
              <input
                type="text"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 border p-2"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="例: 棚番 A-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">商品画像</label>
              <div className="mt-1 flex items-center">
                {formData.imageUrl ? (
                  <div className="relative h-20 w-20 mr-4">
                    <img src={formData.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded" />
                    <button
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 mr-4 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                  <span>画像をアップロード</span>
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
            {modalMode === OperationType.EDIT_ITEM && (
              <div className="pt-4 border-t">
                <button
                  onClick={() => {
                    if (selectedItem) {
                      closeModal()
                      handleDelete(selectedItem)
                    }
                  }}
                  className="text-red-600 text-sm hover:underline"
                >
                  この在庫を削除する
                </button>
              </div>
            )}
          </div>
        )}

        {(modalMode === OperationType.ADD_STOCK || modalMode === OperationType.REMOVE_STOCK) && (
          <div className="text-center py-4">
            <div className={`text-6xl font-bold mb-4 ${modalMode === OperationType.ADD_STOCK ? 'text-blue-600' : 'text-orange-600'}`}>
              {modalMode === OperationType.ADD_STOCK ? '+' : '-'} {opQuantity}
            </div>
            <div className="flex justify-center items-center space-x-4">
              <button onClick={() => setOpQuantity(Math.max(0, opQuantity - 1))} className="w-10 h-10 rounded-full bg-gray-200 text-xl font-bold hover:bg-gray-300">
                -
              </button>
              <input
                type="number"
                min="1"
                value={opQuantity}
                onChange={(e) => setOpQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 text-center text-2xl border-b-2 border-gray-300 focus:border-primary-500 outline-none"
              />
              <button onClick={() => setOpQuantity(opQuantity + 1)} className="w-10 h-10 rounded-full bg-gray-200 text-xl font-bold hover:bg-gray-300">
                +
              </button>
            </div>
            <p className="mt-4 text-gray-500">
              現在の在庫: {selectedItem?.quantity}
              {modalMode === OperationType.REMOVE_STOCK && (
                <span className={`ml-2 ${selectedItem && selectedItem.quantity < opQuantity ? 'text-red-500 font-bold' : ''}`}>
                  → {selectedItem ? selectedItem.quantity - opQuantity : 0}
                </span>
              )}
              {modalMode === OperationType.ADD_STOCK && <span className="ml-2">→ {selectedItem ? selectedItem.quantity + opQuantity : 0}</span>}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
