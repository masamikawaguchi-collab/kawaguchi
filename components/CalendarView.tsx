import React, { useState } from 'react';
import { InventoryLog } from '../types';

interface CalendarViewProps {
  logs: InventoryLog[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ logs }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Helper to get days in month
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  // Empty slots for previous month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const getLogsForDate = (date: Date) => {
    return logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getDate() === date.getDate() &&
             logDate.getMonth() === date.getMonth() &&
             logDate.getFullYear() === date.getFullYear();
    });
  };

  const renderDayCell = (date: Date | null, index: number) => {
    if (!date) return <div key={`empty-${index}`} className="h-24 bg-gray-50 border border-gray-100"></div>;

    const dayLogs = getLogsForDate(date);
    const inCount = dayLogs.filter(l => l.type === 'in').length;
    const outCount = dayLogs.filter(l => l.type === 'out').length;
    const isToday = new Date().toDateString() === date.toDateString();

    return (
      <div 
        key={date.toISOString()} 
        onClick={() => setSelectedDate(date)}
        className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-blue-50 transition-colors flex flex-col ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
      >
        <div className={`text-right text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
          {date.getDate()}
        </div>
        <div className="flex-grow flex flex-col gap-1 overflow-hidden">
          {inCount > 0 && (
            <div className="text-xs bg-green-100 text-green-800 px-1 rounded truncate">
              入: {inCount}件
            </div>
          )}
          {outCount > 0 && (
            <div className="text-xs bg-orange-100 text-orange-800 px-1 rounded truncate">
              出: {outCount}件
            </div>
          )}
        </div>
      </div>
    );
  };

  const selectedLogs = selectedDate ? getLogsForDate(selectedDate) : [];

  return (
    <div className="bg-white shadow rounded-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {year}年 {month + 1}月
        </h2>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
            ← 前月
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
            今日
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
            翌月 →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 mb-6">
        {['日', '月', '火', '水', '木', '金', '土'].map(d => (
          <div key={d} className="text-center font-medium text-gray-500 text-sm py-2 border-b">
            {d}
          </div>
        ))}
        {days.map((d, i) => renderDayCell(d, i))}
      </div>

      {/* Detail Panel (Basic implementation of "click a date to see list") */}
      {selectedDate && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-bold text-lg mb-2">
            {selectedDate.toLocaleDateString()} の入出庫履歴
          </h3>
          {selectedLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">履歴はありません。</p>
          ) : (
            <div className="space-y-2">
              {selectedLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded mr-3 ${log.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {log.type === 'in' ? '入庫' : '出庫'}
                    </span>
                    <span className="font-medium">{log.itemName}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">{log.quantity}</span> 個
                    <span className="ml-3 text-xs text-gray-400">{new Date(log.date).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};