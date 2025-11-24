import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, InventoryItem, InventoryLog } from '../types';
import { sendInventoryQuery } from '../services/geminiService';
import { Button } from './Button';

interface AIChatProps {
  inventory: InventoryItem[];
  logs: InventoryLog[];
}

export const AIChat: React.FC<AIChatProps> = ({ inventory, logs }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'model', text: 'こんにちは。在庫に関する質問があればお答えします。「在庫数が少ない商品は？」「今週の入庫状況は？」などと聞いてみてください。', timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Call Gemini API
    const aiResponseText = await sendInventoryQuery(userText, inventory, logs);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: aiResponseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <h2 className="text-lg font-bold text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          AI在庫アシスタント
        </h2>
        <p className="text-xs text-blue-600 mt-1">現在の在庫データに基づいて回答します。</p>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] rounded-lg px-4 py-3 shadow-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 border border-gray-200 rounded-lg rounded-bl-none px-4 py-3 shadow-sm flex items-center">
              <span className="flex h-2 w-2 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              回答を生成しています...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例：A123の在庫数は？"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSend()}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !inputValue.trim()}
            className="px-6"
          >
            送信
          </Button>
        </div>
      </div>
    </div>
  );
};